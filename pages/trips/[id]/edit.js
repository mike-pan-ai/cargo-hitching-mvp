import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API_BASE_URL from '../../../utils/api';

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

export default function EditTrip() {
  const [trip, setTrip] = useState(null);
  const [formData, setFormData] = useState({
    country_from: '',
    country_to: '',
    date: '',
    departure_time: '',
    rate_per_kg: '',
    available_cargo_space: '',
    currency: 'EUR',
    description: '',
    contact_info: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const convertBackendDateToDisplay = (backendDate) => {
  if (!backendDate) return '';

  const dateStr = backendDate.toString();

  // Handle YYYY-MM-DD format (ISO date format)
  if (dateStr.includes('-') && dateStr.length === 10) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Handle DDMMYYYY format (8 digits) - keep this for backward compatibility
  if (dateStr.length === 8 && !dateStr.includes('-')) {
    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);
    return `${day}/${month}/${year}`;
  }
  return '';
};

  const convertDisplayDateToBackend = (displayDate) => {
  if (!displayDate) return '';
  const [day, month, year] = displayDate.split('/');
  // Convert to DDMMYYYY format as backend expects
  return `${day.padStart(2, '0')}${month.padStart(2, '0')}${year}`;
};

  const loadTrip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const tripData = await response.json();
        setTrip(tripData);
        // Populate form with existing trip data
        setFormData({
          country_from: tripData.country_from || '',
          country_to: tripData.country_to || '',
          date: tripData.date ? convertBackendDateToDisplay(tripData.date.toString()) : '',
          departure_time: tripData.departure_time || '',
          rate_per_kg: tripData.rate_per_kg || '',
          available_cargo_space: tripData.available_cargo_space || '',
          currency: tripData.currency || 'EUR',
          description: tripData.description || '',
          contact_info: tripData.contact_info || '',
          status: tripData.status || 'active'
        });
      } else {
        setError('Trip not found or you do not have permission to edit it');
      }
    } catch (err) {
      setError('Network error while loading trip');
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.country_from || !formData.country_to || !formData.date ||
        !formData.rate_per_kg || !formData.available_cargo_space) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.country_from.toLowerCase() === formData.country_to.toLowerCase()) {
      setError('Departure and destination cannot be the same');
      return false;
    }

    if (parseFloat(formData.rate_per_kg) <= 0) {
      setError('Rate per kg must be greater than 0');
      return false;
    }

    if (parseFloat(formData.available_cargo_space) <= 0) {
      setError('Cargo space must be greater than 0');
      return false;
    }

    if (!formData.date) {
  setError('Please select a departure date');
  return false;
}

// Validate date format and is not in the past
try {
  const [day, month, year] = formData.date.split('/');
  if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) {
    setError('Invalid date format. Please use DD/MM/YYYY');
    return false;
  }

  const selectedDate = new Date(year, month - 1, day);
  if (isNaN(selectedDate.getTime())) {
    setError('Invalid date selected');
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    setError('Departure date cannot be in the past');
    return false;
  }
} catch (err) {
  setError('Invalid date format');
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

    setUpdateLoading(true);

    try {
  const token = localStorage.getItem('token');

  const requestBody = {
    country_from: formData.country_from,
    country_to: formData.country_to,
    date: formData.date ? convertDisplayDateToBackend(formData.date) : '',
    rate_per_kg: parseFloat(formData.rate_per_kg),
    available_cargo_space: parseFloat(formData.available_cargo_space),
    currency: formData.currency,
    description: formData.description,
    contact_info: formData.contact_info,
    status: formData.status
  };

  const response = await fetch(`${API_BASE_URL}/api/trips/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const data = await response.json();
    setSuccess('Trip updated successfully!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  } else {
    // Try to get error details
    const responseText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      errorData = { error: responseText || 'Unknown error occurred' };
    }

    setError(errorData.error || errorData.message || `Server error (${response.status})`);
  }
} catch (err) {
  setError('Network error. Make sure your backend is running.');
} finally {
  setUpdateLoading(false);
}
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    setUpdateLoading(true);

    try {
  const token = localStorage.getItem('token');

  const requestBody = {
    country_from: formData.country_from,
    country_to: formData.country_to,
    date: formData.date ? convertDisplayDateToBackend(formData.date) : '',
    rate_per_kg: parseFloat(formData.rate_per_kg),
    available_cargo_space: parseFloat(formData.available_cargo_space),
    currency: formData.currency,
    description: formData.description,
    contact_info: formData.contact_info,
    status: formData.status
  };

  const response = await fetch(`${API_BASE_URL}/api/trips/${id}/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const data = await response.json();
    setSuccess('Trip updated successfully!');
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  } else {
    // Try to get error details
    const responseText = await response.text();

    let errorData;
    try {
      errorData = JSON.parse(responseText);
    } catch (parseError) {
      errorData = { error: responseText || 'Unknown error occurred' };
    }

    setError(errorData.error || errorData.message || `Server error (${response.status})`);
  }
} catch (err) {
  setError('Network error. Make sure your backend is running.');
} finally {
  setUpdateLoading(false);
}
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">The trip you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to edit it.</p>
          <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                🚚 Cargo Hitching
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/trips/search" className="text-gray-600 hover:text-gray-900">
                Search Trips
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Edit Trip</h1>
            <p className="text-yellow-100">Update your trip information</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Country *
                    </label>
                  <CountryDropdown
                    value={formData.country_from}
                    onChange={(value) => handleCountryChange('country_from', value)}
                    placeholder="Select departure country"
                    disabled={updateLoading}
                    excludeValue={formData.country_to}
                    />
                    {formData.country_to && formData.country_from === formData.country_to && (
                      <p className="text-red-500 text-xs mt-1">Cannot be the same as destination</p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Country *
                    </label>
                  <CountryDropdown
                      value={formData.country_to}
                      onChange={(value) => handleCountryChange('country_to', value)}
                      placeholder="Select destination country"
                      disabled={updateLoading}
                      excludeValue={formData.country_from}
                    />
                    {formData.country_from && formData.country_to === formData.country_from && (
                      <p className="text-red-500 text-xs mt-1">Cannot be the same as departure</p>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Date *
                    </label>
                  <DatePicker
                    value={formData.date}
                    onChange={handleDateChange}
                    disabled={updateLoading}
                    minDate={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <div>
                  <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Time
                  </label>
                  <input
                    id="departure_time"
                    name="departure_time"
                    type="text"
                    value={formData.departure_time}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="10:00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="rate_per_kg" className="block text-sm font-medium text-gray-700 mb-1">
                    Rate per KG *
                  </label>
                  <input
                    id="rate_per_kg"
                    name="rate_per_kg"
                    type="number"
                    step="0.01"
                    required
                    value={formData.rate_per_kg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="5.50"
                  />
                </div>

                <div>
                  <label htmlFor="available_cargo_space" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo Space (KG) *
                  </label>
                  <input
                    id="available_cargo_space"
                    name="available_cargo_space"
                    type="number"
                    required
                    value={formData.available_cargo_space}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  placeholder="Additional details about your trip..."
                />
              </div>

              <div>
                <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information
                </label>
                <input
                  id="contact_info"
                  name="contact_info"
                  type="text"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                  placeholder="WhatsApp: +49123456789"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 font-medium"
                >
                  {updateLoading ? 'Updating...' : 'Update Trip'}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={updateLoading}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 font-medium"
                >
                  {updateLoading ? 'Deleting...' : 'Delete Trip'}
                </button>

                <Link
                  href="/dashboard"
                  className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}