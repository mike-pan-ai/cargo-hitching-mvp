import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API_BASE_URL from '../../utils/api';

export default function PublicProfile() {
  const router = useRouter();
  const { userId } = router.query;
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (userId) {
      loadProfileData();
      loadCurrentUser();
    }
  }, [userId]);

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`);
      if (!profileResponse.ok) {
        throw new Error('Profile not found');
      }
      const profileData = await profileResponse.json();
      setProfile(profileData);

      // Load user's trips
      const tripsResponse = await fetch(`${API_BASE_URL}/api/trips/user/${userId}`);
      if (tripsResponse.ok) {
        const tripsData = await tripsResponse.json();
        const trips = Array.isArray(tripsData) ? tripsData : (tripsData.trips || []);
setTrips(trips.slice(0, 5));
      }

      // Load reviews (you'll need to implement this endpoint)
      const reviewsResponse = await fetch(`${API_BASE_URL}/api/reviews/user/${userId}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setReviews(reviewsData.slice(0, 3)); // Show last 3 reviews
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <Link href="/trips/search" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
            ← Back to Search
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
              <Link href="/trips/search" className="text-gray-600 hover:text-gray-900">
                ← Back to Search
              </Link>
              {currentUser && (
                <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Avatar */}
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.firstname ? profile.firstname[0].toUpperCase() : profile.email[0].toUpperCase()}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile.firstname && profile.lastname 
                    ? `${profile.firstname} ${profile.lastname}`
                    : profile.email.split('@')[0]
                  }
                </h1>
                
                {/* Rating */}
                <div className="flex items-center mt-2">
                  <div className="flex">
                    {renderStars(Math.round(calculateAverageRating()))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {calculateAverageRating()} ({reviews.length} reviews)
                  </span>
                </div>

                {/* Member Since */}
                <p className="text-gray-500 mt-1">
                  Member since {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>

                {/* Verification Badges */}
                <div className="flex items-center space-x-2 mt-2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    ✓ Email Verified
                  </span>
                  {profile.phone && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      ✓ Phone Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Button */}
            {currentUser && currentUser.id !== profile.id && (
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact {profile.firstname || 'User'}
              </button>
            )}
          </div>

          {/* Bio/Description */}
          {profile.bio && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Company Info */}
          {profile.company && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Company</h3>
              <p className="text-gray-700">{profile.company}</p>
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 mt-1 inline-block"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Trips */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Trips</h2>
            {trips.length > 0 ? (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {trip.country_from} → {trip.country_to}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(trip.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-blue-600">
                          €{trip.rate_per_kg}/kg • {trip.available_cargo_space}kg space
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trip.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {trip.status || 'Active'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No recent trips</p>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{review.review}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {review.reviewer_name || 'Anonymous'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal 
          profile={profile}
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
}
// Updated ContactModal component for your pages/profile/[userId].js
// Replace your existing ContactModal component with this:

function ContactModal({ profile, isOpen, onClose }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  // Pre-fill with a professional template
  useEffect(() => {
    if (isOpen && profile) {
      setMessage(`Hi ${profile.firstname || 'there'}!

I'm interested in your cargo transport services. Could we discuss the details?

Looking forward to hearing from you!`);
    }
  }, [isOpen, profile]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setSending(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login to send messages');
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipient_id: profile.id,
          message: message.trim(),
          trip_id: null // Can add trip context later
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Redirect to chat page
        onClose();
        router.push(`/chat/${profile.id}`);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Start Chat with {profile.firstname || 'User'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={sending}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                {profile.firstname ? profile.firstname[0].toUpperCase() : profile.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {profile.firstname && profile.lastname
                    ? `${profile.firstname} ${profile.lastname}`
                    : profile.email.split('@')[0]
                  }
                </p>
                <p className="text-sm text-gray-600">{profile.email}</p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your message:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              disabled={sending}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">
              {message.length}/1000 characters
            </div>
          </div>

          {/* Benefits of Using Chat */}
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <div className="flex items-start">
              <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-medium">Why use chat?</p>
                <p>• Instant responses • Negotiate rates • Discuss cargo details • Keep everything organized</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Starting Chat...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Start Chat
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}