import React, { useState, useEffect } from 'react';
import api from '@/utils/apiRequest';
import { handleApiError, showSuccess } from '@/utils/toast';
import './AdminPanel.css';

const AdminBookingsPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '/api/admin/bookings';
      const params = new URLSearchParams();
      
      if (filterStatus) params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);
      
      if (params.toString()) {
        endpoint += '?' + params.toString();
      }

      const response = await api.get(endpoint);
      setBookings(Array.isArray(response) ? response : []);
    } catch (err) {
      handleApiError(err, 'Failed to load bookings');
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.put(`/api/bookings/${bookingId}/cancel`, {});
      showSuccess('Booking cancelled successfully');
      fetchBookings();
    } catch (err) {
      handleApiError(err, 'Failed to cancel booking');
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.put(`/api/admin/bookings/${bookingId}`, { status: newStatus });
      showSuccess(`Booking status updated to ${newStatus}`);
      fetchBookings();
    } catch (err) {
      handleApiError(err, 'Failed to update booking status');
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Booking Management</h2>
        <input
          type="text"
          placeholder="Search by name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-controls">
        <button
          className={`filter-btn ${!filterStatus ? 'active' : ''}`}
          onClick={() => setFilterStatus('')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="no-data">No bookings found</div>
      ) : (
        <div className="bookings-table">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Room #</th>
                <th>Guest Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className={`status-${booking.status}`}>
                  <td className="booking-id">{booking.booking_id}</td>
                  <td>#{booking.room_number}</td>
                  <td>{booking.customer_name}</td>
                  <td>{new Date(booking.check_in).toLocaleDateString()}</td>
                  <td>{new Date(booking.check_out).toLocaleDateString()}</td>
                  <td>₹{booking.total_price?.toLocaleString() || '—'}</td>
                  <td>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      className="status-selector"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="action-buttons">
                    {booking.status !== 'cancelled' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsPanel;
