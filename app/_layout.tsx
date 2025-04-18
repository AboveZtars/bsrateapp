import {Slot} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useFrameworkReady} from "@/hooks/useFrameworkReady";
import {ThemeProvider} from "@/components/ThemeContext";
import FontProvider from "@/components/FontProvider";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <FontProvider>
        <Slot />
        <StatusBar style="auto" />
      </FontProvider>
    </ThemeProvider>
  );
}
