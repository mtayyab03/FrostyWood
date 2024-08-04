import React from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  ViewStyle,
} from "react-native";
interface ScreenProps {
  children: any;
  statusBarColor?: string;
  style?: ViewStyle;
}
const Screen: React.FC<ScreenProps> = ({
  children,
  statusBarColor = "#ffffff",
  style,
}) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      {Platform.OS === "android" ? (
        <StatusBar backgroundColor={statusBarColor} barStyle="dark-content" />
      ) : null}
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});

export default Screen;
