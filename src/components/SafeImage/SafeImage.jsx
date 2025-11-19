// ==========================================
// FILE: src/components/SafeImage/SafeImage.jsx
// ==========================================
import React, { useState } from "react";
import PropTypes from "prop-types";

/**
 * SafeImage component with automatic fallback handling
 * @param {string} src - Image source URL
 * @param {string} fallbackSrc - Fallback image URL (default: /assets/emptypics.png)
 * @param {string} alt - Alt text for the image
 * @param {string} className - CSS class names
 * @param {Function} onLoad - Optional onLoad callback
 * @param {Function} onError - Optional onError callback (called after fallback is set)
 * @param {Object} rest - Other props to pass to img element
 */
const SafeImage = ({
  src,
  fallbackSrc = "/assets/emptypics.png",
  alt = "",
  className = "",
  onLoad,
  onError,
  ...rest
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
      if (onError) {
        onError(e);
      }
    }
  };

  const handleLoad = (e) => {
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...rest}
    />
  );
};

SafeImage.propTypes = {
  src: PropTypes.string,
  fallbackSrc: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

export default SafeImage;
