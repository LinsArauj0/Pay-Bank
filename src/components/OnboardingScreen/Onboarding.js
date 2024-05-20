import React, { useState, useRef } from "react";
import { View, StyleSheet, FlatList, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

import OnboardingItem from "./OnboardingItem.js";
import Paginator from "./Paginator.js";
import NextButton from "../NextButton/NextButton.js";
import slides from "../../Service/Slide.js";

const Onboarding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const navigation = useNavigation();

  const viewableItemsChanged = ({ viewableItems }) => {
    setCurrentIndex(viewableItems[0].index);
  };

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      console.log("Last item.");
      // Redireciona para a tela HomeScreen
      navigation.navigate("AccountVerification");
    }
  };

  const handleNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      console.log("Last item.");
      // Redireciona para a tela HomeScreen
      navigation.navigate("AccountVerification");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.flatListContainer}>
        <FlatList
          data={slides}
          renderItem={({ item }) => <OnboardingItem item={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
            }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          ref={slidesRef}
        />
      </View>
      <Paginator data={slides} scrollX={scrollX} />
      <NextButton
        percentage={(currentIndex + 1) * (100 / slides.length)}
        title={currentIndex === slides.length - 1 ? "Começar" : "Próximo"}
        scrollTo={scrollTo}
        onPress={handleNextSlide}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  flatListContainer: {
    flex: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 7,
  },
});

export default Onboarding;
