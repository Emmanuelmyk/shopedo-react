// ==========================================
// FILE: src/components/AdsCarousel/AdsCarousel.jsx
// ==========================================
import React, { useEffect, useState } from "react";
import { getAdPublicUrl } from "../../utils/imageUtils";
import { escapeHtml } from "../../utils/formatUtils";
import "./AdsCarousel.css";

const FALLBACK_ADS = [
  {
    id: "fallback-1",
    image_path: "/assets/dummy-banner-1.svg",
    link: "",
    alt: "Featured marketplace banner",
  },
  {
    id: "fallback-2",
    image_path: "/assets/dummy-banner-2.svg",
    link: "",
    alt: "New listings marketplace banner",
  },
  {
    id: "fallback-3",
    image_path: "/assets/dummy-banner-3.svg",
    link: "",
    alt: "Promotional advertising banner",
  },
];

const AdsCarousel = ({ ads, isMobile = false }) => {
  const slides = ads && ads.length > 0 ? ads : FALLBACK_ADS;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const getSlideOffset = (index) => {
    const rawOffset = index - activeIndex;

    if (rawOffset > 1) {
      return rawOffset - slides.length;
    }

    if (rawOffset < -1) {
      return rawOffset + slides.length;
    }

    return rawOffset;
  };

  return (
    <div
      className={`mt-4 ${isMobile ? "mobile-ads-carousel" : "ads-carousel"}`}
    >
      <div className="ads-carousel__viewport" aria-label="Promotional banners">
        {slides.map((ad, index) => {
          const imgUrl = ad.id.startsWith("fallback-")
            ? ad.image_path
            : getAdPublicUrl(ad.image_path);
          const offset = getSlideOffset(index);
          const isVisible = Math.abs(offset) <= 1;

          return (
            <div
              key={ad.id}
              className={`ads-carousel__slide ads-carousel__slide--${offset === 0 ? "active" : offset < 0 ? "prev" : offset > 0 ? "next" : "hidden"}`}
              aria-hidden={!isVisible}
            >
              {ad.link ? (
                <a
                  href={escapeHtml(ad.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={escapeHtml(imgUrl)}
                    className="d-block w-100"
                    alt={ad.alt || `Advertisement ${index + 1}`}
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="ads-carousel__placeholder-frame">
                  <img
                    src={escapeHtml(imgUrl)}
                    className="d-block w-100"
                    alt={ad.alt || `Advertisement ${index + 1}`}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          );
        })}

        {slides.length > 1 && (
          <>
            <div className="ads-carousel__dots" aria-hidden="true">
              {slides.map((slide, index) => (
                <span
                  key={slide.id}
                  className={`ads-carousel__dot${index === activeIndex ? " ads-carousel__dot--active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdsCarousel;
