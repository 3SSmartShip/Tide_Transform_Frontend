import { useState, useEffect } from 'react';
import Layout from '../Layout/Layout';
import { supabase } from '../../config/supabaseClient';
import { PencilIcon } from 'lucide-react';

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
          <div className="w-full px-16px py-16px">
            <h1 className="text-xl font-semibold text-white mb-4">Account Settings</h1>

            <div className="bg-[#1C2632] rounded-lg p-4 space-y-4">
              {/* Name Field */}
              <div className="space-y-0.5">
                <label className="block text-gray-400 text-s">Full Name</label>
                <div className="text-white text-base">{userData.name}</div>
              </div>

              {/* Email Field */}
              <div className="space-y-0.5">
                <label className="block text-gray-400 text-s">Email Address</label>
                <div className="text-white text-base">{userData.email}</div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                <div className="space-y-0.5 flex-grow">
                  <label className="block text-gray-400 text-s">Password</label>
                  {isEditingPassword ? (
                    <div className="space-y-3 flex flex-col items-center pl-4">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-2/4 bg-gray-800 text-white px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-2/4 bg-gray-800 text-white px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handlePasswordChange}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-sm"
                        >
                          Save Password
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false);
                            setNewPassword('');
                            setConfirmPassword('');
                          }}
                          className="bg-gray-700 text-white px-3 py-1.5 rounded-md hover:bg-gray-600 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white text-sm">••••••••</div>
                  )}
                  {message && (
                    <p className={`text-xs ${message.includes('match') || message.includes('error') ? 'text-red-400' : 'text-green-400'}`}>
                      {message}
                    </p>
                  )}
                </div>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="mt-2 sm:mt-0 p-1.5 text-blue-500 hover:text-blue-400 rounded-md flex items-center gap-1 text-sm"
                  >
                    <PencilIcon className="h-3 w-3" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
    </Layout>
  );
}
