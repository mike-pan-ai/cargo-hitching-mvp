// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      router.push(returnUrl);
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    const result = await login(formData.email, formData.password, rememberMe);

    if (result.success) {
      // Redirect to intended page or dashboard
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl');
      router.push(returnUrl);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    {/* Logo outside the box */}
    <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
  <div className="flex justify-center">
    <div className="text-3xl font-bold text-gray-900 flex items-center">
      <span className="berlin-type-font text-3xl">SEASONSHIP</span>
    </div>
  </div>
</div>

<div className="sm:mx-auto sm:w-full sm:max-w-md">
  <div className="bg-white py-8 px-6 border border-gray-200 rounded-lg sm:px-10">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email and password to access your dashboard
      </p>
          <p className="mt-2 text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create one here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me for 30 days
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              {rememberMe ? (
                <>
                  <span className="text-green-600">✓</span> You&apos;ll stay logged in for 30 days on this device
                </>
              ) : (
                <>
                  <span className="text-yellow-600">⚠</span> You&apos;ll need to log in again when you close your browser
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
  );
}