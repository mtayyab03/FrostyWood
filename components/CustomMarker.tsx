import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Marker, Callout } from "react-native-maps";
import { RFPercentage } from "react-native-responsive-fontsize";

const CustomMarker = ({ coordinate, text }: any) => (
  <Marker coordinate={coordinate}>
    <View style={styles.marker}>
      <View style={styles.circle}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
    <Callout>
      <Text>{text}</Text>
    </Callout>
  </Marker>
);

const styles = StyleSheet.create({
  marker: {
    alignItems: "center",
  },
  circle: {
    width: 20,
    height: 20,
    backgroundColor: "brown",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: RFPercentage(1),
    fontWeight: "600",
  },
});

export default CustomMarker;
