import { supabase } from '../config/supabaseClient';
import env from '../config/env';

export const emailService = {
    async sendVerificationEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${env.APP_URL}/dashboard`,
                    data: {
                        // Add any custom metadata if needed
                        signUpSource: 'web',
                    }
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to send verification email:', error);
            throw error;
        }
    },

    async sendPasswordResetEmail(email) {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${env.APP_URL}/reset-password`,
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to send password reset email:', error);
            throw error;
        }
    },

    async resendVerificationEmail(email) {
        try {
            const { data, error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${env.APP_URL}/dashboard`,
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to resend verification email:', error);
            throw error;
        }
    },

    async sendEmailChange(email) {
        try {
            const { data, error } = await supabase.auth.updateUser({
                email: email,
                options: {
                    emailRedirectTo: `${env.APP_URL}/dashboard`,
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Failed to send email change verification:', error);
            throw error;
        }
    }
}; 