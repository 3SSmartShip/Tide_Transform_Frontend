import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../config/supabaseClient";

export default function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          console.error("Auth error:", error);
          navigate("/login");
          return;
        }

        // Check if user exists in profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") {
          // Profile doesn't exist - new user
          localStorage.removeItem("isOnboarded");
          navigate("/onboarding");
        } else if (profile) {
          // Existing user
          localStorage.setItem("isOnboarded", "true");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Callback error:", error);
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
