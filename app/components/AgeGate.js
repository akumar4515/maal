"use client";

import { useEffect, useState } from "react";

export default function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ok = localStorage.getItem("maal_age_ok");
      if (!ok) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("maal_age_ok", "1");
    } catch {}
    setShow(false);
  };

  const decline = () => {
    window.location.href = "https://www.google.com";
  };

  if (!show) return null;

  return (
    <div className="age-overlay" role="dialog" aria-modal="true" aria-label="Age verification">
      <div className="age-card">
        <h2>maal<span>.</span></h2>
        <p>
          This website contains adult content intended for persons 18 years of age or older.
          By entering you confirm that you are at least 18 years old and agree to our terms.
        </p>
        <div className="age-btns">
          <button type="button" className="age-btn yes" onClick={accept}>
            I am 18+
          </button>
          <button type="button" className="age-btn no" onClick={decline}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
