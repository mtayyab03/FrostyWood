// app/index.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import MapView, {
  Polyline,
  Marker,
  Polygon,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import Constants from "expo-constants";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import * as Location from "expo-location";

import CustomMarker from "../components/CustomMarker";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

type Coordinate = {
  latitude: number;
  longitude: number;
};
type MarkerCoordinate = {
  latitude: number;
  longitude: number;
};
const HomeScreen: React.FC = () => {
  const [selectedMapGuid, setSelectedMapGuid] = useState<string | null>(null);
  const [currentLocationMarker, setCurrentLocationMarker] =
    useState<Coordinate | null>(null);

  // Callback function to handle the xMapGuid from Sidebar
  const handleMapGuidChange = (mapGuid: string) => {
    setSelectedMapGuid(mapGuid);
    console.log("Selected xMapGuid:", mapGuid);
    // Add additional logic if needed
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineCoordinates, setLineCoordinates] = useState<Coordinate[]>([
    // { latitude: -3.4653, longitude: -62.2159 },
    // { latitude: -3.4655, longitude: -62.217 },
  ]);

  // const [polygonCoordinates, setPolygonCoordinates] = useState<Coordinate[]>([
  //   { latitude: 37.78825, longitude: -122.4324 },
  //   { latitude: 37.78925, longitude: -122.4334 },
  //   { latitude: 37.78825, longitude: -122.4344 },
  //   { latitude: 37.78725, longitude: -122.4344 },
  //   { latitude: 37.78725, longitude: -122.4334 },
  // ]);
  const [polygonCoordinates, setPolygonCoordinates] = useState<Coordinate[]>(
    []
  );
  const [distance, setDistance] = useState(0);
  const [lassoArea, setLassoArea] = useState(0);
  const [mapRegion, setMapRegion] = useState({
    latitude: 47.71374304071032,
    longitude: 9.251982745002323,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef<MapView>(null);
  const [storagePlaces, setStoragePlaces] = useState<any[]>([]);

  const [woddlistData, setWoddlistData] = useState<any[]>([]);
  const [markerCoordinates, setMarkerCoordinates] =
    useState<MarkerCoordinate | null>(null);

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

  // current location end

  // storage places start api
  useEffect(() => {
    fetchRueckungDetails();
    console.log("Marke coordinates", markerCoordinates);
  }, []);

  useEffect(() => {
    fetchStoragePlaces();
  }, []);

  const fetchStoragePlaces = async () => {
    const loginName = "demo-admin001"; // Replace with your login name
    const password = "XYVJDuke"; // Replace with your password

    try {
      const response = await fetch(
        'https://portal.wood-in-vision.com/api/v1/poi?poiUniqueId=global/mechanical_timber_storage&loginNamesQuery=&filter=$.parent.std.guid=="9a87472d-9c10-4427-b45f-4e4d33aeedf1"',
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
          },
        }
      );
      const result = await response.json();
      console.log("Fetched Lagerbereich data:", result); // Log the response to understand its structure

      if (Array.isArray(result)) {
        const locat = result.map((item: any) => ({
          latitude: item.std.loc.lat,
          longitude: item.std.loc.lon,
        }));
        setStoragePlaces(locat);
        console.log("Location lat lon data", locat);
      } else {
        console.error("Storage data is not an array:", result);
      }
    } catch (error) {
      console.error("Error fetching Storage options:", error);
    }
  };

  // woodlist api
  const fetchRueckungDetails = async () => {
    const loginName = "demo-admin001"; // Replace with your login name
    const password = "XYVJDuke"; // Replace with your password
    const apiUrl = Constants.expoConfig?.extra?.API_URL_1;

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/poi?poiUniqueId=global/mechanical_timber_list&loginNamesQuery=${loginName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
          },
        }
      );

      const data = await response.json();
      console.log("Fetched woodlist data:", data);

      if (Array.isArray(data)) {
        setWoddlistData(data);

        // Extract the coordinates
        if (data.length > 0 && data[0].std && data[0].std.loc) {
          const { lat, lon } = data[0].std.loc;
          setMarkerCoordinates({ latitude: lat, longitude: lon });
        }
      } else {
        console.error("woodlist is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching woodlist details:", error);
    }
  };

  useEffect(() => {
    if (selectedMapGuid) {
      fetchPolygonCoordinates();
    }
  }, [selectedMapGuid]);

  // polygon coordinate api
  const fetchPolygonCoordinates = async () => {
    if (!selectedMapGuid) {
      console.error("No selected map GUID");
      return;
    }

    try {
      const response = await axios.get(
        `https://portal.wood-in-vision.com/api/v1/blob/${selectedMapGuid}`
      );
      const parser = new XMLParser();
      const jsonObj = parser.parse(response.data);

      console.log("Parsed XML:", jsonObj); // Log to inspect structure

      // Access coordinates strings for multiple placemarks
      const placemarks = jsonObj.kml?.Document?.Placemark;

      if (!placemarks) {
        throw new Error("Placemarks not found in the XML data");
      }

      // Extract coordinates from each placemark
      const newPolygons = placemarks
        .map((placemark: any) => {
          const coordinatesString =
            placemark?.Polygon?.outerBoundaryIs.LinearRing.coordinates;

          if (!coordinatesString) {
            return null;
          }

          const coordinatesArray = coordinatesString.trim().split(" ");
          const coordinates = coordinatesArray.map((coord: any) => {
            const [longitude, latitude] = coord.split(",").map(Number);
            return { latitude, longitude };
          });

          return { coordinates };
        })
        .filter(Boolean); // Remove any null values

      setPolygonCoordinates(newPolygons);
      if (newPolygons.length > 0) {
        const { latitude, longitude, latitudeDelta, longitudeDelta } =
          calculateRegion(newPolygons[0].coordinates);
        setMapRegion({ latitude, longitude, latitudeDelta, longitudeDelta });
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta,
              longitudeDelta,
            },
            1000
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  const calculateRegion = (coordinates: any) => {
    let minLat = coordinates[0].latitude;
    let maxLat = coordinates[0].latitude;
    let minLon = coordinates[0].longitude;
    let maxLon = coordinates[0].longitude;

    coordinates.forEach((coord: any) => {
      if (coord.latitude < minLat) minLat = coord.latitude;
      if (coord.latitude > maxLat) maxLat = coord.latitude;
      if (coord.longitude < minLon) minLon = coord.longitude;
      if (coord.longitude > maxLon) maxLon = coord.longitude;
    });

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLon + maxLon) / 2;
    const latitudeDelta = (maxLat - minLat) * 1.1; // Add some padding
    const longitudeDelta = (maxLon - minLon) * 1.1; // Add some padding

    return { latitude, longitude, latitudeDelta, longitudeDelta };
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMeasuring = () => {
    setIsMeasuring(!isMeasuring);
    if (!isMeasuring) {
      setLineCoordinates([]);
      setDistance(0);
    }
  };

  const clearMeasurements = () => {
    setLineCoordinates([]);
    setDistance(0);
  };

  const addCoordinate = (coordinate: any) => {
    const newCoordinates: any = [...lineCoordinates, coordinate];
    setLineCoordinates(newCoordinates);
    if (newCoordinates.length > 1) {
      const newDistance = calculateDistance(newCoordinates);
      setDistance(newDistance);
    }
  };

  const addPolygonCoordinate = (coordinate: any) => {
    const newCoordinates: any = [...polygonCoordinates, coordinate];
    setPolygonCoordinates(newCoordinates);
    const area = calculatePolygonArea(newCoordinates);
    setLassoArea(area);
  };

  const calculateDistance = (coordinates: any) => {
    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lat1, lon1] = [coordinates[i].latitude, coordinates[i].longitude];
      const [lat2, lon2] = [
        coordinates[i + 1].latitude,
        coordinates[i + 1].longitude,
      ];
      const R = 6371; // Radius of the Earth in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        0.5 -
        Math.cos(dLat) / 2 +
        (Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          (1 - Math.cos(dLon))) /
          2;
      totalDistance += R * 2 * Math.asin(Math.sqrt(a));
    }
    return totalDistance;
  };

  const calculatePolygonArea = (coordinates: any) => {
    if (coordinates.length < 3) return 0;

    let total = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const addX = coordinates[i].longitude;
      const addY =
        coordinates[i == coordinates.length - 1 ? 0 : i + 1].latitude;
      const subX =
        coordinates[i == coordinates.length - 1 ? 0 : i + 1].longitude;
      const subY = coordinates[i].latitude;
      total += addX * addY * 0.5 - subX * subY * 0.5;
    }
    return Math.abs(total * 111139); // Convert degrees to meters
  };

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

  const handleMapPress = (e: { nativeEvent: { coordinate: any } }) => {
    const { coordinate } = e.nativeEvent;
    console.log("Map pressed at:", coordinate);
    if (isMeasuring) {
      addCoordinate(coordinate);
    } else if (isDrawing) {
      addPolygonCoordinate(coordinate);
    }
  };

  const deletePolygon = () => {
    setPolygonCoordinates([]);
    setIsDrawing(false);
    setLassoArea(0);
  };

  console.log("Line Coordinates:", lineCoordinates);
  console.log("Polygon Coordinates:", polygonCoordinates);
  return (
    <View style={styles.container}>
      {/* <View style={{ marginTop: 37 }} /> */}
      <Header />
      <View style={styles.mainContent}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          setIsDrawing={setIsDrawing}
          lassoArea={lassoArea}
          onMapGuidChange={handleMapGuidChange} // Pass the callback function
        />
        <MapView
          provider={PROVIDER_GOOGLE}
          mapType="satellite"
          ref={mapRef}
          style={styles.map}
          onPress={handleMapPress}
          region={mapRegion}
        >
          {lineCoordinates.length > 0 && (
            <Polyline
              coordinates={lineCoordinates}
              strokeColor="orange"
              strokeWidth={2}
            />
          )}
          {lineCoordinates.map((coordinate, index) => (
            <Marker key={index} coordinate={coordinate} />
          ))}
          {polygonCoordinates.map((polygon: any, index: any) => (
            <Polygon
              key={index}
              coordinates={polygon.coordinates}
              strokeColor="rgba(0, 255, 0, 1)" // Update stroke color to fully opaque green
              fillColor="rgba(0, 255, 0, 0.1)" // Update fill color to slightly transparent green
              strokeWidth={2}
            />
          ))}

          {storagePlaces.map((place, index) => (
            <Marker key={index} coordinate={place}>
              <Image
                source={require("../assets/images/icons.png")} // Update the path to your image
                style={{ width: 40, height: 40 }} // Adjust size as needed
              />
            </Marker>
          ))}

          {markerCoordinates && (
            <CustomMarker
              // {
              //   latitude: 47.71435438721113,
              //   longitude: 9.252388626337051,
              // }
              coordinate={markerCoordinates}
              text="0.3"
            />
          )}

          {currentLocationMarker && (
            <Marker coordinate={currentLocationMarker} title="Your Location" />
          )}
        </MapView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isMeasuring && styles.buttonActive]}
            onPress={toggleMeasuring}
          >
            <Icon name="linear-scale" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={clearMeasurements}>
            <Icon name="delete" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={zoomIn}>
            <Icon name="zoom-in" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={zoomOut}>
            <Icon name="zoom-out" size={24} color="#fff" />
          </TouchableOpacity>
          {polygonCoordinates.length > 0 && (
            <TouchableOpacity style={styles.button} onPress={deletePolygon}>
              <Icon name="delete" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
            <Icon name="location-on" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {isMeasuring && distance > 0 && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              Distance: {distance.toFixed(2)} km
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "column",
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
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
});

export default HomeScreen;
