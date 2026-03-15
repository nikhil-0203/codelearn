import React from 'react';
import './TermsModal.css';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Terms & Conditions</h2>
        <div className="modal-body">
          <p><b>1. Acceptance of Terms:</b> By using CodeLearn, you agree to these terms.</p>
          <p><b>2. Intellectual Property:</b> All course content is for personal use only.</p>
          <p><b>3. User Accounts:</b> You are responsible for maintaining the security of your account credentials.</p>
        </div>
        <button onClick={onClose} className="close-modal-btn">I Understand</button>
      </div>
    </div>
  );
}