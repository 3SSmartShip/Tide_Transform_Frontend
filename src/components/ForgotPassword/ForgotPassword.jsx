"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";
import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_bw.png";

export default function ForgotPassword() {
  // Preserve all existing state and logic
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // Preserve all existing handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setShowOtpInput(true);
      setOtp(["", "", "", "", "", ""]);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError(error.message || "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const otpString = otp.join("");
      const { data, error: verificationError } = await supabase.auth.verifyOtp({
        email,
        token: otpString,
        type: "recovery",
      });

      if (verificationError) {
        setError("Invalid verification code. Please try again.");
        return;
      }

      if (data?.user) {
        setShowOtpInput(false);
        setShowPasswordInput(true);
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError("Failed to change password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-full">
      {/* Left section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col ">
        <div className="flex items-center gap-2 mb-8 -ml-4 p-6">
          <img
            src={TideTransformLogo}
            alt="Tide Transform"
            className="h-45px] w-[200px]"
          />
        </div>

        <div className="flex-grow flex flex-col justify-center max-w-lg p-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            See how it works
          </h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Smart Document Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Transform maritime documents into structured data instantly
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Get results in seconds with our advanced AI engine
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Reliable</h3>
                <p className="text-gray-600 text-sm">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="rounded-3xl bg-[#EBF3FF] p-8 md:p-10">
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Email Input Section */}
            {!showOtpInput && !showPasswordInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold">Forgot Password?</h2>
                <p className="mt-2 text-gray-600">
                  No worries, we'll send you reset instructions.
                </p>

                <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#0066FF] py-4 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Sending..." : "Send OTP"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* OTP Input Section */}
            {showOtpInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold">Enter Verification Code</h2>
                <p className="mt-2 text-gray-600">
                  No worries, we'll send you reset instructions.
                </p>

                <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
                  <div className="flex gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e, index)}
                        ref={(el) => (inputsRef.current[index] = el)}
                        className="h-12 w-full rounded-lg border-2 border-gray-300 text-center text-xl font-semibold focus:border-blue-500 focus:outline-none"
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#0066FF] py-4 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Verifying..." : "Verify Your Account"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* New Password Section */}
            {showPasswordInput && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold">Set New Password</h2>
                <p className="mt-2 text-gray-600">
                  No worries, we'll send you reset instructions.
                </p>

                <form
                  onSubmit={handleChangePassword}
                  className="mt-8 space-y-6"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="new-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirm-password"
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPass ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Must be at least 8 characters
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        className="h-4 w-4 text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Must contain one special character
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-lg bg-[#0066FF] py-4 font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isLoading ? "Changing..." : "Reset Password"}
                  </button>

                  {error && (
                    <div className="mt-4 text-center text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="mt-4 text-center"
                    >
                      <div className="inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
                        <svg className="mr-2 h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {successMessage}
                      </div>
                    </motion.div>
                  )}
                </form>
              </motion.div>
            )}

            <div className="mt-6 text-center text-sm">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Back to login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

