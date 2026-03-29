import React, { useState, useEffect } from 'react';
import api from '@/config/api';
import { handleApiError, showSuccess } from '@/utils/toast';
import './AdminPanel.css';

const AdminRoomsPanel = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterFloor, setFilterFloor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    room_number: '',
    floor: 1,
    category: 'Deluxe',
    price: 4500,
    status: 'available',
    amenities: 'WiFi,AC,TV,mini Bar',
  });

  useEffect(() => {
    fetchRooms();
  }, [filterFloor, filterStatus, filterCategory]);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterFloor) params.floor = filterFloor;
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;

      const response = await api.get('/api/admin/rooms', { params });
      setRooms(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      handleApiError(err, 'Failed to load rooms');
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    if (!formData.room_number) {
      setError('Room number is required');
      return;
    }

    try {
      await api.post('/api/admin/rooms', {
        ...formData,
        room_number: parseInt(formData.room_number),
        floor: parseInt(formData.floor),
        price: parseFloat(formData.price),
        amenities: formData.amenities.split(',').map((a) => a.trim()),
      });

      showSuccess('Room added successfully');
      setShowAddForm(false);
      setFormData({
        room_number: '',
        floor: 1,
        category: 'Deluxe',
        price: 4500,
        status: 'available',
        amenities: 'WiFi,AC,TV,mini Bar',
      });
      fetchRooms();
    } catch (err) {
      handleApiError(err, 'Failed to add room');
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      await api.put(`/api/admin/rooms/${roomId}/status`, { status: newStatus });
      showSuccess('Room status updated');
      fetchRooms();
    } catch (err) {
      handleApiError(err, 'Failed to update room status');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;

    try {
      await api.delete(`/api/admin/rooms/${roomId}`);
      showSuccess('Room deleted successfully');
      fetchRooms();
    } catch (err) {
      handleApiError(err, 'Failed to delete room');
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Room Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-add"
        >
          + Add New Room
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showAddForm && (
        <form onSubmit={handleAddRoom} className="add-room-form">
          <h3>Add New Room</h3>
          <div className="form-row">
            <input
              type="number"
              placeholder="Room Number"
              value={formData.room_number}
              onChange={(e) =>
                setFormData({ ...formData, room_number: e.target.value })
              }
              required
            />
            <select
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            >
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>
          <div className="form-row">
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value="Deluxe">Deluxe</option>
              <option value="Executive">Executive</option>
            </select>
            <input
              type="number"
              placeholder="Price per night"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              placeholder="Amenities (comma-separated)"
              value={formData.amenities}
              onChange={(e) =>
                setFormData({ ...formData, amenities: e.target.value })
              }
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Add Room
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="filter-controls">
        <select
          value={filterFloor}
          onChange={(e) => setFilterFloor(e.target.value)}
          className="filter-select"
        >
          <option value="">All Floors</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Deluxe">Deluxe</option>
          <option value="Executive">Executive</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="no-data">No rooms found</div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <div key={room.id} className={`room-card status-${room.status}`}>
              <div className="room-card-header">
                <h4>Room {room.room_number}</h4>
                <span className={`status-badge status-${room.status}`}>
                  {room.status}
                </span>
              </div>
              <div className="room-card-body">
                <p className="room-info">
                  <strong>Category:</strong> {room.category}
                </p>
                <p className="room-info">
                  <strong>Floor:</strong> {room.floor}
                </p>
                <p className="room-info">
                  <strong>Price:</strong> ₹{room.price?.toLocaleString()}
                </p>
              </div>
              <div className="room-card-actions">
                <select
                  value={room.status}
                  onChange={(e) => handleStatusChange(room.id, e.target.value)}
                  className="status-selector"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRoomsPanel;

/* Additional styles for forms */
const additionalStyles = `
.add-room-form {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  border-left: 4px solid #667eea;
}

.add-room-form h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row input,
.form-row select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.95rem;
}

.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #45a049;
}

.btn-submit {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-submit:hover {
  background: #5568d3;
}

.btn-delete {
  padding: 0.4rem 0.75rem;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #da190b;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.room-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s;
}

.room-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.room-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
}

.room-card-header h4 {
  margin: 0;
  color: #333;
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.status-available {
  background: #d4f4dd;
  color: #2a5f3f;
}

.status-badge.status-booked {
  background: #ffd4d4;
  color: #5f2a2a;
}

.status-badge.status-maintenance {
  background: #e0e0e0;
  color: #666;
}

.room-info {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #555;
}

.room-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.room-card-actions select {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.85rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
}
`;
