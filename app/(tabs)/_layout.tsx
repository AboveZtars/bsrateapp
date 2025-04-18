import {Tabs} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {useTheme} from "@/components/ThemeContext";
import {colors} from "@/components/ThemeColors";

export default function TabLayout() {
  const {theme} = useTheme();
  const themeColors = colors[theme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.surface,
          borderTopColor: themeColors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: themeColors.primary,
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
