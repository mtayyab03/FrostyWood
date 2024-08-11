// components/LagerbereichModal.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
// app/index.tsx
import MapView, {
  Polyline,
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import { RFPercentage } from "react-native-responsive-fontsize";

import Constants from "expo-constants";
import axios from "axios";
import * as Location from "expo-location";

interface LagerbereichModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}
type Coordinate = {
  latitude: number;
  longitude: number;
};
type MarkerCoordinate = {
  latitude: number;
  longitude: number;
};
const LagerbereichModal: React.FC<LagerbereichModalProps> = ({
  isVisible,
  onClose,
  onSave,
}) => {
  const [lagerplatzname, setLagerplatzname] = useState("");
  const [mengeFm, setMengeFm] = useState("");
  const [mengeStuck, setMengeStuck] = useState("");
  const [bemerkung, setBemerkung] = useState("");
  const [status, setStatus] = useState("");
  const [storagePiles, setStoragePiles] = useState<string[]>([]);
  const [dropdown1, setDropdown1] = useState(false);
  const [selectedMapType, setSelectedMapType] = useState("satellite");
  const [currentLocationMarker, setCurrentLocationMarker] =
    useState<Coordinate | null>(null);
  const [lineCoordinates, setLineCoordinates] = useState<Coordinate[]>([]);
  const [markerCoordinate, setMarkerCoordinate] = useState<Coordinate | null>(
    null
  );
  const apiUrl = Constants.expoConfig?.extra?.API_URL_1;
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 47.71374304071032,
    longitude: 9.251982745002323,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    setMapRegion({
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    });

    setCurrentLocationMarker({ latitude, longitude });

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }
  };
  const transferLanguage = [
    {
      id: 1,
      name: "standard",
    },
    {
      id: 2,
      name: "satellite",
    },
  ];
  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...mapRegion,
          latitudeDelta: mapRegion.latitudeDelta / 2,
          longitudeDelta: mapRegion.longitudeDelta / 2,
        },
        1000
      );
      setMapRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta / 2,
        longitudeDelta: prevRegion.longitudeDelta / 2,
      }));
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...mapRegion,
          latitudeDelta: mapRegion.latitudeDelta * 2,
          longitudeDelta: mapRegion.longitudeDelta * 2,
        },
        1000
      );
      setMapRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: prevRegion.latitudeDelta * 2,
        longitudeDelta: prevRegion.longitudeDelta * 2,
      }));
    }
  };

  // const handleMapPress = (e: { nativeEvent: { coordinate: any } }) => {
  //   const { coordinate } = e.nativeEvent;
  //   console.log("Map pressed at:", coordinate);
  // };

  useEffect(() => {
    fetchStoragePiles();
  }, []);

  const fetchStoragePiles = async () => {
    const loginName = "demo-admin001"; // Replace with your login name
    const password = "XYVJDuke"; // Replace with your password

    try {
      const response = await fetch(
        'https://portal.wood-in-vision.com/api/v1/poi?poiUniqueId=global/mechanical_timber_storage_pile&filter=$.parent.std.guid=="69b32b46-d7a6-449b-8ff1-285c860cea71"',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
          },
        }
      );
      const result = await response.json();
      console.log("Fetched Storage Piles data:", result); // Log the response to understand its structure

      if (Array.isArray(result)) {
        const storePile: any = result.map((item: any) => ({
          log_species: item.poi?.log_species,
          log_type: item.poi?.log_type,
          total_log_count: item.poi?.total_log_count,
          total_log_volume: item.poi?.total_log_volume,
        }));

        setStoragePiles(storePile);
        console.log("Storage Pile data", storePile);
      } else {
        console.error("Storage Pile data is not an array:", result);
      }
    } catch (error) {
      console.error("Error fetching Storage Pile options:", error);
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: Coordinate } }) => {
    const { coordinate } = e.nativeEvent;
    console.log("Map pressed at:", coordinate);
    setMarkerCoordinate(coordinate);
  };

  const handleMarkerDragEnd = (e: {
    nativeEvent: { coordinate: Coordinate };
  }) => {
    const { coordinate } = e.nativeEvent;
    console.log("Marker moved to:", coordinate);
    setMarkerCoordinate(coordinate);
  };

  const handleStorageSave = async () => {
    // Constructing the post data in the required format
    const postData = {
      std: {
        poiUniqueId: "global/mechanical_timber_harvest",
      },
      poi: {
        _address: {
          // Address details can be static or derived based on your requirements
          accuracy: 0.0,
          city: "Zell am Pettenfirst",
          country: "Österreich",
          countryCode: "de",
          houseNumber: "4",
          httpCode: 200,
          lat: markerCoordinate.latitude, // Using the provided marker coordinates
          latSnapin: markerCoordinate.latitude, // Using the same coordinates for latSnapin
          layerKey: "overlay_nominatim",
          lon: markerCoordinate.longitude, // Using the provided marker coordinates
          lonSnapin: markerCoordinate.longitude, // Using the same coordinates for lonSnapin
          objectType: "GeocodingAddrInfo",
          postalCode: "4842",
          state: "Oberösterreich",
          village: "Schierling",
        },
        name: lagerplatzname, // Mapping name to lagerplatzname
        total_log_count: mengeFm, // Mapping total_log_count to mengeFm
        total_log_volume: mengeStuck, // Mapping total_log_volume to mengeStuck
      },
    };
    console.log("name save", lagerplatzname);
    console.log("volume save", mengeFm);
    console.log("count save", mengeStuck);
    console.log("coordinaetes save", markerCoordinate);

    try {
      const loginName = "demo-admin001"; // Replace with your login name
      const password = "XYVJDuke"; // Replace with your password
      const response = await fetch(`${apiUrl}/api/v1/poi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
        },
        body: JSON.stringify(postData),
      });

      // Parse the response body only once
      const responseData = await response.json();

      if (response.ok) {
        onSave(postData);
        onClose();
        Alert.alert("Success", "Feature saved successfully.");
      } else {
        const errorMessage =
          responseData.message ||
          response.statusText ||
          "Unknown error occurred";
        Alert.alert("Error", `Failed to save feature: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Error saving feature:", error);
      Alert.alert("Error", "An error occurred while saving the feature.");
    }
  };

  return (
    <Modal
      style={{ width: "100%", backgroundColor: "#000000" }}
      isVisible={isVisible}
      onBackdropPress={onClose}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalContentinner}>
          <View style={{ width: "50%" }}>
            <Text style={styles.modalTitle}>Lagerbereich</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lagerplatzname</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Lagerplatzname"
                value={lagerplatzname}
                onChangeText={setLagerplatzname}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Menge [fm]</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Menge [fm]"
                value={mengeFm}
                onChangeText={setMengeFm}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Menge [Stück]</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Menge [Stück]"
                value={mengeStuck}
                onChangeText={setMengeStuck}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bemerkung</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Bemerkung"
                value={bemerkung}
                onChangeText={setBemerkung}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Status"
                value={status}
                onChangeText={setStatus}
              />
            </View>
            <View style={styles.headerRow}>
              <Text style={styles.columnHeader}>Baumart</Text>
              <Text style={styles.columnHeader}>Sortiment</Text>
              <Text style={styles.columnHeader}>Anzahl</Text>
              <Text style={styles.columnHeader}>FM</Text>
            </View>

            {/* map api storages piles */}
            {/* {storagePiles.map((pile: any, index: any) => (
              <View key={index} style={styles.headerRowapi}>
                <Text style={styles.columnHeaderapi}>{pile.log_species}</Text>
                <Text style={styles.columnHeaderapi}>{pile.log_type}</Text>
                <Text style={styles.columnHeaderapi}>
                  {pile.total_log_count}
                </Text>
                <Text style={styles.columnHeaderapi}>
                  {pile.total_log_volume}
                </Text>
              </View>
            ))} */}
          </View>

          {/* map area */}
          <View style={styles.mainContent}>
            <MapView
              provider={PROVIDER_GOOGLE}
              mapType={selectedMapType}
              ref={mapRef}
              style={styles.map}
              onPress={handleMapPress}
              region={mapRegion}
            >
              {markerCoordinate && (
                <Marker
                  coordinate={markerCoordinate}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                  title="Selected Location"
                  image={require("../assets/images/icons.png")} // Update the path to your image
                  style={{ width: 40, height: 40 }} // Adjust size as needed
                />
              )}
              {lineCoordinates.map((coordinate, index) => (
                <Marker key={index} coordinate={coordinate} />
              ))}

              {currentLocationMarker && (
                <Marker
                  coordinate={currentLocationMarker}
                  title="Your Location"
                />
              )}
            </MapView>
            <View style={styles.buttonContainer}>
              <View>
                <TouchableOpacity
                  style={{
                    backgroundColor: "green",
                    padding: 3,
                    paddingVertical: 10,
                    borderRadius: 5,
                    marginBottom: dropdown1 ? 2 : 10,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                  }}
                >
                  <Icon name="map" size={24} color="#fff" />
                  {dropdown1 ? (
                    <TouchableOpacity onPress={() => setDropdown1(false)}>
                      <Entypo name="chevron-up" color="#fff" size={18} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setDropdown1(true)}>
                      <Entypo name="chevron-down" color="#fff" size={18} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                {dropdown1 && (
                  <View style={styles.dropdown}>
                    {transferLanguage.map((item: any) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedMapType(item.name);
                          setDropdown1(false);
                        }}
                      >
                        <Text style={styles.dropdownText}>{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.mbutton} onPress={zoomIn}>
                <Icon name="zoom-in" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mbutton} onPress={zoomOut}>
                <Icon name="zoom-out" size={24} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mbutton}
                onPress={getCurrentLocation}
              >
                <Icon name="location-on" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>SCHLIESSEN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleStorageSave}>
            <Text style={styles.buttonText}>SPEICHERN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 5,
  },
  headerRowapi: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  columnHeader: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 8,
  },
  columnHeaderapi: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 10,
    color: "gray",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  activeRow: {
    backgroundColor: "#e0ffe0",
  },

  modalContent: {
    backgroundColor: "white",
    width: "92%",
    padding: 10,
    borderRadius: 10,
    // width: Dimensions.get("window").width * 0.8,
    // alignSelf: "center",
    // flexDirection: "row",
  },
  modalContentinner: {
    width: "100%",
    // padding: 10,
    // borderRadius: 10,
    flexDirection: "row",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputGroup: {
    width: "90%",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: RFPercentage(1),
  },
  mbutton: {
    alignItems: "center",
    backgroundColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 3,
    borderRadius: 5,
    marginBottom: RFPercentage(1),
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  container: {
    flex: 1,
  },
  mainContent: {
    width: "50%",
    flexDirection: "row",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
  },

  buttonActive: {
    backgroundColor: "red",
  },
  distanceContainer: {
    position: "absolute",
    bottom: 60,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dropdown: {
    position: "relative",
    zIndex: 1,
    backgroundColor: "green",
    width: "100%",
    padding: RFPercentage(0.3),
    marginBottom: RFPercentage(0.5),
    borderRadius: RFPercentage(0.5),
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: RFPercentage(0.4),
  },

  dropdownIcon: {
    width: RFPercentage(2),
    height: RFPercentage(2),
  },
  dropdownText: {
    marginLeft: RFPercentage(1),
    fontSize: RFPercentage(1),
    color: "#ACAFB5",
  },
});

export default LagerbereichModal;
