import React, { useState, useRef, useEffect } from "react";
import "./CustomSelect.css";

const CustomSelect = ({ value, onChange, options, icon }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("touchstart", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("touchstart", close);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`cs-wrap${open ? " cs-wrap--open" : ""}`} ref={wrapRef}>
      <button
        type="button"
        className="cs-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {icon && <i className={`bi ${icon} cs-trigger__icon`} aria-hidden="true" />}
        <span className="cs-trigger__value">{selected?.label ?? "Select"}</span>
        <i className="bi bi-chevron-down cs-trigger__caret" aria-hidden="true" />
      </button>

      {open && (
        <ul className="cs-dropdown" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cs-option${opt.value === value ? " cs-option--active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              <span>{opt.label}</span>
              {opt.value === value && (
                <i className="bi bi-check2 cs-option__check" aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
