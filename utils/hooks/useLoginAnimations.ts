import { useCallback } from "react";
import { Dimensions } from "react-native";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	interpolate,
	withTiming,
	withDelay,
	withSequence,
	withSpring,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");

interface LoginAnimations {
	imagePosition: Animated.SharedValue<number>;
	formButtonScale: Animated.SharedValue<number>;
	imageAnimatedStyle: Animated.AnimatedStyle;
	buttonsAnimatedStyle: Animated.AnimatedStyle;
	closeButtonContainerStyle: Animated.AnimatedStyle;
	formAnimatedStyle: Animated.AnimatedStyle;
	formButtonAnimatedStyle: Animated.AnimatedStyle;
	loginHandler: () => void;
	registerHandler: () => void;
	buttonHandler: () => void;
}

export function useLoginAnimations(
	isRegistering: boolean,
	setIsRegistering: (value: boolean) => void,
	onButtonPress: () => void
): LoginAnimations {
	const imagePosition = useSharedValue(1);
	const formButtonScale = useSharedValue(1);

	const imageAnimatedStyle = useAnimatedStyle(() => {
		const interpolation = interpolate(
			imagePosition.value,
			[0, 1],
			[-height / 2, 0]
		);
		return {
			transform: [
				{ translateY: withTiming(interpolation, { duration: 1000 }) },
			],
		};
	});

	const buttonsAnimatedStyle = useAnimatedStyle(() => {
		const interpolation = interpolate(
			imagePosition.value,
			[0, 1],
			[250, 0]
		);
		return {
			opacity: withTiming(imagePosition.value, { duration: 500 }),
			transform: [
				{ translateY: withTiming(interpolation, { duration: 1000 }) },
			],
		};
	});

	const closeButtonContainerStyle = useAnimatedStyle(() => {
		const interpolation = interpolate(
			imagePosition.value,
			[0, 1],
			[180, 360]
		);
		return {
			opacity: withTiming(imagePosition.value === 1 ? 0 : 1, {
				duration: 800,
			}),
			transform: [
				{
					rotate: withTiming(`${interpolation}deg`, {
						duration: 1000,
					}),
				},
			],
		};
	});

	const formAnimatedStyle = useAnimatedStyle(() => ({
		opacity:
			imagePosition.value === 0
				? withDelay(400, withTiming(1, { duration: 800 }))
				: withTiming(0, { duration: 300 }),
	}));

	const formButtonAnimatedStyle = useAnimatedStyle(() => ({
		transform: [{ scale: formButtonScale.value }],
	}));

	const loginHandler = useCallback(() => {
		imagePosition.value = 0;
		if (isRegistering) {
			setIsRegistering(false);
		}
	}, [imagePosition, isRegistering, setIsRegistering]);

	const registerHandler = useCallback(() => {
		imagePosition.value = 0;
		if (!isRegistering) {
			setIsRegistering(true);
		}
	}, [imagePosition, isRegistering, setIsRegistering]);

	const buttonHandler = useCallback(() => {
		formButtonScale.value = withSequence(withSpring(0.8), withSpring(1));
		onButtonPress();
	}, [formButtonScale, onButtonPress]);

	return {
		imagePosition,
		formButtonScale,
		imageAnimatedStyle,
		buttonsAnimatedStyle,
		closeButtonContainerStyle,
		formAnimatedStyle,
		formButtonAnimatedStyle,
		loginHandler,
		registerHandler,
		buttonHandler,
	};
} 