// src/pages/LoginPage/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./Login.css";
import Footer from "../../components/Footer/Footer";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showGoogleProfileStep, setShowGoogleProfileStep] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const isGoogleUser = (user) => {
    if (!user) return false;
    if (user.app_metadata?.provider === "google") return true;
    return (user.identities || []).some(
      (identity) => identity.provider === "google",
    );
  };

  const isReturningGoogleUser = (user) => {
    if (!isGoogleUser(user)) return false;

    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
    const lastSignInAt = user.last_sign_in_at
      ? new Date(user.last_sign_in_at).getTime()
      : 0;

    if (!createdAt || !lastSignInAt) return false;

    return lastSignInAt - createdAt > 60000;
  };

  const needsGoogleProfileCompletion = (user) => {
    if (!isGoogleUser(user)) return false;
    if (isReturningGoogleUser(user)) return false;

    const fullNameValue =
      user.user_metadata?.full_name || user.user_metadata?.name || "";
    return !String(fullNameValue).trim();
  };

  const routeAuthenticatedUser = async (session) => {
    if (!session?.user) return;

    if (needsGoogleProfileCompletion(session.user)) {
      setShowGoogleProfileStep(true);
      setIsLogin(false);
      setIsReset(false);
      setEmail(session.user.email || "");
      setFullName(
        session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          "",
      );
      setPhone(session.user.user_metadata?.phone || "");
      setReferralCode(session.user.user_metadata?.referral_code || "");
      return;
    }

    setShowGoogleProfileStep(false);
    navigate("/admin/dashboard", { replace: true });
  };

  useEffect(() => {
    let mounted = true;

    const bootstrapSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted || !session) return;
      await routeAuthenticatedUser(session);
    };

    bootstrapSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session) {
        await routeAuthenticatedUser(session);
      }

      if (event === "SIGNED_OUT") {
        setShowGoogleProfileStep(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  useEffect(() => {
    setPasswordStrength(calculateStrength(password));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength >= 4) return "bg-green-500";
    if (passwordStrength >= 3) return "bg-yellow-500";
    if (passwordStrength >= 2) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStrengthText = () => {
    if (passwordStrength >= 4) return "Strong";
    if (passwordStrength >= 3) return "Good";
    if (passwordStrength >= 2) return "Fair";
    return "Weak";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (isReset) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/admin/reset-password",
        });
        if (error) throw error;
        setMessage("Check your email for the reset link!");
      } else if (!isLogin) {
        if (!acceptTerms) {
          setMessage("Please accept the Terms and Privacy Policy.");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setMessage("Passwords do not match");
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin/login`,
            data: {
              full_name: fullName,
              phone,
              referral_code: referralCode,
            },
          },
        });
        if (error) throw error;
        setMessage("Account created! Please check your email to confirm.");
        setTimeout(() => setIsLogin(true), 2500);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin/login`,
        skipBrowserRedirect: true,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      setMessage("Error: " + error.message);
      setLoading(false);
      return;
    }

    // Open Google auth in a small centered popup
    const width = 480;
    const height = 600;
    const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

    const popup = window.open(
      data.url,
      "google-auth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
      setMessage("Popup blocked. Please allow popups for this site and try again.");
      setLoading(false);
      return;
    }

    // Poll until the popup closes, then stop the loading spinner
    const pollClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollClosed);
        setLoading(false);
      }
    }, 500);
  };

  const handleGoogleProfileComplete = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!fullName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
          referral_code: referralCode.trim(),
        },
      });

      if (error) throw error;

      setShowGoogleProfileStep(false);
      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <button className="back-button" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left"></i>
          Back
        </button>

        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-logo">
              <img
                src="/assets/logo.png"
                alt="Nearbuy"
                className="logo-image"
              />
            </div>

            <h2 className="login-title">
              {showGoogleProfileStep
                ? "Complete Your Profile"
                : isReset
                  ? "Reset Your Password"
                  : isLogin
                    ? "Welcome Back"
                    : "Create Account"}
            </h2>

            <p className="login-subtitle">
              {showGoogleProfileStep
                ? "One last step before entering your dashboard"
                : isReset
                  ? "Enter your email to receive a reset link"
                  : isLogin
                    ? "Sign in to manage your listings"
                    : "Register with your email"}
            </p>

            {!isReset && !showGoogleProfileStep && (
              <>
                <button
                  type="button"
                  className="google-btn"
                  onClick={handleGoogleLogin}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    aria-hidden="true"
                  >
                    <path
                      fill="#4285F4"
                      d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"
                    />
                    <path
                      fill="#34A853"
                      d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"
                    />
                    <path
                      fill="#EA4335"
                      d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="form-divider">
                  <span>
                    {isLogin
                      ? "Or sign in with email"
                      : "Or register with email"}
                  </span>
                </div>
              </>
            )}

            {showGoogleProfileStep ? (
              <form
                onSubmit={handleGoogleProfileComplete}
                className="login-form"
              >
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-with-icon">
                    <i className="bi bi-person input-icon"></i>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="form-input"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-with-icon">
                    <i className="bi bi-telephone input-icon"></i>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Referral Code{" "}
                    <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                      (Optional)
                    </span>
                  </label>
                  <div className="input-with-icon">
                    <i className="bi bi-person-badge input-icon"></i>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="form-input"
                      placeholder="Enter referral code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    "Continue to Dashboard"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                {!isLogin && !isReset && (
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <div className="input-with-icon">
                      <i className="bi bi-person input-icon"></i>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="form-input"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-with-icon">
                    <i className="bi bi-envelope input-icon"></i>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {!isLogin && !isReset && (
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-with-icon">
                      <i className="bi bi-telephone input-icon"></i>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                )}

                {!isReset && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="password-input-group input-with-icon">
                        <i className="bi bi-lock input-icon"></i>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required={!isReset}
                          className="form-input"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="password-toggle"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          <i
                            className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                          ></i>
                        </button>
                      </div>

                      {!isLogin && password && (
                        <div className="password-strength">
                          <div className="strength-header">
                            <span>Password Strength</span>
                            <span className="strength-text">
                              {getStrengthText()}
                            </span>
                          </div>
                          <div className="strength-bar">
                            <div
                              className={`strength-progress ${getStrengthColor()}`}
                              style={{
                                width: `${(passwordStrength / 5) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {!isLogin && !isReset && (
                      <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="password-input-group input-with-icon">
                          <i className="bi bi-shield-lock input-icon"></i>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="password-toggle"
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            <i
                              className={`bi ${
                                showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                              }`}
                            ></i>
                          </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                          <p className="password-mismatch">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {!isLogin && !isReset && (
                  <div className="form-group">
                    <label className="form-label">
                      Referral Code{" "}
                      <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                        (Optional)
                      </span>
                    </label>
                    <div className="input-with-icon">
                      <i className="bi bi-person-badge input-icon"></i>
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="form-input"
                        placeholder="Enter referral code"
                      />
                    </div>
                  </div>
                )}

                {!isLogin && !isReset && (
                  <label className="terms-row">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                    />
                    <span>
                      I agree to the <a href="#">Terms of Service</a> and{" "}
                      <a href="#">Privacy Policy</a>
                    </span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : isReset ? (
                    "Send Reset Link"
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}

            {message && (
              <div
                className={`message-alert ${
                  message.includes("Error") || message.includes("not match")
                    ? "message-error"
                    : "message-success"
                }`}
              >
                {message}
              </div>
            )}

            {!showGoogleProfileStep && (
              <div className="login-links">
                {isLogin && !isReset && (
                  <>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsReset(true);
                      }}
                      className="link-button"
                    >
                      Forgot your password?
                    </button>
                    <p className="link-text">
                      Don't have an account?{" "}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setIsLogin(false);
                        }}
                        className="link-button"
                      >
                        Sign up
                      </button>
                    </p>
                  </>
                )}

                {!isLogin && (
                  <p className="link-text">
                    Already have an account?{" "}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setIsLogin(true);
                      }}
                      className="link-button"
                    >
                      Sign in
                    </button>
                  </p>
                )}

                {isReset && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsReset(false);
                      setIsLogin(true);
                    }}
                    className="link-button"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
