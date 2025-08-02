// pages/trips/my-trips.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import API_BASE_URL from '../../utils/api';

export default function MyTrips() {
  const { user, logout, authenticatedFetch } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);

  const loadTrips = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/trips/my-trips`);

      if (response && response.ok) {
        const data = await response.json();
        setTrips(data.trips || []);
      } else if (response) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load trips');
      }
    } catch (err) {
      console.error('Error loading trips:', err);
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    setDeleteLoading(tripId);
    setError('');

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/api/trips/${tripId}/delete`, {
        method: 'DELETE'
      });

      if (response && response.ok) {
        setTrips(trips.filter(trip => trip._id !== tripId));
      } else if (response) {
        const data = await response.json();
        setError(data.error || 'Failed to delete trip');
      }
    } catch (err) {
      console.error('Error deleting trip:', err);
      setError('Network error while deleting trip');
    } finally {
      setDeleteLoading(null);
    }
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  const getFilterCount = (status) => {
    if (status === 'all') return trips.length;
    return trips.filter(trip => trip.status === status).length;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-4 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your trips...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-600 mt-2">Manage all your cargo space listings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadTrips}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              href="/trips/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post New Trip
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

        {/* Filter Tabs */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div>
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'all', label: 'All Trips', count: getFilterCount('all') },
                { key: 'active', label: 'Active', count: getFilterCount('active') },
                { key: 'completed', label: 'Completed', count: getFilterCount('completed') },
                { key: 'cancelled', label: 'Cancelled', count: getFilterCount('cancelled') }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Trips List */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">My Trips ({filteredTrips.length})</h3>
            {filteredTrips.length > 0 && (
              <button
                onClick={loadTrips}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            )}
          </div>

          <div className="p-6 pt-0">
            {filteredTrips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
                </h3>
                <p className="text-gray-500 mb-6">
                  {filter === 'all'
                    ? 'Create your first trip to start connecting with cargo shippers.'
                    : `You don't have any ${filter} trips at the moment.`}
                </p>
                {filter === 'all' && (
                  <Link href="/trips/create">
                    <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Your First Trip
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTrips.map((trip) => (
                  <div key={trip._id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {trip.country_from} → {trip.country_to}
                          </h3>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {trip.status || 'active'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-gray-600 mb-4">
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

                        <div className="text-xs text-gray-500">
                          Created: {new Date(trip.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="ml-8 flex space-x-3">
                        <Link href={`/trips/${trip._id}/edit`}>
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 h-10 px-4">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          disabled={deleteLoading === trip._id}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 h-10 px-4 disabled:opacity-50"
                        >
                          {deleteLoading === trip._id ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </>
                          )}
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