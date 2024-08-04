// components/Header.tsx
import React from "react";
import { View, StyleSheet, Button, Image } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  login: undefined; // Define other screens here as needed
};
const Header: React.FC = (props) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={styles.header}>
      <Image
        source={require("../assets/images/Logo.png")}
        style={styles.logo}
      />
      <Button
        title="Login"
        onPress={() => navigation.navigate("login")}
        color="green"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: "#333",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  logo: {
    width: 100,
    height: 30,
    resizeMode: "contain",
  },
});

export default Header;
