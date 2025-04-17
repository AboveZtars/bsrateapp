import {Slot} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useFrameworkReady} from "@/hooks/useFrameworkReady";
import {ThemeProvider} from "@/components/ThemeContext";

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
