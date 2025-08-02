import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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

  const loadTrip = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/trips/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tripData = data.trip;
        setTrip(tripData);

        // Populate form with existing trip data
        setFormData({
          country_from: tripData.country_from || '',
          country_to: tripData.country_to || '',
          date: tripData.date || '',
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

    // Validate date format (DDMMYYYY)
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(formData.date)) {
      setError('Date must be in DDMMYYYY format (e.g., 25122024)');
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
      const response = await fetch(`http://localhost:5000/api/trips/${id}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          rate_per_kg: parseFloat(formData.rate_per_kg),
          available_cargo_space: parseFloat(formData.available_cargo_space)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Trip updated successfully!');
        // Optionally redirect back to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.error || 'Failed to update trip');
      }
    } catch (err) {
      setError('Network error. Make sure your Flask backend is running.');
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
      const response = await fetch(`http://localhost:5000/api/trips/${id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Trip deleted successfully!');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete trip');
      }
    } catch (err) {
      setError('Network error while deleting trip');
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
          <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist or you don't have permission to edit it.</p>
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
                  <label htmlFor="country_from" className="block text-sm font-medium text-gray-700 mb-1">
                    From Country *
                  </label>
                  <input
                    id="country_from"
                    name="country_from"
                    type="text"
                    required
                    value={formData.country_from}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="e.g., Germany"
                  />
                </div>

                <div>
                  <label htmlFor="country_to" className="block text-sm font-medium text-gray-700 mb-1">
                    To Country *
                  </label>
                  <input
                    id="country_to"
                    name="country_to"
                    type="text"
                    required
                    value={formData.country_to}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="e.g., France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date (DDMMYYYY) *
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="text"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900"
                    placeholder="25122024"
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