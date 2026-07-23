import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text className={`text-xl ${focused ? "text-primary" : "text-muted"}`}>
      {symbol}
    </Text>
  );
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#091426",
        tabBarInactiveTintColor: "#75777d",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#c5c6cd",
          height: 68,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon symbol="⌂" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "Projects",
          tabBarIcon: ({ focused }) => <TabIcon symbol="▣" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
