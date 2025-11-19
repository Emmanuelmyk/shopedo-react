// src/pages/LoginPage/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./Login.css";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

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
        if (password !== confirmPassword) {
          setMessage("Passwords do not match");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
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

  return (
    <>
      <div className="login-container">
        {/* <Navbar /> */}
        {/* Floating Background Effect */}
        <div className="login-wrapper">
          {/* Logo & Header */}
          <div className="login-logo">
            <img src="/assets/logo.png" alt="EDOFINDS" className="logo-image" />
            <h2 className="login-title">
              {isReset
                ? "Reset Your Password"
                : isLogin
                ? "Welcome Back"
                : "Create Account"}
            </h2>
            <p className="login-subtitle">
              {isReset
                ? "Enter your email to receive a reset link"
                : isLogin
                ? "Sign in to manage your listings"
                : "Join as a seller on EDOFINDS"}
            </p>
          </div>

          {/* Login Card */}
          <div className="login-card">
            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Fields */}
              {!isReset && (
                <>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="password-input-group">
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
                          className={`bi ${
                            showPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {/* Password Strength - Only on Signup */}
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

                  {/* Confirm Password - Signup Only */}
                  {!isLogin && (
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="password-input-group">
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
                        <p className="text-red-600 text-xs mt-2">
                          Passwords do not match
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
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

            {/* Success/Error Message */}
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

            {/* Bottom Links */}
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
                      className="link-button font-semibold"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {!isLogin && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsLogin(true);
                  }}
                  className="link-button"
                >
                  ← Back to Sign In
                </button>
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
                  ← Back to Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
