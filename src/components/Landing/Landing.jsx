import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import { FaCog } from "react-icons/fa";
import DataProcessing from "../../pages/DataProcessing";

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  const handleDemoClick = () => {
    setShowDemo(true);
    // Smooth scroll to demo section
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-red-400">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8">
            Transform Your Maritime Operations
          </h1>
          <p className="text-xl sm:text-2xl text-white mb-12 max-w-3xl mx-auto">
            Advanced analytics and real-time monitoring for modern fleet management
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              to="/signup"
              className="bg-white text-indigo-600 px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition duration-150"
            >
              Get Started
            </Link>
            <button
              onClick={handleDemoClick}
              className="bg-indigo-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition duration-150 flex items-center gap-2"
            >
              <FaCog className="animate-spin-slow" />
              Try Demo
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-indigo-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pattern Detection Parsing</h3>
            <p className="text-gray-600">Cost-effective solution for consistent document formats with predefined rules and patterns.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-indigo-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3S AI Parsing</h3>
            <p className="text-gray-600">Smart, Scalable, Self-Learning AI for complex document structures and adaptive processing.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-indigo-600 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Analytics</h3>
            <p className="text-gray-600">Track parsing performance, usage metrics, and AI learning progress through our comprehensive dashboard.</p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      {showDemo && (
        <div id="demo-section" className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Try Our Document Processing
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Experience our advanced document analysis capabilities firsthand
              </p>
            </div>
            <DataProcessing />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
