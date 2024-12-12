import { useState } from 'react';
import Layout from '../Layout/Layout';
import { PencilIcon } from 'lucide-react';

export default function Setting() {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: 'Vipul nayak',
    email: 'vipulnayak1192@gmail.com',
    password: '•••••••'
  });

  const handleEdit = (field) => {
    if (field === 'name') {
      setIsEditingName(true);
    } else if (field === 'password') {
      setIsEditingPassword(true);
    }
  };

  const handleSave = (field) => {
    if (field === 'name') {
      setIsEditingName(false);
    } else if (field === 'password') {
      setIsEditingPassword(false);
    }
  };

  const handleChange = (e, field) => {
    setUserData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <h1 className="text-2xl font-semibold text-white mb-6">Account Setting</h1>

        <div className="bg-[#1C2632] rounded-lg p-6 space-y-6">
          {/* Name Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-grow">
              <label className="block text-gray-400">Name</label>
              {isEditingName ? (
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => handleChange(e, 'name')}
                  onBlur={() => handleSave('name')}
                  className="w-full bg-transparent text-white focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="text-white">{userData.name}</div>
              )}
            </div>
            <button
              onClick={() => handleEdit('name')}
              className="p-2 text-blue-500 hover:text-blue-400 rounded-md flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-gray-400">Email</label>
            <div className="text-white">{userData.email}</div>
          </div>

          {/* Password Field */}
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-grow">
              <label className="block text-gray-400">Password</label>
              {isEditingPassword ? (
                <input
                  type="password"
                  value={userData.password}
                  onChange={(e) => handleChange(e, 'password')}
                  onBlur={() => handleSave('password')}
                  className="w-full bg-transparent text-white focus:outline-none"
                  autoFocus
                />
              ) : (
                <div className="text-white">{userData.password}</div>
              )}
            </div>
            <button
              onClick={() => handleEdit('password')}
              className="p-2 text-blue-500 hover:text-blue-400 rounded-md flex items-center gap-2"
            >
              <PencilIcon className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
