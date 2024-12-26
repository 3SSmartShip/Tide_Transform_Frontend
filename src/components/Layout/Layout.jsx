import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart2,
  FileText,
  Settings,
  Wallet,
  LogOut as LogOutIcon,
  Home,
  Upload as UploadIcon,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_navbar.png";
import { supabase } from "../../config/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [planDetails, setPlanDetails] = useState({ used: 0, total: 5000 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const profileMenuRef = useRef(null);

  // Function to determine if the current route is active
  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out:", error);
      } else {
        dispatch(logout());
        localStorage.removeItem("isOnboarded"); // Remove onboarding flag on logout
        navigate("/login");
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Navigation items for the sidebar
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/dashboard/documents", icon: FileText, label: "All Documents" },
    { path: "/billings", icon: Wallet, label: "Billings" },
    { path: "/dashboard/api", icon: BarChart2, label: "API" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user email from Supabase Auth and name from profiles table
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Set loading to true before fetching
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Error fetching authenticated user:", authError);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", authData.user.id) // Use the user ID from authData
        .single();
      if (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile.");
      } else {
        setUserEmail(data.email);
        setUserName(data.name.trim()); // Trim any extra whitespace
      }
      setLoading(false); // Set loading to false after fetching
    };
    fetchUserData();
  }, []);

  const handleProfileMenuNavigation = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0B]">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 text-white p-2 hover:bg-gray-800 rounded-md"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-black border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex items-center gap-2 px-4 py-6">
          <img
            src={TideTransformLogo}
            alt="Tide Transform"
            className="h-8 w-auto"
          />
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
                className={`flex items-center px-4 py-3 mx-2 ${
                  isActive
                    ? "bg-green-500 text-black border border-green-500 rounded-[10px] shadow"
                    : "text-gray-300 hover:bg-gray-800 rounded-[10px] shadow"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
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
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(planDetails.used / planDetails.total) * 100}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-400">
              {planDetails.used}/{planDetails.total} Pages Used
            </p>
          </div>
          <button
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate("/billings")}
          >
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
                onClick={() => navigate("/dashboard/upload")}
              >
                <UploadIcon className="h-5 w-5" />
                Upload
              </button>
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="bg-[#1A1A1A] rounded-full w-8 h-8 flex items-center justify-center text-white">
                    {userName ? userName.charAt(0).toUpperCase() : ""}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transform transition-transform ${
                      showProfileMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-[#1A1A1A] rounded-lg border border-gray-800 overflow-hidden z-50"
                    >
                      <div className="p-4 space-y-4">
                        {/* User Information */}
                        <div className="space-y-1">
                          <p className="font-medium text-white">
                            {userName || "User Name"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {userEmail || "user@example.com"}
                          </p>
                        </div>

                        {/* Quota Details */}
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-white">
                            3S AI Parsing
                          </h3>
                          <div className="flex justify-between text-sm text-white">
                            <span>Pages Used</span>
                            <span>
                              {planDetails.used}/{planDetails.total}
                            </span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${
                                  (planDetails.used / planDetails.total) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <button
                            className="w-full py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors text-white "
                            onClick={() => navigate("/billings")}
                          >
                            Upgrade Plan
                          </button>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="space-y-1">
                          <button
                            onClick={() =>
                              handleProfileMenuNavigation("/dashboard/api")
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-md transition-colors text-white"
                          >
                            <BarChart2 className="w-4 h-4" />
                            <span>API</span>
                          </button>
                          <button
                            onClick={() =>
                              handleProfileMenuNavigation("/settings")
                            }
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-md transition-colors text-white"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            <LogOutIcon className="w-4 h-4" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">{children}</div>
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
