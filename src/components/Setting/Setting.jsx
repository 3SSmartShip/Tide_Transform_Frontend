import { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { PencilIcon } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

export default function Setting() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          email: user.email
        });
      }
    };

    fetchUserData();
  }, []);

  const handlePasswordChange = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setMessage('Passwords do not match');
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
        if (error) throw error;

        setMessage('Password updated successfully');
        setIsEditingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      } catch (error) {
        setMessage(error.message);
      }
    };

  return (
    <Layout>
      <div className="px-8 min-h-screen">
        <h1 className="text-2xl font-semibold text-white mb-6">Account Settings</h1>

        <div className="bg-[#1C2632] rounded-lg p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm">Full Name</label>
            <div className="text-white text-lg">{userData.name}</div>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-gray-400 text-sm">Email Address</label>
            <div className="text-white text-lg">{userData.email}</div>
          </div>

          {/* Password Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-grow">
              <label className="block text-gray-400">Password</label>
              {isEditingPassword ? (
                <div className="space-y-4">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Save Password
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingPassword(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-white">••••••••</div>
              )}
              {message && (
                <p className={`text-sm ${message.includes('match') || message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </div>
            {!isEditingPassword && (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="p-2 text-blue-500 hover:text-blue-400 rounded-md flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}