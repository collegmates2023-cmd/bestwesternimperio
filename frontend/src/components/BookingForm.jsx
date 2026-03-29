import React, { useState } from 'react';
import api from '@/config/api';
import { handleApiError, showSuccess } from '@/utils/toast';
import './BookingForm.css';

const BookingForm = ({ room, checkIn, checkOut, onBookingSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    special_requests: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.customer_email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.customer_phone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!/^[0-9+\-\s()]{10,}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        room_number: room.room_number,
        room_id: room.id || room._id,
        check_in: checkIn,
        check_out: checkOut,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        special_requests: formData.special_requests,
        total_price: room.price,
      };

      console.log('📤 Booking Data:', bookingData);
      const response = await api.post('/api/bookings', bookingData);
      const data = response.data;
      
      console.log('✅ Booking Response:', data);
      
      if (!data || !data.success) {
        throw new Error(data?.detail || data?.message || 'Failed to create booking');
      }
      
      setSuccess(true);
      showSuccess('Booking confirmed!', `Room ${room.room_number} has been successfully booked.`);

      // Call callback after 2 seconds
      setTimeout(() => {
        onBookingSubmit(data.booking);
      }, 1500);
    } catch (err) {
      console.error('❌ Booking Error:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'An error occurred while booking';
      setError(errorMsg);
      handleApiError(err, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const nights = Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = (room.price || 0) * nights;

  if (!room) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>✕</button>

        {success ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your room {room.room_number} has been successfully booked.</p>
            <div className="confirmation-details">
              <p><strong>Confirmation Email:</strong> Sent to {formData.customer_email}</p>
              <p><strong>Check-in:</strong> {new Date(checkIn).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> {new Date(checkOut).toLocaleDateString()}</p>
            </div>
            <button className="close-modal-button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <h2>Complete Your Booking</h2>
              <p>Room {room.room_number} • {room.category}</p>
            </div>

            <div className="booking-summary">
              <div className="summary-item">
                <span>Room:</span>
                <strong>#{room.room_number} {room.category}</strong>
              </div>
              <div className="summary-item">
                <span>Check-in:</span>
                <strong>{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div className="summary-item">
                <span>Check-out:</span>
                <strong>{new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div className="summary-item">
                <span>Duration:</span>
                <strong>{nights} night{nights !== 1 ? 's' : ''}</strong>
              </div>
              <div className="summary-item">
                <span>Price per night:</span>
                <strong>₹{room.price?.toLocaleString()}</strong>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-item total">
                <span>Total Price:</span>
                <strong>₹{totalPrice.toLocaleString()}</strong>
              </div>
            </div>

            {error && <div className="error-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="customer_name">Full Name *</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_email">Email Address *</label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_phone">Phone Number *</label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="special_requests">Special Requests (Optional)</label>
                <textarea
                  id="special_requests"
                  name="special_requests"
                  value={formData.special_requests}
                  onChange={handleInputChange}
                  placeholder="Any special requests for your stay?"
                  rows="3"
                  disabled={loading}
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingForm;
