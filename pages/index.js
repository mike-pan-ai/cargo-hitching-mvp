import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="font-semibold text-lg text-gray-900 berlin-type-font text-xl">SeasonShip</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Link href="/dashboard">
                  <button className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <button className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                      Login
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors rounded-lg">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Ship, & Save
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect cargo owners with drivers who have available space. Reduce costs, maximize efficiency, and build a sustainable logistics network.
          </p>

          {/* Show dashboard link if logged in */}
          {user && (
            <div className="mt-8">
              <Link href="/dashboard">
                <button className="bg-black text-white px-8 py-4 text-lg font-medium hover:bg-gray-800 transition-colors rounded-lg">
                  Go to Dashboard
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}