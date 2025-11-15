// ==========================================
// FILE: src/components/Footer/Footer.jsx
// ==========================================
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="container">
          <div className="row g-4">
            {/* About Section */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="footer-section">
                <div className="footer-logo mb-3">
                  <img src="/assets/logo.png" alt="EDOFINDS" />
                </div>
                <p className="footer-description">
                  Nigeria's trusted marketplace for buying and selling quality items. Quick, easy, and secure transactions.
                </p>
                <div className="footer-contact">
                  <p className="mb-2">
                    <i className="bi bi-telephone-fill me-2"></i>
                    +234 (0) 000 0000
                  </p>
                  <p className="mb-0">
                    <i className="bi bi-envelope-fill me-2"></i>
                    support@edofinds.ng
                  </p>
                </div>
              </div>
            </div>

            {/* Company Section */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-section">
                <h5 className="footer-title">Company</h5>
                <ul className="footer-links">
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#how-it-works">How It Works</a></li>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#safety">Safety Tips</a></li>
                </ul>
              </div>
            </div>

            {/* Categories Section */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-section">
                <h5 className="footer-title">Categories</h5>
                <ul className="footer-links">
                  <li><a href="/?category=1">Electronics</a></li>
                  <li><a href="/?category=7">Vehicles</a></li>
                  <li><a href="/?category=3">Real Estate</a></li>
                  <li><a href="/?category=2">Fashion</a></li>
                </ul>
              </div>
            </div>

            {/* Legal Section */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className="footer-section">
                <h5 className="footer-title">Legal</h5>
                <ul className="footer-links">
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#terms">Terms of Service</a></li>
                  <li><a href="#cookies">Cookie Policy</a></li>
                  <li><a href="#disclaimer">Disclaimer</a></li>
                </ul>
              </div>
            </div>

            {/* Social Section */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="footer-section">
                <h5 className="footer-title">Stay Connected</h5>
                <p className="footer-social-text">
                  Follow us on social media for updates and promotions
                </p>
                <div className="footer-social-icons">
                  <a href="#facebook" className="social-icon" aria-label="Facebook">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="#twitter" className="social-icon" aria-label="Twitter">
                    <i className="bi bi-twitter"></i>
                  </a>
                  <a href="#instagram" className="social-icon" aria-label="Instagram">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="#linkedin" className="social-icon" aria-label="LinkedIn">
                    <i className="bi bi-linkedin"></i>
                  </a>
                  <a href="#whatsapp" className="social-icon" aria-label="WhatsApp">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-bottom-left">
              <p className="mb-2 footer-made-in">
                Made with <i className="bi bi-heart-fill text-danger"></i> in Nigeria
              </p>
              <p className="mb-0 footer-copyright">
                © 2025 EDOFINDS.NG. All rights reserved.
              </p>
            </div>
            <div className="footer-bottom-right">
              <p className="mb-0 footer-powered">
                Powered by <a href="#" className="powered-link">InnovativeWebDevs</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;