import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import API_BASE_URL from '../../../utils/api';

export default function TripDetails() {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      loadTrip();
    }
  }, [id]);

  const loadTrip = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/trips/${id}`);

      if (response.ok) {
        const data = await response.json();
        setTrip(data.trip || data);
      } else {
        setError('Trip not found');
      }
    } catch (err) {
      setError('Network error while loading trip');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading trip...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h1>
          <p className="text-gray-600 mb-6">The trip you're looking for doesn't exist.</p>
          <Link href="/trips/search" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">
          {trip.country_from} → {trip.country_to}
        </h1>

        <div className="space-y-3">
          <p><strong>Date:</strong> {trip.date}</p>
          <p><strong>Time:</strong> {trip.departure_time || 'TBD'}</p>
          <p><strong>Rate:</strong> {trip.currency || 'EUR'}{trip.rate_per_kg}/kg</p>
          <p><strong>Available Space:</strong> {trip.available_cargo_space}kg</p>
          {trip.description && <p><strong>Description:</strong> {trip.description}</p>}
        </div>

        <div className="mt-6 flex gap-4">
          <Link href="/trips/search" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
            Back to Search
          </Link>
          <Link href={`/trips/${trip.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Edit Trip
          </Link>
        </div>
      </div>
    </div>
  );
}