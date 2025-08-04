import { StyleSheet, Text, Platform } from "react-native";
import React, {
	useState,
	useCallback,
	useImperativeHandle,
	forwardRef,
	RefObject,
	memo,
} from "react";
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSequence,
	withDelay,
	withTiming,
	withSpring,
	runOnJS,
} from "react-native-reanimated";
import { AntDesign } from "@expo/vector-icons";
import { PanGestureHandler } from "react-native-gesture-handler";
import { WINDOW_WIDTH } from "@gorhom/bottom-sheet";

export interface ToastRef {
	show: (config: {
		type: "success" | "warning" | "error";
		text: string;
		duration: number;
	}) => void;
}

export interface ToastConfig {
	type: "success" | "warning" | "error";
	text: string;
	duration: number;
}

// Toast style configurations extracted to a separate object
const TOAST_STYLE_CONFIGS = {
	success: {
		containerStyle: styles.successToastContainer,
		textStyle: styles.successToastText,
		iconColor: "#1f8722",
		iconName: "checkcircleo" as const,
	},
	warning: {
		containerStyle: styles.warningToastContainer,
		textStyle: styles.warningToastText,
		iconColor: "#f08135",
		iconName: "exclamationcircleo" as const,
	},
	error: {
		containerStyle: styles.errorToastContainer,
		textStyle: styles.errorToastText,
		iconColor: "#d9100a",
		iconName: "closecircleo" as const,
	},
} as const;

const TOP_VALUE = Platform.OS === "ios" ? 60 : 30;
const DISMISS_THRESHOLD = 100;
const DISMISS_ANIMATION_DURATION = 500;

const Toast = memo(forwardRef<ToastRef, {}>((_props, ref) => {
	const toastTopAnimation = useSharedValue(-100);
	const toastSideAnimation = useSharedValue(0);
	const [showing, setShowing] = useState(false);
	const [toastType, setToastType] = useState<ToastConfig["type"]>("success");
	const [toastText, setToastText] = useState("");

	const show = useCallback(
		({ type, text, duration }: ToastConfig) => {
			setShowing(true);
			setToastType(type);
			setToastText(text);
			
			toastTopAnimation.value = withSequence(
				withTiming(TOP_VALUE),
				withDelay(
					duration,
					withTiming(-100, undefined, (finish) => {
						if (finish) {
							runOnJS(setShowing)(false);
						}
					})
				)
			);
		},
		[toastTopAnimation]
	);

	useImperativeHandle(
		ref as RefObject<ToastRef> | null,
		() => ({
			show,
		}),
		[show]
	);

	const animatedTopStyles = useAnimatedStyle(() => ({
		top: toastTopAnimation.value,
		left: toastSideAnimation.value,
		right: toastSideAnimation.value,
	}));

	const dismissToast = useCallback(() => {
		toastSideAnimation.value = withSpring(0);
		setShowing(false);
	}, [toastSideAnimation]);

	const handleGesture = useCallback(
		(event: {
			nativeEvent: { translationX: number; translationY: number };
		}) => {
			const { translationX, translationY } = event.nativeEvent;
			
			if (Math.abs(translationX) > DISMISS_THRESHOLD || Math.abs(translationY) > DISMISS_THRESHOLD) {
				const direction = Math.abs(translationX) > DISMISS_THRESHOLD ? translationX : translationY;
				toastSideAnimation.value = withSpring(
					direction > 0 ? 500 : -500,
					{ velocity: 50 }
				);

				setTimeout(() => {
					runOnJS(dismissToast)();
				}, DISMISS_ANIMATION_DURATION);
			}
		},
		[dismissToast, toastSideAnimation]
	);

	if (!showing) return null;

	// Get toast style configuration based on toast type
	const styleConfig = TOAST_STYLE_CONFIGS[toastType];

	return (
		<PanGestureHandler onGestureEvent={handleGesture}>
			<Animated.View
				style={[
					styles.toastContainer,
					styleConfig.containerStyle,
					animatedTopStyles,
				]}
			>
				<AntDesign 
					name={styleConfig.iconName} 
					size={24} 
					color={styleConfig.iconColor} 
				/>
				<Text style={[styles.toastText, styleConfig.textStyle]}>
					{toastText}
				</Text>
			</Animated.View>
		</PanGestureHandler>
	);
}));

Toast.displayName = "Toast";

export default Toast;

const styles = StyleSheet.create({
	toastContainer: {
		position: "absolute",
		top: 0,
		width: "100%",
		padding: 10,
		borderRadius: 18,
		minWidth: WINDOW_WIDTH * 0.89,
		borderWidth: 1,
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "center",
	},
	toastText: {
		marginLeft: 14,
		fontSize: 16,
	},
	successToastContainer: {
		backgroundColor: "#def1d7",
		borderColor: "#1f8722",
	},
	warningToastContainer: {
		backgroundColor: "#fef7ec",
		borderColor: "#f08135",
	},
	errorToastContainer: {
		backgroundColor: "#fae1db",
		borderColor: "#d9100a",
	},
	successToastText: {
		color: "#1f8722",
	},
	warningToastText: {
		color: "#f08135",
	},
	errorToastText: {
		color: "#d9100a",
	},
});