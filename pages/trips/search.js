// pages/trips/search.js - Updated to match dashboard style
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import API_BASE_URL from '../../utils/api';



// Country list - same as create page
const COUNTRIES = [
  'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Austria',
  'Switzerland', 'Portugal', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia',
  'Slovenia', 'Croatia', 'Greece', 'Bulgaria', 'Romania', 'Denmark', 'Sweden',
  'Norway', 'Finland', 'Estonia', 'Latvia', 'Lithuania', 'Ireland', 'Luxembourg',
  'United Kingdom', 'Serbia', 'Montenegro', 'North Macedonia', 'Albania',
  'Bosnia and Herzegovina', 'Moldova', 'Ukraine', 'Belarus', 'Russia', 'Turkey'
];

// Country Dropdown Component
function CountryDropdown({
  label,
  value,
  onChange,
  placeholder,
  excludeCountry = null,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter countries based on search term and exclusion
  const filteredCountries = COUNTRIES.filter(country => {
    const matchesSearch = country.toLowerCase().includes(searchTerm.toLowerCase());
    const notExcluded = country !== excludeCountry;
    return matchesSearch && notExcluded;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    onChange(country);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
          }`}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </div>

            {/* Country options */}
            <div className="py-1">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 ${
                      value === country ? 'bg-blue-100 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    {country}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  No countries found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchTrips() {
  const { user, authenticatedFetch } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    country_from: '',
    country_to: '',
    date: '',
    max_rate: '',
    min_space: ''
  });
  const router = useRouter();

  // Load initial search from homepage if available
  useEffect(() => {
  const { from, to } = router.query;
  if (from || to) {
    setFilters(prev => ({
      ...prev,
      country_from: from || '',
      country_to: to || ''
    }));
    // Only search if there are query parameters
    searchTrips();
  }
}, [router.query]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleCountryChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchTrips = async () => {
    setLoading(true);
    setError('');

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      // Use authenticated fetch to exclude own trips on backend
      const response = await authenticatedFetch(`${API_BASE_URL}/api/trips/search?${queryParams.toString()}`);
      const data = await response.json();

      if (response.ok) {
        let searchResults = data || [];

        setTrips(searchResults);
      } else {
        setError(data.error || 'Failed to search trips');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Network error. Make sure your Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchTrips();
  };

  const clearFilters = () => {
    setFilters({
      country_from: '',
      country_to: '',
      date: '',
      max_rate: '',
      min_space: ''
    });
    // Trigger search with cleared filters
    setTimeout(() => searchTrips(), 100);
  };

  const formatDate = (dateString) => {
    if (dateString && dateString.length === 8) {
      const day = dateString.slice(0, 2);
      const month = dateString.slice(2, 4);
      const year = dateString.slice(4, 8);
      return `${day}/${month}/${year}`;
    }
    return dateString || 'TBD';
  };

  const handleContactTrip = (trip) => {
    // Navigate to the carrier's public profile
    router.push(`/profile/${trip.user_id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && trips.length === 0) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="mt-4 text-gray-600">Loading trips...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Find Cargo Space</h1>
          <div className="flex gap-2">
            <Link href="/trips/create">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post Cargo
              </button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Search Filters */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Search Filters</h3>
          </div>
          <div className="p-6 pt-0">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* From Country Dropdown */}
                <CountryDropdown
                  label="From Country"
                  value={filters.country_from}
                  onChange={(value) => handleCountryChange('country_from', value)}
                  placeholder="Select departure country"
                  excludeCountry={filters.country_to}
                  disabled={loading}
                />

                {/* To Country Dropdown */}
                <CountryDropdown
                  label="To Country"
                  value={filters.country_to}
                  onChange={(value) => handleCountryChange('country_to', value)}
                  placeholder="Select destination country"
                  excludeCountry={filters.country_from}
                  disabled={loading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date (DDMMYYYY)
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="25122024"
                    maxLength="8"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Rate/KG (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="max_rate"
                    value={filters.max_rate}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="10.00"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Space (KG)
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="min_space"
                    value={filters.min_space}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Show validation warning if same countries selected */}
              {filters.country_from && filters.country_to && filters.country_from === filters.country_to && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 p-3 text-sm">
                  ⚠️ From and To countries cannot be the same
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || (filters.country_from === filters.country_to && filters.country_from !== '')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-200 border-t-white mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Trips
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={loading}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Available Trips Section */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Available Trips ({trips.length})</h3>
            {trips.length > 0}
          </div>

          <div className="p-6 pt-0">
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
                <p className="text-gray-500 mb-6">No trips match your search criteria. Try adjusting your filters or check back later.</p>
                <div>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors bg-gray-400 text-white hover:bg-gray-500 h-10 px-4 py-2"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip._id} className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {trip.country_from} → {trip.country_to}
                          </h4>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(trip.status || 'active')}`}>
                            {trip.status || 'Available'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Date:</span> {formatDate(trip.date)}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {trip.departure_time || 'TBD'}
                          </div>
                          <div>
                            <span className="font-medium">Rate:</span> {trip.currency || 'EUR'}{trip.rate_per_kg}/kg
                          </div>
                          <div>
                            <span className="font-medium">Space:</span> {trip.available_cargo_space}kg
                          </div>
                        </div>

                        {trip.description && (
                          <div className="bg-gray-50 p-3 rounded-md text-sm mb-3">
                            <span className="text-gray-600">Description:</span>
                            <p className="mt-1">{trip.description}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Posted: {new Date(trip.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="ml-6 flex space-x-2">
                        <button
                          onClick={() => handleContactTrip(trip)}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-green-300 bg-green-50 hover:bg-green-100 text-green-800 h-9 px-3"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}