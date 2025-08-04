import React, {
	useState,
	useEffect,
	createContext,
	PropsWithChildren,
	useRef,
	useMemo,
	useCallback,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useUserStore, useWritingsStore, useHomeStore } from "../store";
import { supabase } from "../lib/supabase";

type AuthProps = {
	user: User | null;
	session: Session | null;
	signOut: () => Promise<void>;
	bottomSheetRef: React.RefObject<BottomSheetModal>;
	handlePresentModalPress: () => void;
	handleNotificationPermission: () => Promise<void>;
};

export const AuthContext = createContext<Partial<AuthProps>>({});

// Custom hook to read the context values
export function useAuth() {
	return React.useContext(AuthContext);
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	
	const {
		setUserDetails,
		setShowNotification,
		isFirstLogin,
		user,
		setUser,
		setIsFirstLogin,
		setLastRewardDate,
	} = useUserStore();
	
	const { getArticlesByUser } = useWritingsStore();
	const { setData, setLastFetch, refetchFlag } = useHomeStore();

	const router = useRouter();
	const bottomSheetRef = useRef<BottomSheetModal>(null);

	const handlePresentModalPress = useCallback(() => {
		bottomSheetRef.current?.present();
	}, []);

	const getProfile = useCallback(async (userId: string) => {
		if (!userId) return;

		try {
			await getArticlesByUser();
			
			const { data, error, status } = await supabase
				.from("profiles")
				.select("username, website, avatar_url, full_name, coins, lastRewardDate")
				.eq("id", userId)
				.single();

			if (error && status !== 406) {
				console.error("Error fetching profile:", error);
				setSession(null);
				return;
			}

			if (data) {
				setUserDetails(data);
			}
		} catch (error) {
			console.error("Error getting profile:", error);
		}
	}, [getArticlesByUser, setUserDetails]);

	const fetchHomeData = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from("app_home")
				.select("*")
				.eq("active", 1)
				.single();

			if (error) {
				console.error("Error fetching home data:", error);
				return;
			}

			if (data) {
				setData(data);
				setLastFetch(new Date());
			}
		} catch (error) {
			console.error("Error fetching home data:", error);
		}
	}, [setData, setLastFetch]);

	const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
		setSession(session);
		setIsLoading(true);

		try {
			if (session && session.user) {
				await fetchHomeData();
				
				if (session.user.id !== user?.id) {
					setUser(session.user);
					await getProfile(session.user.id);
				}

				if (isFirstLogin) {
					router.replace("/onboarding");
				} else {
					router.replace("/(tabs)/home");
				}
			} else {
				setUser(null);
				router.replace("/login");
			}
		} catch (error) {
			console.error("Error handling auth state change:", error);
		} finally {
			setIsLoading(false);
		}
	}, [fetchHomeData, user?.id, setUser, getProfile, isFirstLogin, router]);

	useEffect(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
		
		return () => {
			subscription.unsubscribe();
		};
	}, [handleAuthStateChange, refetchFlag]);

	// Log out the user
	const signOut = useCallback(async () => {
		if (!session) return;

		try {
			await supabase.auth.signOut();
			await GoogleSignin.signOut();
			
			setSession(null);
			setIsFirstLogin(false);
			setData(null);
			setUser(null);
			setUserDetails({
				coins: 0,
				username: "username",
				website: "",
				avatar_url: "https://www.gravatar.com/avatar/?d=identicon",
				full_name: "Your name here!",
				lastRewardDate: new Date("2021-01-01T00:00:00Z"),
			});
			setLastRewardDate(new Date("2021-01-01T00:00:00Z"));
		} catch (error) {
			console.error("Error signing out:", error);
		}
	}, [session, setIsFirstLogin, setData, setUser, setUserDetails, setLastRewardDate]);

	const handleNotificationPermission = useCallback(async () => {
		if (!session?.user?.id) {
			console.warn("No user session for notification permission");
			return;
		}

		try {
			let { status } = await Notifications.getPermissionsAsync();
			
			if (status !== "granted") {
				({ status } = await Notifications.requestPermissionsAsync());
			}

			if (status === "granted") {
				const token = await Notifications.getExpoPushTokenAsync({
					projectId: Constants?.expoConfig?.extra?.eas.projectId,
				});

				if (token?.data) {
					const { error } = await supabase.from("profiles").upsert({
						id: session.user.id,
						expo_push_token: token,
					});
					
					if (error) {
						console.error("Error updating push token:", error);
					}
				}
			} else {
				setShowNotification(false);
				const { error } = await supabase.from("profiles").upsert({
					id: session.user.id,
					expo_push_token: null,
				});
				
				if (error) {
					console.error("Error removing push token:", error);
				}
			}
		} catch (error) {
			console.error("Error handling notification permission:", error);
		}
	}, [session?.user?.id, setShowNotification]);

	const value = useMemo(
		() => ({
			user,
			session,
			signOut,
			bottomSheetRef,
			handlePresentModalPress,
			handleNotificationPermission,
		}),
		[user, session, signOut, handlePresentModalPress, handleNotificationPermission]
	);

	if (isLoading) {
		// You might want to show a loading screen here
		return null;
	}

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
