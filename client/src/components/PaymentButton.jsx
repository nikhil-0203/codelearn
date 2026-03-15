import React, { useState } from 'react';
import API from '../api/api';
import './PaymentButton.css';

export default function PaymentButton({ course, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert('Payment gateway not loaded. Please refresh and try again.');
      return;
    }
    setLoading(true);
    try {
      // 1. Create order on backend
      const { data } = await API.post(`/payment/create-order/${course._id}`);

      // 2. Open Razorpay checkout
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'YBITLearn',
        description: course.title,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            // 3. Verify payment on backend
            await API.post(`/payment/verify/${course._id}`, response);
            onSuccess?.();
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        setLoading(false);
        alert('Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert('Could not initiate payment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button className="payment-btn" onClick={handlePayment} disabled={loading}>
      {loading ? (
        <span className="pay-spinner" />
      ) : (
        <>
          <span className="pay-icon">💳</span>
          Pay ₹{course.price} & Enroll
        </>
      )}
    </button>
  );
}
