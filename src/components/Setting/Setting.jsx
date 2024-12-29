import { useState, useEffect } from "react";
import Layout from "../Layout/Layout";
import { supabase } from "../../config/supabaseClient";
import { PencilIcon, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

export default function Setting() {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    passwordLoading: true,
  });
  const [message, setMessage] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingName, setIsUpdatingName] = useState(false); // New state for name update loading
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); // New state for password update loading

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        console.error("Error fetching authenticated user:", authError);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email")
        .eq("id", authData.user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        setMessage("Failed to fetch user profile.");
      } else {
        setUserData({
          id: data.id,
          name: data.name,
          email: data.email,
        });
        setNewName(data.name);
      }
      setIsLoading(false);
      setUserData((prev) => ({ ...prev, passwordLoading: false }));
    };

    fetchUserData();
  }, []);

  const handleNameChange = async () => {
    setIsUpdatingName(true); // Start loading
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name: newName })
        .eq("id", userData.id);

      if (error) throw error;

      setUserData((prev) => ({ ...prev, name: newName }));
      setIsEditingName(false);
      setMessage("Name updated successfully");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUpdatingName(false); // Stop loading
    }
  };

  const handlePasswordChange = async () => {
    setIsUpdatingPassword(true); // Start loading
    try {
      console.log("Email:", userData.email);
      console.log("Current Password:", currentPassword);

      const { user, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: userData.email,
          password: currentPassword,
        });

      if (signInError) {
        console.error("Sign-in error:", signInError);
        setMessage("Current password is incorrect");
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      // Show success animation
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000); // Hide animation after 3 seconds

      setMessage("Password updated successfully");
      setIsEditingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setNewPasswordVisible(false);
      setConfirmPasswordVisible(false);
    } catch (error) {
      console.error("Error during password change:", error);
      setMessage(error.message);
    } finally {
      setIsUpdatingPassword(false); // Stop loading
    }
  };

  return (
    <Layout>
      <div className="px-32px py-32px relative">
        <h1 className="text-2xl font-semibold text-white mb-6">
          Account Setting
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-full text-center pt-48">
            <span className="text-white">Loading...</span>
          </div>
        ) : (
          <>
            {showSuccessMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-lg z-50"
              >
                Password updated!
              </motion.div>
            )}

            <div className="bg-[#1E1E1E] rounded-lg p-6 border border-gray-800">
              {/* Name Field */}
              <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                <div className="flex items-center">
                  <label className="text-gray-400 w-24">Name</label>
                  {isEditingName ? (
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-white bg-transparent border border-gray-800 rounded-lg px-2 py-1"
                    />
                  ) : (
                    <div className="text-white">
                      {userData.name || "Loading..."}
                    </div>
                  )}
                </div>
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleNameChange}
                      className="bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700"
                      disabled={isUpdatingName} // Disable button while loading
                    >
                      {isUpdatingName ? "Saving..." : "Save"} {/* Loader text */}
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="bg-gray-600 text-white px-2 py-1 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1 text-blue-500"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {/* Email Field */}
              <div className="flex items-center py-4 border-b border-gray-800">
                <label className="text-gray-400 w-24">Email</label>
                <div className="text-white">
                  {userData.email || "Loading..."}
                </div>
              </div>

              {/* Password Field */}
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <label className="text-gray-400 w-24">Password</label>
                  <div className="text-white">
                    {userData.passwordLoading ? "Loading..." : "•••••••"}
                  </div>
                </div>
                {!isEditingPassword && (
                  <button
                    onClick={() => setIsEditingPassword(true)}
                    className="flex items-center gap-1 text-blue-500"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 mt-4"
                >
                  {/* Current Password Input */}
                  <div className="space-y-2 w-full">
                    <div className="text-center">
                      <label className="block text-sm text-gray-400 pr-64">
                        Current Password
                      </label>
                    </div>
                    <div className="relative w-[379px] mx-auto">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-800 rounded-lg px-4 py-2 text-white pr-10"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  {/* New Password Input */}
                  <div className="space-y-2 w-full">
                    <div className="text-center">
                      <label className="block text-sm text-gray-400 pr-64">
                        New Password
                      </label>
                    </div>
                    <div className="relative w-[379px] mx-auto">
                      <input
                        type={newPasswordVisible ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-800 rounded-lg px-4 py-2 text-white pr-10"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewPasswordVisible(!newPasswordVisible)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {newPasswordVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="space-y-2 w-full">
                    <div className="text-center">
                      <label className="block text-sm pr-60 text-gray-400">
                        Confirm Password
                      </label>
                    </div>
                    <div className="relative w-[379px] mx-auto">
                      <input
                        type={confirmPasswordVisible ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-transparent border border-gray-800 rounded-lg px-4 py-2 text-white pr-10"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {confirmPasswordVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <div className="relative">
                      <button
                        onClick={handlePasswordChange}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        disabled={isUpdatingPassword} // Disable button while loading
                      >
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </div>
                    <button
                      onClick={() => setIsEditingPassword(false)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
