import React from "react";
import "./ReferralCard.css";

const ReferralCard = () => {
  return (
    <div
      className="referral-card"
      role="complementary"
      aria-label="Referral rewards"
    >
      <h3 className="referral-card__title">
        <i
          className="bi bi-people referral-card__title-icon"
          aria-hidden="true"
        ></i>
        Refer & Earn
      </h3>
      <p className="referral-card__copy">
        Invite friends and get ₦500 per referral
      </p>
      <button type="button" className="referral-card__action">
        View Referrals
      </button>
    </div>
  );
};

export default ReferralCard;
