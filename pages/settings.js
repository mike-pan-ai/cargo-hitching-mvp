import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Change Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNewTrips: true,
    emailTripUpdates: true,
    emailMessages: true,
    smsNotifications: false,
    marketingEmails: false
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true
  });

  const router = useRouter();

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    // Use stored user data for now (since backend profile endpoint might not exist yet)
    if (userData) {
      const user = JSON.parse(userData);
      setUser({
        ...user,
        created_at: new Date().toISOString(),
        is_verified: true,
        phone: user.phone || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }

    setLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setUpdateLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setUpdateLoading(false);
      return;
    }

    // For now, just show success (backend integration needed)
    setTimeout(() => {
      setSuccess('Password change feature coming soon!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setUpdateLoading(false);
    }, 1000);
  };

  const handleNotificationUpdate = async () => {
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    // For now, just show success (backend integration needed)
    setTimeout(() => {
      setSuccess('Notification settings saved! (Feature coming soon)');
      setUpdateLoading(false);
    }, 1000);
  };

  const handlePrivacyUpdate = async () => {
    setUpdateLoading(true);
    setError('');
    setSuccess('');

    // For now, just show success (backend integration needed)
    setTimeout(() => {
      setSuccess('Privacy settings saved! (Feature coming soon)');
      setUpdateLoading(false);
    }, 1000);
  };

  const handleDeleteAccount = () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your trips and data. Are you absolutely sure?')) {
      return;
    }

    alert('Account deletion feature coming soon. Please contact support for now.');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  const tabs = [
    { id: 'account', name: 'Account', icon: '👤' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'security', name: 'Security', icon: '🛡️' }
  ];

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
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Account Settings</h1>
            <p className="text-blue-100">Manage your account preferences and security settings</p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 border-r border-gray-200">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
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

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                        {user?.first_name ? user.first_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user?.first_name && user?.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : 'Complete your profile'}
                        </h3>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-sm text-gray-500">
                          Member since {new Date(user?.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-900">{user?.email}</p>
                        {user?.is_verified && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Link
                        href="/profile"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Edit Profile
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-4">
                        {Object.entries({
                          emailNewTrips: 'New trips matching your preferences',
                          emailTripUpdates: 'Updates to your posted trips',
                          emailMessages: 'New messages from other users',
                          marketingEmails: 'Marketing emails and promotions'
                        }).map(([key, label]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-gray-700">{label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={notifications[key]}
                                onChange={(e) => setNotifications({
                                  ...notifications,
                                  [key]: e.target.checked
                                })}
                              />
                              <div className={`w-11 h-6 rounded-full ${notifications[key] ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications[key] ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">SMS notifications for urgent updates</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={notifications.smsNotifications}
                            onChange={(e) => setNotifications({
                              ...notifications,
                              smsNotifications: e.target.checked
                            })}
                          />
                          <div className={`w-11 h-6 rounded-full ${notifications.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notifications.smsNotifications ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleNotificationUpdate}
                      disabled={updateLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateLoading ? 'Saving...' : 'Save Notification Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h2>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public - Anyone can see your profile' },
                          { value: 'registered', label: 'Registered users only' },
                          { value: 'private', label: 'Private - Only you can see your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={privacy.profileVisibility === option.value}
                              onChange={(e) => setPrivacy({
                                ...privacy,
                                profileVisibility: e.target.value
                              })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-gray-700">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Show email address in profile</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={privacy.showEmail}
                              onChange={(e) => setPrivacy({
                                ...privacy,
                                showEmail: e.target.checked
                              })}
                            />
                            <div className={`w-11 h-6 rounded-full ${privacy.showEmail ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${privacy.showEmail ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Show phone number in profile</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={privacy.showPhone}
                              onChange={(e) => setPrivacy({
                                ...privacy,
                                showPhone: e.target.checked
                              })}
                            />
                            <div className={`w-11 h-6 rounded-full ${privacy.showPhone ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${privacy.showPhone ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">Allow other users to message you</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={privacy.allowMessages}
                              onChange={(e) => setPrivacy({
                                ...privacy,
                                allowMessages: e.target.checked
                              })}
                            />
                            <div className={`w-11 h-6 rounded-full ${privacy.allowMessages ? 'bg-blue-600' : 'bg-gray-200'} relative transition-colors`}>
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${privacy.allowMessages ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handlePrivacyUpdate}
                      disabled={updateLoading}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updateLoading ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({
                              ...passwordForm,
                              currentPassword: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updateLoading ? 'Changing Password...' : 'Change Password'}
                        </button>
                      </form>
                    </div>

                    {/* Account Security */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Email Verification</h4>
                            <p className="text-sm text-gray-600">Your email address verification status</p>
                          </div>
                          {user?.is_verified ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                              ✓ Verified
                            </span>
                          ) : (
                            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                              Verify Email
                            </button>
                          )}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                          </div>
                          <button
                            onClick={() => alert('2FA feature coming soon!')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          >
                            Enable 2FA
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">Active Sessions</h4>
                            <p className="text-sm text-gray-600">Manage devices that are signed into your account</p>
                          </div>
                          <button
                            onClick={() => alert('Session management coming soon!')}
                            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                          >
                            View Sessions
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-red-200 pt-8">
                      <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-900 mb-2">Delete Account</h4>
                        <p className="text-sm text-red-700 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}