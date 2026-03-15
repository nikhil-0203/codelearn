import React from 'react';
import './Certificate.css';

export default function Certificate({ courseTitle, studentName, date }) {
  return (
    <div className="certificate-container">
      <div className="certificate-border">
        <div className="certificate-content">
          <div className="cert-header">
            <span className="cert-logo">CL</span>
            <h1>Certificate of Completion</h1>
          </div>
          <p className="cert-text">This is to certify that</p>
          <h2 className="student-name">{studentName}</h2>
          <p className="cert-text">has successfully completed the course</p>
          <h3 className="course-name">{courseTitle}</h3>
          <div className="cert-footer">
            <div className="footer-item">
              <p className="date">{date}</p>
              <label>Date of Achievement</label>
            </div>
            <div className="footer-item">
              <p className="signature">CodeLearn Academy</p>
              <label>Verified Institution</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}