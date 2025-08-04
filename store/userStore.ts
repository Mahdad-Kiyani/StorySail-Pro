import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { User, PostgrestError } from "@supabase/supabase-js";
import zustandStorage from "./zustandStore";
import { supabase } from "../lib/supabase";

export interface UserDetails {
	username: string;
	website: string;
	avatar_url: string;
	full_name: string;
	coins: number;
	lastRewardDate: Date;
}

export interface UserStore {
	isFirstLogin: boolean;
	setIsFirstLogin: (state: boolean) => void;
	user: User | null;
	setUser: (state: User | null) => void;
	userDetails: UserDetails;
	setUserDetails: (state: UserDetails) => void;
	showNotification: boolean;
	setShowNotification: (state: boolean) => void;
	getCoins: () => number;
	deductCoins: (amount: number) => Promise<{ success: boolean; error?: string }>;
	getLastRewardDate: () => Date;
	setLastRewardDate: (date: Date) => Promise<{ success: boolean; error?: string }>;
	addCoins: (amount: number) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_USER_DETAILS: UserDetails = {
	coins: 0,
	username: "username",
	website: "",
	avatar_url: "https://www.gravatar.com/avatar/?d=identicon",
	full_name: "Your name here!",
	lastRewardDate: new Date("2021-01-01T00:00:00Z"),
};

const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			isFirstLogin: true,
			setIsFirstLogin: (state: boolean) => {
				set({ isFirstLogin: state });
			},
			user: null,
			setUser: (state: User | null) => {
				set({ user: state });
			},
			userDetails: DEFAULT_USER_DETAILS,
			setUserDetails: (state: UserDetails) => {
				set({ userDetails: state });
			},
			showNotification: false,
			setShowNotification: (state: boolean) => {
				set({ showNotification: state });
			},
			getCoins: () => get().userDetails.coins,
			deductCoins: async (amount: number) => {
				const currentUser = get().user;
				const currentCoins = get().userDetails.coins;

				if (!currentUser?.id) {
					return { success: false, error: "User not authenticated" };
				}

				if (currentCoins < amount) {
					return { success: false, error: "Insufficient coins" };
				}

				const newCoins = currentCoins - amount;
				const updates = {
					id: currentUser.id,
					coins: newCoins,
				};

				// Optimistic update
				set({
					userDetails: {
						...get().userDetails,
						coins: newCoins,
					},
				});

				try {
					const { error } = await supabase
						.from("profiles")
						.upsert(updates);

					if (error) {
						// Revert optimistic update on error
						set({
							userDetails: {
								...get().userDetails,
								coins: currentCoins,
							},
						});
						return { success: false, error: error.message };
					}

					return { success: true };
				} catch (error) {
					// Revert optimistic update on exception
					set({
						userDetails: {
							...get().userDetails,
							coins: currentCoins,
						},
					});
					return { success: false, error: "Network error" };
				}
			},
			addCoins: async (amount: number) => {
				const currentUser = get().user;
				const currentCoins = get().userDetails.coins;

				if (!currentUser?.id) {
					return { success: false, error: "User not authenticated" };
				}

				if (amount <= 0) {
					return { success: false, error: "Invalid amount" };
				}

				const newCoins = currentCoins + amount;
				const updates = {
					id: currentUser.id,
					coins: newCoins,
				};

				// Optimistic update
				set({
					userDetails: {
						...get().userDetails,
						coins: newCoins,
					},
				});

				try {
					const { error } = await supabase
						.from("profiles")
						.upsert(updates);

					if (error) {
						// Revert optimistic update on error
						set({
							userDetails: {
								...get().userDetails,
								coins: currentCoins,
							},
						});
						return { success: false, error: error.message };
					}

					return { success: true };
				} catch (error) {
					// Revert optimistic update on exception
					set({
						userDetails: {
							...get().userDetails,
							coins: currentCoins,
						},
					});
					return { success: false, error: "Network error" };
				}
			},
			getLastRewardDate: () => get().userDetails.lastRewardDate,
			setLastRewardDate: async (date: Date) => {
				const currentUser = get().user;

				if (!currentUser?.id) {
					return { success: false, error: "User not authenticated" };
				}

				const updates = {
					id: currentUser.id,
					lastRewardDate: date,
				};

				// Optimistic update
				set({
					userDetails: {
						...get().userDetails,
						lastRewardDate: date,
					},
				});

				try {
					const { error } = await supabase
						.from("profiles")
						.upsert(updates);

					if (error) {
						// Revert optimistic update on error
						set({
							userDetails: {
								...get().userDetails,
								lastRewardDate: DEFAULT_USER_DETAILS.lastRewardDate,
							},
						});
						return { success: false, error: error.message };
					}

					return { success: true };
				} catch (error) {
					// Revert optimistic update on exception
					set({
						userDetails: {
							...get().userDetails,
							lastRewardDate: DEFAULT_USER_DETAILS.lastRewardDate,
						},
					});
					return { success: false, error: "Network error" };
				}
			},
		}),
		{
			name: "user-storage",
			storage: createJSONStorage(() => zustandStorage),
		}
	)
);

export default useUserStore;
