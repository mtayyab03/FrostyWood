// components/DetailedSidebar.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import AufarbeitungDetails from "./AufarbeitungDetails";
import RueckungDetails from "./RueckungDetails";
import AuftragsdatenDetails from "./AuftragsdatenDetails";
import Constants from "expo-constants";

interface DetailedSidebarProps {
  task: {
    id: number;
    number: string;
    status: string;
    details: string[];
    guid: string;
    poiUniqueId: string;
  };
  onClose: () => void;
  onDeactivate: () => void;
  setIsDrawing: (isDrawing: boolean) => void;
  lassoArea: number;
  handleLassoToggle: () => void;
  isLassoActive: boolean;
}

const DetailedSidebar: React.FC<DetailedSidebarProps> = ({
  task,
  onClose,
  onDeactivate,
  setIsDrawing,
  lassoArea,
  handleLassoToggle,
  isLassoActive,
}) => {
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [rueckungData, setRueckungData] = useState<any[]>([]);

  useEffect(() => {
    fetchRueckungDetails();
  }, [task]);

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
      console.log("Fetched Rueckung data:", data);

      if (Array.isArray(data)) {
        setRueckungData(data);
      } else {
        console.error("Rueckung data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching Rueckung details:", error);
    }
  };

  const toggleDropdown = (section: number) => {
    setDropdownVisible(dropdownVisible === section ? null : section);
  };

  useEffect(() => {
    console.log("Rueckung data passed to RueckungDetails:", rueckungData);
  }, [rueckungData]);

  return (
    <View style={styles.detailedSidebar}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Auftrag: {task.number}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.status}>{task.status}</Text>
          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={onDeactivate}
          >
            <Text style={styles.deactivateButtonText}>DEAKTIVIEREN</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.section}
          // onPress={() => toggleDropdown(1)}
        >
          <Text style={styles.sectionTitle}>Auftragsdaten</Text>
          <Icon
            name={dropdownVisible === 1 ? "expand-less" : "expand-more"}
            size={24}
            color="#333"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
        {dropdownVisible === 1 && (
          <View style={styles.dropdownContent}>
            <AuftragsdatenDetails />
          </View>
        )}

        <TouchableOpacity
          style={styles.section}
          // onPress={() => toggleDropdown(2)}
        >
          <Text style={styles.sectionTitle}>Aufarbeitung</Text>
          <Icon
            name={dropdownVisible === 2 ? "expand-less" : "expand-more"}
            size={24}
            color="#333"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
        {dropdownVisible === 2 && (
          <View style={styles.dropdownContent}>
            <AufarbeitungDetails />
          </View>
        )}
        <TouchableOpacity
          style={styles.section}
          onPress={() => toggleDropdown(3)}
        >
          <Text style={styles.sectionTitle}>Rückung</Text>
          <Icon
            name={dropdownVisible === 3 ? "expand-less" : "expand-more"}
            size={24}
            color="#333"
            style={styles.dropdownIcon}
          />
        </TouchableOpacity>
        {dropdownVisible === 3 && (
          <View style={styles.dropdownContent}>
            <RueckungDetails
              setIsDrawing={setIsDrawing}
              data={rueckungData}
              lassoArea={lassoArea}
              isLassoActive={isLassoActive}
              handleLassoToggle={handleLassoToggle}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  detailedSidebar: {
    width: 300,
    height: "100%",
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#333",
  },
  backButton: {
    color: "#fff",
    fontSize: 18,
  },
  title: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  status: {
    color: "green",
    fontWeight: "bold",
    marginRight: 10,
  },
  deactivateButton: {
    backgroundColor: "green",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deactivateButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    padding: 10,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  sectionTitle: {
    fontSize: 16,
  },
  dropdownIcon: {
    marginLeft: "auto",
  },
  dropdownContent: {
    padding: 10,
    backgroundColor: "#f4f4f4",
  },
});

export default DetailedSidebar;
