import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) throw signUpError;

      if (data?.user) {
        navigate("/confirm-email");
      }
    } catch (error) {
      console.error("SignUp error:", error);
      setError(error.message || "An error occurred during sign-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-red-400">
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
        <Link to="/" className="text-white text-xl sm:text-2xl font-bold">
          Tide Transform
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Create your account
          </h1>

          {error && (
            <div className="p-4 mb-4 rounded-md bg-red-50 text-red-800">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
