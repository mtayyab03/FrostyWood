import "react-native-gesture-handler";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import index from "./app/index";
import login from "./app/login";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={index}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="login"
          component={login}
          //   options={{ title: "Login" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
