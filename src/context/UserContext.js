import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({ name: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData.user) {
                console.error("Error fetching authenticated user:", authError);
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("name, email")
                .eq("id", authData.user.id)
                .single();

            if (error) {
                console.error("Error fetching user profile:", error);
                setError("Failed to fetch user profile.");
            } else {
                setUserData({ name: data.name, email: data.email });
            }
            setLoading(false);
        };

        fetchUserData();
    }, []);

    return (
        <UserContext.Provider value={{ userData, loading, error }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
