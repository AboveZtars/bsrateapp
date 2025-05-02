import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "@/components/ThemeContext";
import {colors} from "@/components/ThemeColors";
import {useSafeAreaInsets} from "react-native-safe-area-context";

export default function TabLayout() {
  const {theme} = useTheme();
  const themeColors = colors[theme];
  const insets = useSafeAreaInsets();

  // Define base values for the tab bar
  const baseTabBarHeight = 60;
  const basePaddingBottom = 8;
  const basePaddingTop = 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          borderTopWidth: 0,
          // Adjust height and padding to account for the system navigation bar
          height: baseTabBarHeight + insets.bottom,
          paddingBottom: basePaddingBottom + insets.bottom,
          paddingTop: basePaddingTop,
        },
        tabBarActiveTintColor: themeColors.text,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          fontFamily: "Inter-Medium",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasas",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="calculator-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "Acerca",
          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="information-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
