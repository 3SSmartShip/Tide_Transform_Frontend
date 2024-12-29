    // Start of Selection
    
    import React, { useEffect, useState } from "react";
    import { motion, AnimatePresence } from "framer-motion"
    import { ChevronDown, LogOut, Settings, PenToolIcon as Tool, PiIcon as Api } from 'lucide-react'
    import { useNavigate, Navigate } from 'react-router-dom'
    import { supabase } from '../../config/supabaseClient'
    import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_navbar.png";
       
    const roles = [
      'Developer',
      'Designer',
      'CEO/CTO',
      'Master all these'
    ]
       
    export default function OnboardingDashboard() {
      const navigate = useNavigate()
      const [currentStep, setCurrentStep] = React.useState('dashboard')
      const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
      const [isProfileOpen, setIsProfileOpen] = React.useState(false)
      const [userInfo, setUserInfo] = React.useState({
        name: '',
        email: '',
        country: '',
        role: ''
      })
    
      const [error, setError] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [isOnboarded, setIsOnboarded] = React.useState(false);
    
      useEffect(() => {
        const checkOnboardingStatus = async () => {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
    
          if (userError || !user) {
            navigate("/login");
            return;
          }

          // Fetch user email from Supabase auth and set it in userInfo
          setUserInfo(prev => ({ ...prev, email: user.email }));
    
          const { data, error } = await supabase
            .from("profiles")
            .select("is_onboarded")
            .eq("id", user.id)
            .single();
    
          if (error) {
            console.error("Error fetching onboarding status:", error);
          } else if (data?.is_onboarded) {
            navigate("/dashboard/upload"); // Redirect if already onboarded
          }
        };
    
        checkOnboardingStatus();
      }, [navigate]);
    
    
    
      const handleContinue = () => {
        setCurrentStep('form')
      }
    
      const handleDone = async () => {
        const { name, country, role } = userInfo
        if (!name || !country || !role) {
          setError('Please fill in all the fields.')
          return
        }
    
        setLoading(true)
        setError(null)
    
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !user) {
            throw new Error('User not found')
          }
    
          const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              name,
              country,
              role,
              email: user.email,
              is_onboarded: true,
              updated_at: new Date().toISOString()
            })
    
          if (updateError) {
            throw updateError
          }
    
          // Clear any stored flags
          localStorage.removeItem('isNewUser')
          navigate('/dashboard/upload')
          
        } catch (err) {
          console.error('Onboarding error:', err)
          setError('An unexpected error occurred. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    
      const handleRoleSelect = (role) => {
        setUserInfo(prev => ({ ...prev, role }))
        setIsDropdownOpen(false)
      }
    
      const handleLogout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Error logging out:', error)
        } else {
          navigate('/login')
        }
      }
    
      return (
        <div className="flex min-h-screen bg-black text-white">
          {/* Sidebar */}
          <div className="w-[258px] flex flex-col">
            <div className="p-4">
              <div className="flex items-center gap-2">
                    <img 
                      src={TideTransformLogo} 
                      alt="Tide Transform" 
                      className="w-44 h-06"
                    />
      
              </div>
            </div>
          </div>
    
          {/* Main content */}
          <div className="flex-1 flex flex-col">
            {/* Navbar */}
            <div className="flex justify-end items-center p-4">
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="bg-[#1A1A1A] rounded-full w-8 h-8 flex items-center justify-center">
                    {userInfo.name.charAt(0).toUpperCase() || ''}
                  </div>
                  <ChevronDown className={`w-4 h-4 transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
    
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-[#1A1A1A] rounded-lg border border-gray-800 overflow-hidden z-50"
                    >
                      <div className="p-4 space-y-4">
                        <div className="space-y-1">
                          <p className="font-medium">{userInfo.name || 'User Name'}</p>
                          <p className="text-sm text-gray-400">{userInfo.email || 'user@example.com'}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">3S AI Parsing</h3>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Pages Used</span>
                            <span>5/5000</span>
                          </div>
                          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full w-[0.1%] bg-blue-500 rounded-full" />
                          </div>
                          <button className="w-full py-2 border border-gray-700 rounded-md hover:bg-gray-800 transition-colors">
                            Upgrade Plan
                          </button>
                        </div>
    
                        <div className="space-y-1">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-gray-800 rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
    
            {/* Page content */}
            <div className="flex-1 p-8">
              <AnimatePresence mode="wait">
                {currentStep === 'dashboard' ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-3xl font-normal mb-8">Welcome on board,</h1>
    
                    <div className="space-y-6">
                      <StepItem
                        number={1}
                        title="Log in/sign up your account"
                        description="Get started by logging in or signing up to access your personalized dashboard and unlock smarter maritime solutions"
                      />
    
                      <StepItem
                        number={2}
                        title="Choose your right plan"
                        description="Select a plan that best fits your needs to maximize the benefits of our services."
                      />
    
                      <StepItem
                        number={3}
                        title="Drag and drop your document"
                        description="Upload your document effortlessly to kickstart intelligent processing and management."
                      />
    
                      <button
                        onClick={handleContinue}
                        className="bg-[#0066FF] text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h1 className="text-3xl font-normal">Welcome on board, {userInfo.name || 'User'}</h1>
    
                    <div className="space-y-6 max-w-xl">
                      {error && (
                        <div className="mb-4 text-red-500">
                          {error}
                        </div>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm">Name</label>
                        <input
                          type="text"
                          value={userInfo.name}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full bg-transparent border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:border-[#0066FF]"
                          placeholder="Enter your name"
                        />
                      </div>
    
                      <div className="space-y-2">
                        <label className="block text-sm">Country</label>
                        <input
                          type="text"
                          placeholder="Enter country name"
                          value={userInfo.country}
                          onChange={(e) => setUserInfo(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full bg-transparent border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:border-[#0066FF]"
                        />
                      </div>
    
                      <div className="space-y-2">
                        <label className="block text-sm">Role</label>
                        <div className="relative">
                          <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-transparent border border-gray-800 rounded-md px-4 py-2 focus:outline-none focus:border-[#0066FF] flex justify-between items-center"
                          >
                            {userInfo.role || 'Select your role'}
                            <ChevronDown className={`transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A1A] border border-gray-800 rounded-md overflow-hidden z-50"
                              >
                                {roles.map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleSelect(role)}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center gap-2"
                                  >
                                    {role}
                                    {userInfo.role === role && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-2 h-2 rounded-full bg-[#0066FF] ml-auto"
                                      />
                                    )}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
    
                      <button
                        onClick={handleDone}
                        disabled={loading}
                        className={`bg-[#0066FF] text-white px-8 py-2 rounded-md hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {loading ? 'Submitting...' : 'Done'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )
    }
       
    function StepItem({ number, title, description }) {
      return (
        <div className="space-y-2">
          <div className="flex items-baseline gap-4">
            <h2 className="text-xl">
              {number}. {title}
            </h2>
          </div>
          <p className="text-sm text-gray-400 border-l-2 border-yellow-500 pl-4">
            {description}
          </p>
        </div>
      )
    }