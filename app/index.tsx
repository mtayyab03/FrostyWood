// src/screens/LoginScreen.tsx
import React, { useState } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import Constants from "expo-constants";
type RootStackParamList = {
  index: undefined; // Define other screens here as needed
};
const LoginScreen: React.FC = (props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");
  const [password, setPasswordState] = useState("");
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  const apiUrl = Constants.expoConfig?.extra?.API_URL;

  const handleLogin = async () => {
    // const loginName = "demo-admin001"; // Replace with your login name
    // const password = "XYVJDuke"; // Replace with your password
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      const response = await fetch(
        'https://portal.wood-in-vision.com/api/v1/poi?poiUniqueId=global/mechanical_timber_storage&loginNamesQuery=&filter=$.parent.std.guid=="9a87472d-9c10-4427-b45f-4e4d33aeedf1"',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${email}:${password}`)}`,
          },
        }
      );
      if (response.status === 200) {
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Error", "Invalid credentials.");
      }
    } catch (error) {
      // Log the response to understand its structure
      Alert.alert("Error", "An error occurred during login.");
    }
  };

  // const handleLogin = async () => {
  //   // Validate input
  //   if (!email || !password) {
  //     Alert.alert("Error", "Please fill in all fields.");
  //     return;
  //   }

  //   try {
  //     // Call login function
  //     const isAuthenticated = await onLogin(email, password);

  //     if (isAuthenticated) {
  //       // Navigate to the index screen
  //       router.push("/");
  //     } else {
  //       Alert.alert("Error", "Invalid credentials.");
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "An error occurred during login.");
  //   }
  // };

  // const onLogin = async (
  //   username: string,
  //   password: string
  // ): Promise<boolean> => {
  //   const header = new Headers();
  //   header.append("Content-Type", "application/json");

  //   const raw = JSON.stringify({
  //     userName: username,
  //     password: password,
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: header,
  //     body: raw,
  //     redirect: "follow" as RequestRedirect,
  //   };

  //   let url = `${apiUrl}/api/Auth/Login`;
  //   setLoading(true);

  //   try {
  //     const response = await fetch(url, requestOptions);
  //     const resp = await response.json();

  //     setLoading(false);

  //     if (response.status !== 400 && resp.token != null) {
  //       // Assume you have setUserName, setPasswordState, setBearerToken functions available
  //       setUserName(username);
  //       setPasswordState(password);
  //       setBearerToken(resp.token);
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     setLoading(false);
  //     console.error("Login error", error);
  //     return false;
  //   }
  // };

  // const setUserName = (username: string) => {
  //   // Placeholder for setting username, replace with actual implementation
  //   console.log("Set username:", username);
  // };

  // const setBearerToken = (token: string) => {
  //   // Placeholder for setting bearer token, replace with actual implementation
  //   console.log("Set bearer token:", token);
  // };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email or Phone"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        style={styles.input}
        value={password}
        onChangeText={setPasswordState}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : (
        <Button title="LOGIN" onPress={handleLogin} color="green" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default LoginScreen;
