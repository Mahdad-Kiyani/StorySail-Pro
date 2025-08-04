/**
 * Environment variable validation and configuration
 */

interface EnvironmentConfig {
	SUPABASE_URL: string;
	SUPABASE_ANON_KEY: string;
	GOOGLE_WEB_CLIENT_ID: string;
}

const requiredEnvVars: (keyof EnvironmentConfig)[] = [
	'SUPABASE_URL',
	'SUPABASE_ANON_KEY',
	'GOOGLE_WEB_CLIENT_ID',
];

/**
 * Validates that all required environment variables are present
 */
export function validateEnvironment(): EnvironmentConfig {
	const missingVars: string[] = [];

	for (const envVar of requiredEnvVars) {
		if (!process.env[envVar]) {
			missingVars.push(envVar);
		}
	}

	if (missingVars.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missingVars.join(', ')}`
		);
	}

	return {
		SUPABASE_URL: process.env.SUPABASE_URL!,
		SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
		GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID!,
	};
}

/**
 * Gets environment configuration with validation
 */
export function getEnvironmentConfig(): EnvironmentConfig {
	try {
		return validateEnvironment();
	} catch (error) {
		console.error('Environment validation failed:', error);
		throw error;
	}
}

/**
 * Checks if the app is running in development mode
 */
export function isDevelopment(): boolean {
	return __DEV__;
}

/**
 * Checks if the app is running in production mode
 */
export function isProduction(): boolean {
	return !__DEV__;
} 