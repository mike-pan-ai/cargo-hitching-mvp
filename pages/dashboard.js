// pages/dashboard.js - Styled to match v0 design
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import API_BASE_URL from '../utils/api';

export default function Dashboard() {
  const { user, logout, authenticatedFetch } = useAuth();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load user trips using authenticated fetch
      const token = localStorage.getItem('token');
      const tripsResponse = await fetch(`${API_BASE_URL}/api/trips/my-trips`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (tripsResponse && tripsResponse.ok) {
        const tripsData = await tripsResponse.json();
        setTrips(tripsData.trips || []);
      } else if (tripsResponse) {
        const errorData = await tripsResponse.json();
        setError(errorData.error || 'Failed to load trips');
      }

      // Load user stats using authenticated fetch
      const statsResponse = await fetch(`${API_BASE_URL}/api/trips/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
      });
      if (statsResponse && statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
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
      const response = await authenticatedFetch(`API_BASE_URL/api/trips/${tripId}/delete`, {
        method: 'DELETE'
      });

      if (response && response.ok) {
        // Remove trip from local state
        setTrips(trips.filter(trip => trip._id !== tripId));
        // Reload data to update stats
        loadUserData();
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
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-4 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex gap-2">
            <Link href="/trips/create">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-black text-white hover:bg-gray-800">
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Trip
              </button>
            </Link>
            <Link href="/trips/search">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 border-gray-300 hover:bg-gray-50">
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

        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Shipments */}
            <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-600">Active Shipments</h3>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stats.active_trips || 0}</div>
                <p className="text-xs text-gray-500">
                  {stats.active_change >= 0 ? '+' : ''}{stats.active_change || 0} from last month
                </p>
              </div>
            </div>

            {/* Total Earnings */}
            <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-600">Total Earnings</h3>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">€{stats.total_earnings ? stats.total_earnings.toFixed(0) : '0'}</div>
                <p className="text-xs text-gray-500">
                  {stats.earnings_change >= 0 ? '+' : ''}{stats.earnings_change || 0}% from last month
                </p>
              </div>
            </div>

            {/* Completed Trips */}
            <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-600">Completed Trips</h3>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stats.completed_trips || 0}</div>
                <p className="text-xs text-gray-500">
                  {stats.completed_change >= 0 ? '+' : ''}{stats.completed_change || 0} from last month
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
              <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-gray-600">Rating</h3>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="p-6 pt-0">
                <div className="text-2xl font-bold">{stats.average_rating ? stats.average_rating.toFixed(1) : '0.0'}</div>
                <p className="text-xs text-gray-500">Based on {stats.total_reviews || 0} reviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Card */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">Recent Activity</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              {trips.slice(0, 3).map((trip) => (
                <div key={`recent-${trip._id}`} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    trip.status === 'completed' ? 'bg-green-500' :
                    trip.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {trip.status === 'completed' ? 'Shipment delivered' :
                       trip.status === 'active' ? 'Active cargo shipment' : 'Route updated'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {trip.country_from} → {trip.country_to} • {formatDate(trip.date)}
                    </p>
                  </div>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    trip.status === 'completed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {trip.status === 'completed' ? `€${(trip.rate_per_kg * 50).toFixed(0)}` :
                     trip.status === 'active' ? 'Active' : 'Updated'}
                  </div>
                </div>
              ))}

              {trips.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* My Trips Section */}
        <div className="rounded-lg border bg-card text-card-foreground bg-white border-gray-200">
          <div className="flex items-center justify-between p-6 pb-4">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">My Trips ({trips.length})</h3>
            {trips.length > 0 && (
              <button
                onClick={loadUserData}
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
            {trips.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h3>
                <p className="text-gray-500 mb-6">Create your first trip to start connecting with cargo shippers.</p>
                <Link href="/trips/create">
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-black text-white hover:bg-gray-800 h-10 px-4 py-2">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post Your First Trip
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={`trip-${trip._id}`} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {trip.country_from} → {trip.country_to}
                          </h4>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(trip.status)}`}>
                            {trip.status || 'active'}
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
                          <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                            <span className="text-gray-600">Description:</span>
                            <p className="mt-1">{trip.description}</p>
                          </div>
                        )}

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

                      <div className="ml-6 flex space-x-2">
                        <Link href={`/trips/${trip._id}/edit`}>
                          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 h-9 px-3">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDeleteTrip(trip._id)}
                          disabled={deleteLoading === trip._id}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 h-9 px-3 disabled:opacity-50"
                        >
                          {deleteLoading === trip._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-1"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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