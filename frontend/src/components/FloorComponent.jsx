import React, { useState, useEffect } from 'react';
import api from '@/utils/apiRequest';
import './FloorComponent.css';

const FloorComponent = ({ checkIn, checkOut, onRoomSelected, loading = false }) => {
  const [floors, setFloors] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState('');
  const [loadingFloors, setLoadingFloors] = useState(false);

  useEffect(() => {
    if (checkIn && checkOut) {
      fetchRooms();
    }
  }, [checkIn, checkOut]);

  const fetchRooms = async () => {
    setLoadingFloors(true);
    setError('');
    try {
      const endpoint = `/api/rooms/availability?check_in=${checkIn}&check_out=${checkOut}`;
      const data = await api.get(endpoint);
      
      if (!data) {
        throw new Error('Failed to fetch room availability');
      }
      
      // Group rooms by floor
      const floorMap = {};
      data.rooms.forEach((room) => {
        const floor = room.floor || 1;
        if (!floorMap[floor]) {
          floorMap[floor] = [];
        }
        floorMap[floor].push(room);
      });

      // Sort rooms by room number within each floor
      Object.keys(floorMap).forEach((floor) => {
        floorMap[floor].sort((a, b) => a.room_number - b.room_number);
      });

      // Create floors array sorted by floor number
      const floorsArray = Object.keys(floorMap)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((floor) => ({
          floor: parseInt(floor),
          rooms: floorMap[floor],
        }));

      setFloors(floorsArray);
    } catch (err) {
      setError(err.message || 'Error fetching rooms');
    } finally {
      setLoadingFloors(false);
    }
  };

  const handleRoomSelect = (room) => {
    if (room.status === 'maintenance') {
      setError('This room is under maintenance');
      return;
    }
    
    if (!room.is_available) {
      setError('This room is not available for selected dates');
      return;
    }

    setSelectedRoom(room);
    setError('');
    onRoomSelected(room);
  };

  const getRoomStatusColor = (room) => {
    if (room.status === 'maintenance') return '#gray';
    if (!room.is_available) return '#red'; // Booked
    return '#green'; // Available
  };

  const getRoomStatusLabel = (room) => {
    if (room.status === 'maintenance') return 'Maintenance';
    if (!room.is_available) return 'Booked';
    return 'Available';
  };

  if (loadingFloors) {
    return (
      <div className="floor-container">
        <div className="loading-skeleton">
          <p>Loading room availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="floor-container">
      {error && <div className="error-banner">{error}</div>}

      <div className="floor-layout">
        {floors.length === 0 ? (
          <div className="no-data">
            <p>No rooms available for selected dates</p>
          </div>
        ) : (
          floors.map((floorData) => (
            <div key={floorData.floor} className="floor-section">
              <div className="floor-label">
                <h3>Floor {floorData.floor}</h3>
                <span className="room-count">
                  {floorData.rooms.filter((r) => r.is_available).length} of{' '}
                  {floorData.rooms.length} available
                </span>
              </div>

              <div className="rooms-grid">
                {floorData.rooms.map((room) => (
                  <div
                    key={room.id || room.room_number}
                    className={`room-card ${
                      !room.is_available ? 'booked' : ''
                    } ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                    onClick={() => handleRoomSelect(room)}
                    style={{
                      cursor: room.is_available ? 'pointer' : 'not-allowed',
                      opacity: room.is_available ? 1 : 0.6,
                    }}
                  >
                    <div className="room-header">
                      <span className="room-number">{room.room_number}</span>
                      <span
                        className={`status-badge ${
                          room.is_available ? 'available' : 'booked'
                        }`}
                      >
                        {getRoomStatusLabel(room)}
                      </span>
                    </div>

                    <div className="room-details">
                      <p className="room-type">{room.category || 'Standard'}</p>
                      <p className="room-price">₹{room.price.toLocaleString()}/night</p>
                    </div>

                    {room.is_available && (
                      <button className="select-button">Select Room</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedRoom && (
        <div className="selection-info">
          <div className="info-content">
            <h4>Room {selectedRoom.room_number} Selected</h4>
            <p>
              {selectedRoom.category} • ₹{selectedRoom.price.toLocaleString()}/night
            </p>
            <p className="amenities">
              <strong>Amenities:</strong> {selectedRoom.amenities?.join(', ') || 'WiFi, AC, TV'}
            </p>
          </div>
        </div>
      )}

      <div className="legend">
        <div className="legend-item">
          <div className="legend-box available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-box booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="legend-box maintenance"></div>
          <span>Maintenance</span>
        </div>
      </div>
    </div>
  );
};

export default FloorComponent;
