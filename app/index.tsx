// app/index.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import MapView, { Polyline, Marker, Polygon } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";

import axios from "axios";
import { XMLParser } from "fast-xml-parser";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
type Coordinate = {
  latitude: number;
  longitude: number;
};

const HomeScreen: React.FC = () => {
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

  // useEffect(() => {
  //   fetchPolygonCoordinates();
  // }, []);

  // const fetchPolygonCoordinates = async () => {
  //   try {
  //     const response = await axios.get('https://portal.wood-in-vision.com/api/v1/blob/06ac11b7-0a8f-47bc-8d20-5e6b3231f11d');
  //     const parser = new XMLParser();
  //     const jsonObj = parser.parse(response.data);

  //     console.log("Parsed XML:", jsonObj); // Log to inspect structure

  //     // Access coordinates string
  //     const coordinatesString = jsonObj.kml?.Document?.Placemark?.[0]?.Polygon?.outerBoundaryIs?.LinearRing?.coordinates;

  //     if (!coordinatesString) {
  //       throw new Error("Coordinates not found in the XML data");
  //     }

  //     // Convert coordinates string to array of Coordinate objects
  //     const coordinatesArray = coordinatesString.trim().split(" ");
  //     const newCoordinates = coordinatesArray.map(coord => {
  //       const [longitude, latitude] = coord.split(",").map(Number);
  //       return { latitude, longitude };
  //     });

  //     setPolygonCoordinates(newCoordinates);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    fetchPolygonCoordinates();
  }, []);

  const fetchPolygonCoordinates = async () => {
    try {
      const response = await axios.get(
        "https://portal.wood-in-vision.com/api/v1/blob/06ac11b7-0a8f-47bc-8d20-5e6b3231f11d"
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
    } catch (error) {
      console.error(error);
    }
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
        />
        <MapView
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
