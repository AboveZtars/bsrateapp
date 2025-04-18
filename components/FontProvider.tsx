import React, {createContext, useContext, useEffect, useState} from "react";
import {Text, TextInput, View} from "react-native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a context to track font loading state
const FontLoadingContext = createContext({fontsLoaded: false});

// Custom hook to access font loading state
export const useFonts = () => useContext(FontLoadingContext);

// Define our font assets
const fontAssets = {
  "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
  "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
  "Inter-SemiBold": require("../assets/fonts/Inter-SemiBold.ttf"),
  "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
};

// Custom text components with our fonts
export const AppText = (props: React.ComponentProps<typeof Text>) => {
  const {style, ...otherProps} = props;
  return (
    <Text style={[{fontFamily: "Inter-Regular"}, style]} {...otherProps} />
  );
};

export const AppTextInput = (props: React.ComponentProps<typeof TextInput>) => {
  const {style, ...otherProps} = props;
  return (
    <TextInput style={[{fontFamily: "Inter-Regular"}, style]} {...otherProps} />
  );
};

export const AppTextBold = (props: React.ComponentProps<typeof Text>) => {
  const {style, ...otherProps} = props;
  return <Text style={[{fontFamily: "Inter-Bold"}, style]} {...otherProps} />;
};

export const AppTextSemiBold = (props: React.ComponentProps<typeof Text>) => {
  const {style, ...otherProps} = props;
  return (
    <Text style={[{fontFamily: "Inter-SemiBold"}, style]} {...otherProps} />
  );
};

export const AppTextMedium = (props: React.ComponentProps<typeof Text>) => {
  const {style, ...otherProps} = props;
  return <Text style={[{fontFamily: "Inter-Medium"}, style]} {...otherProps} />;
};

// Provider component to load fonts and render the app when ready
export const FontProvider = ({children}: {children: React.ReactNode}) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync(fontAssets);
        setFontsLoaded(true);
      } catch (e) {
        console.warn("Failed to load fonts:", e);
        // If fonts fail to load, we'll continue with system fonts
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <FontLoadingContext.Provider value={{fontsLoaded}}>
      {children}
    </FontLoadingContext.Provider>
  );
};

export default FontProvider;
