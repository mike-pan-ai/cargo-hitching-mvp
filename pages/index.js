import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
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
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-6">
            Ship Your Cargo Anywhere
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with travelers who have extra cargo space.
            Save money on shipping and help others earn on their trips.
          </p>

          {/* Quick Search */}
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-gray-800 text-lg font-semibold mb-4">Find Available Cargo Space</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="From (e.g., Germany)"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
              <input
                type="text"
                placeholder="To (e.g., France)"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
              />
              <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 font-semibold">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-white">
          <div className="text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p>Ship your cargo at a fraction of traditional shipping costs</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold mb-2">Global Network</h3>
            <p>Connect with travelers going to destinations worldwide</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Safe</h3>
            <p>Verified users and secure payment system for peace of mind</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <div className="space-x-4">
            <Link href="/register" className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 font-semibold inline-block">
              I Need to Ship Cargo
            </Link>
            <Link href="/register" className="bg-yellow-500 text-white px-8 py-3 rounded-lg hover:bg-yellow-600 font-semibold inline-block">
              I Have Cargo Space
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}