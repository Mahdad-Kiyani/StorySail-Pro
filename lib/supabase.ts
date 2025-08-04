import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import { MMKV } from "react-native-mmkv";
import { getEnvironmentConfig } from "../utils/env";

const storage = new MMKV();

const zustandStorage = {
	setItem: (name: string, value: any) => storage.set(name, value),
	getItem: (name: string) => {
		const value = storage.getString(name);
		return value ?? null;
	},
	removeItem: (name: string) => storage.delete(name),
};

// Get environment configuration with validation
const envConfig = getEnvironmentConfig();

export const supabaseUrl = envConfig.SUPABASE_URL;
export const supabaseAnonKey = envConfig.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: zustandStorage,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});
