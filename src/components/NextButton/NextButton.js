import React, { useEffect, useRef } from "react";

import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Circle, Svg } from "react-native-svg";

export default NextButton = ({ percentage, scrollTo }) => {
  const size = 80;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;

  const progressAnimation = useRef(new Animated.Value(0)).current;
  const progressRef = useRef(null);

  const animation = (toValue) => {
    return Animated.timing(progressAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    animation(percentage);
  }, [percentage]);

  useEffect(() => {
    progressAnimation.addListener(
      (value) => {
        const strokeDashoffset =
          circumference - (circumference * value.value) / 100;
        if (progressRef?.current) {
          progressRef.current.setNativeProps({
            strokeDashoffset,
          });
        }
      },
      [percentage]
    );

    return () => {
      progressAnimation.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.contianer}>
      <Svg width={size} height={size}>
        <Circle
          stroke={"#0077b6"}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
        />

        <Circle
          ref={progressRef}
          stroke={"#0077b6"}
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
        />
      </Svg>
      <TouchableOpacity
        onPress={scrollTo}
        style={styles.button}
        activeOpacity={0.6}
      >
        <AntDesign name="arrowright" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  contianer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    position: "absolute",
    backgroundColor: "#45B5E4",
    borderRadius: 100,
    padding: 19,
  },
});
