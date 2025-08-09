// pages/trips/create.js
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import API_BASE_URL from '../../utils/api';


// List of countries for the dropdown
const COUNTRIES = [
  'Taiwan', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria',
  'Switzerland', 'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia',
  'Slovenia', 'Croatia', 'Greece', 'Denmark', 'Sweden', 'Norway', 'Finland',
  'Estonia', 'Latvia', 'Lithuania', 'Ireland', 'Luxembourg', 'United Kingdom',
  'Iceland', 'Malta', 'Cyprus', 'Turkey', 'Montenegro', 'Monaco', 'Andorra', 'Liechtenstein'
];

// Google Calendar-style DatePicker Component
const DatePicker = ({ value, onChange, disabled, minDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const datePickerRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Parse the DD/MM/YYYY value
  useEffect(() => {
    if (value) {
      const [day, month, year] = value.split('/').map(Number);
      setSelectedDate(new Date(year, month - 1, day));
      setCurrentMonth(new Date(year, month - 1, 1));
    }
  }, [value]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date) => {
    if (!date || isDateDisabled(date)) return;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    onChange({ target: { value: formattedDate } });
    setSelectedDate(date);
    setIsOpen(false);
  };

  const isDateDisabled = (date) => {
    if (!minDate || !date) return false;
    const min = new Date(minDate);
    min.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < min;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    return value; // Already in DD/MM/YYYY format
  };

  return (
    <div className="relative" ref={datePickerRef}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={formatDisplayValue()}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          placeholder="DD/MM/YYYY"
          readOnly
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 cursor-pointer pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Calendar Popup */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                type="button"
                onClick={goToToday}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8"></div>;
              }

              const disabled = isDateDisabled(date);
              const today = isToday(date);
              const selected = isSelected(date);

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={disabled}
                  className={`
                    h-8 w-8 text-sm rounded-md transition-all duration-150 flex items-center justify-center
                    ${disabled
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-blue-100 cursor-pointer text-gray-700'
                    }
                    ${today && !selected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
                    ${selected ? 'bg-blue-600 text-white font-semibold shadow-md' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {selectedDate ? `Selected: ${formatDisplayValue()}` : 'No date selected'}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom Dropdown Component
const CountryDropdown = ({ value, onChange, placeholder, disabled, excludeValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter countries based on search term and exclude selected value from other dropdown
  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase()) &&
    country !== excludeValue
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onClick={handleInputClick}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 pr-10 cursor-pointer"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country) => (
              <div
                key={country}
                onClick={() => handleSelect(country)}
                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                  value === country ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                }`}
              >
                {country}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-500">
              {excludeValue ? `No countries found matching "${searchTerm}" (excluding selected destination)` : `No countries found matching "${searchTerm}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function CreateTrip() {
  const { user, authenticatedFetch } = useAuth();
  const [formData, setFormData] = useState({
    country_from: '',
    country_to: '',
    date: '',
    rate_per_kg: '',
    available_cargo_space: '',
    currency: 'EUR',
    description: '',
    contact_info: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleDateChange = (e) => {
    setFormData({
      ...formData,
      date: e.target.value // Already in DD/MM/YYYY format from DatePicker
    });
  };

  const validateForm = () => {
    if (!formData.country_from || !formData.country_to) {
      setError('Please select both departure and destination countries');
      return false;
    }

    if (formData.country_from === formData.country_to) {
      setError('Departure and destination countries cannot be the same');
      return false;
    }

    if (!formData.date) {
      setError('Please select a departure date');
      return false;
    }

    // Validate date is not in the past
    const [day, month, year] = formData.date.split('/');
    const selectedDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    if (selectedDate < today) {
      setError('Departure date cannot be in the past');
      return false;
    }

    if (!formData.rate_per_kg || parseFloat(formData.rate_per_kg) <= 0) {
      setError('Please enter a valid rate per kg');
      return false;
    }

    if (!formData.available_cargo_space || parseInt(formData.available_cargo_space) <= 0) {
      setError('Please enter a valid cargo space amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert DD/MM/YYYY to DDMMYYYY format for backend
      const [day, month, year] = formData.date.split('/');
      const backendDate = `${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`;

      const submitData = {
        ...formData,
        date: backendDate // Send in DDMMYYYY format to match backend expectations
      };

      const response = await authenticatedFetch(`${API_BASE_URL}/api/trips/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Trip created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to create trip');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today) in YYYY-MM-DD format for validation
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
            <p className="text-gray-600 mt-2">Post your available cargo space and connect with shippers</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {success}
                  </div>
                </div>
              )}

              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Country <span className="text-red-500">*</span>
                  </label>
                  <CountryDropdown
                    value={formData.country_from}
                    onChange={(value) => handleCountryChange('country_from', value)}
                    placeholder="Select departure country"
                    disabled={loading}
                    excludeValue={formData.country_to}
                  />
                  {formData.country_to && formData.country_from === formData.country_to && (
                    <p className="text-red-500 text-xs mt-1">Cannot be the same as destination</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Country <span className="text-red-500">*</span>
                  </label>
                  <CountryDropdown
                    value={formData.country_to}
                    onChange={(value) => handleCountryChange('country_to', value)}
                    placeholder="Select destination country"
                    disabled={loading}
                    excludeValue={formData.country_from}
                  />
                  {formData.country_from && formData.country_to === formData.country_from && (
                    <p className="text-red-500 text-xs mt-1">Cannot be the same as departure</p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    value={formData.date}
                    onChange={handleDateChange}
                    disabled={loading}
                    minDate={getMinDate()}
                  />
                </div>
                <div>
                  {/* Empty div to maintain grid layout */}
                </div>
              </div>

              {/* Pricing and Space */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate per KG <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    name="rate_per_kg"
                    value={formData.rate_per_kg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="5.50"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Space (KG) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="available_cargo_space"
                    value={formData.available_cargo_space}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="100"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    disabled={loading}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Describe your trip, any special requirements, or additional information..."
                  disabled={loading}
                />
              </div>

              {/* Contact Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Information
                </label>
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Email, phone, or other contact method"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center pt-6">
                <Link
                  href="/dashboard"
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  ← Back to Dashboard
                </Link>

                <button
                  type="submit"
                  disabled={loading || formData.country_from === formData.country_to}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <div>
                      <div className="animate-spin rounded-full h-4 w-4 border-4 border-blue-200 border-t-4 border-t-blue-600 mr-2 inline-block"></div>
                      Creating Trip...
                    </div>
                  ) : (
                    <div>
                      <svg className="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Trip
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}