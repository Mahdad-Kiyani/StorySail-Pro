import { useState, useCallback } from "react";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { supabase } from "../../lib/supabase";
import { getEnvironmentConfig } from "../env";

interface AuthActions {
	loading: boolean;
	signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signUpWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
}

export function useAuthActions(): AuthActions {
	
	const [loading, setLoading] = useState(false);

	const signInWithEmail = useCallback(async (email: string, password: string) => {
		setLoading(true);
		
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				return { success: false, error: "Invalid email or password!" };
			}

			return { success: true };
		} catch (error) {
			console.error("Sign in error:", error);
			return { success: false, error: "An unexpected error occurred" };
		} finally {
			setLoading(false);
		}
	}, []);

	const signUpWithEmail = useCallback(async (email: string, password: string) => {
		setLoading(true);
		
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			if (!session) {
				return { success: false, error: "Error signing up!" };
			}

			return { success: true };
		} catch (error) {
			console.error("Sign up error:", error);
			return { success: false, error: "An unexpected error occurred" };
		} finally {
			setLoading(false);
		}
	}, []);

	const signInWithGoogle = useCallback(async () => {
		setLoading(true);
		
		try {
			// Configure Google Sign-In
			GoogleSignin.configure({
				webClientId: getEnvironmentConfig().GOOGLE_WEB_CLIENT_ID,
				offlineAccess: true,
			});

			// Check if device supports Google Play
			await GoogleSignin.hasPlayServices();

			// Sign in with Google
			const userInfo = await GoogleSignin.signIn();

			if (!userInfo.idToken) {
				return { success: false, error: "Failed to get Google ID token" };
			}

			// Sign in with Supabase using Google token
			const { error } = await supabase.auth.signInWithIdToken({
				provider: "google",
				token: userInfo.idToken,
			});

			if (error) {
				return { success: false, error: error.message };
			}

			return { success: true };
		} catch (error: any) {
			console.error("Google sign in error:", error);
			
			if (error.code === statusCodes.SIGN_IN_CANCELLED) {
				return { success: false, error: "Sign in was cancelled" };
			} else if (error.code === statusCodes.IN_PROGRESS) {
				return { success: false, error: "Sign in is already in progress" };
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				return { success: false, error: "Google Play Services not available" };
			} else {
				return { success: false, error: "Google sign in failed" };
			}
		} finally {
			setLoading(false);
		}
	}, []);

	return {
		loading,
		signInWithEmail,
		signUpWithEmail,
		signInWithGoogle,
	};
} 