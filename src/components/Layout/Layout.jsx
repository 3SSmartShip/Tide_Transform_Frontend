import { Link, useLocation } from 'react-router-dom';
import { BarChart2, FileText, Settings, Wallet, LogOut, Home, Upload, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/authSlice'

export default function Layout({ children }) {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    dispatch(logout())
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/documents', icon: FileText, label: 'All Documents' },
    { path: '/billings', icon: Wallet, label: 'Billings' },
    { path: '/dashboard/api', icon: FileText, label: 'API' },
    { path: '/settings', icon: Settings, label: 'Setting' },
  ];

  return (
    <div className="flex h-screen bg-black">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 text-white p-2 hover:bg-gray-800 rounded-md"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-black border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out z-40`}>
        <div className="flex items-center gap-2 px-4 py-6">
          <div className="bg-[#EEFF00] rounded-full p-2">
            <span className="font-bold text-black">3s</span>
          </div>
          <span className="text-white font-semibold">Smart Ship</span>
        </div>

        <nav className="mt-6 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 ${
                  isActive
                    ? 'bg-[#EEFF00] text-black'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Quota Section */}
        <div className="p-4 border-t border-gray-800">
          <h3 className="text-white mb-3">Your Quota</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">3S AI Parsing</p>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-[#EEFF00] h-2 rounded-full" style={{ width: '5%' }}></div>
            </div>
            <p className="text-sm text-gray-400">5/5000 Pages Used</p>
          </div>
          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0 w-full">
        {/* Navbar */}
        <div className="border-b border-gray-800 bg-black">
          <div className="flex items-center justify-end h-16 px-4">
            <div className="flex items-center space-x-4">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
                onClick={() => window.location.href = '/dashboard/upload'}
              >
                <Upload className="h-5 w-5" />
                Upload
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="h-8 w-8 rounded-full bg-gray-700 cursor-pointer"
                />
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 py-2 w-48 bg-zinc-900 rounded-md shadow-lg border border-gray-800">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}