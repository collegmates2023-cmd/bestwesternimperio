import React, { useState } from 'react';
import './DatePickerComponent.css';

const DatePickerComponent = ({ onDatesSelected }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    setError('');

    // Auto-set checkout to next day if checkout is not set or is before checkin
    if (!checkOut || newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    setCheckOut(newCheckOut);
    setError('');
  };

  const handleSearch = () => {
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    setError('');
    onDatesSelected({ checkIn, checkOut, nights });
  };

  const minDate = getTodayDate();

  return (
    <div className="date-picker-container">
      <div className="date-picker-header">
        <h2>Select Your Dates</h2>
        <p>Find your perfect room and book now</p>
      </div>

      <div className="date-picker-form">
        <div className="date-input-group">
          <label htmlFor="check-in">Check-in Date</label>
          <input
            type="date"
            id="check-in"
            value={checkIn}
            onChange={handleCheckInChange}
            min={minDate}
            className="date-input"
          />
        </div>

        <div className="date-input-group">
          <label htmlFor="check-out">Check-out Date</label>
          <input
            type="date"
            id="check-out"
            value={checkOut}
            onChange={handleCheckOutChange}
            min={checkIn || minDate}
            className="date-input"
          />
        </div>

        <button onClick={handleSearch} className="search-button">
          Search Rooms
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {checkIn && checkOut && !error && (
        <div className="booking-summary">
          <p>
            {new Date(checkIn).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            →{' '}
            {new Date(checkOut).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
            • {Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} nights
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePickerComponent;
