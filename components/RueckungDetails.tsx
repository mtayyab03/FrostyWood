// components/RueckungDetails.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialIcons";
import ColorSelectionModal from "./ColorSelectionModal";
import LagerbereichModal from "./LagerbereichModal";

interface RueckungDetailsProps {
  setIsDrawing: (isDrawing: boolean) => void;
  data: any[];
  lassoArea: number;
  isLassoActive: boolean;
  handleLassoToggle: () => void;
}
type DataItem = {
  poi: {
    log_type: string;
    log_volume: string;
    log_sale_length: string;
    log_grade: string;
  };
};
const RueckungDetails: React.FC<RueckungDetailsProps> = ({
  setIsDrawing,
  data,
  lassoArea,
  isLassoActive,
  handleLassoToggle,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [lagerbereichModalVisible, setLagerbereichModalVisible] =
    useState(false);
  const [selectedColor, setSelectedColor] = useState("brown");
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);
  const [lagerbereichOptions, setLagerbereichOptions] = useState<string[]>([]);
  const [selectedLagerbereich, setSelectedLagerbereich] = useState<string>("");

  // replace data here
  const dummyData: DataItem[] = [
    {
      poi: {
        log_type: "Type1",
        log_volume: "10",
        log_sale_length: "20",
        log_grade: "A",
      },
    },
    {
      poi: {
        log_type: "Type2",
        log_volume: "15",
        log_sale_length: "25",
        log_grade: "B",
      },
    },
    {
      poi: {
        log_type: "Type3",
        log_volume: "12",
        log_sale_length: "22",
        log_grade: "C",
      },
    },
  ];

  useEffect(() => {
    console.log("Data passed to RueckungDetails:", data);
  }, [data]);

  useEffect(() => {
    fetchLagerbereichOptions();
  }, []);

  const fetchLagerbereichOptions = async () => {
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
        const names = result.map((item: any) => item.poi.name);
        setLagerbereichOptions(names);
        console.log("lagerber name", names);
      } else {
        console.error("Lagerbereich data is not an array:", result);
      }
    } catch (error) {
      console.error("Error fetching Lagerbereich options:", error);
    }
  };

  const handleRowClick = (index: number) => {
    setActiveRowIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  const renderRow = (
    index: number,
    sortiment: string,
    offenFM: string,
    lassoFM: string,
    gerucktFM: string
  ) => (
    <TouchableOpacity
      key={index}
      onPress={() => handleRowClick(index)}
      style={[styles.row, activeRowIndex === index && styles.activeRow]}
    >
      <Text style={styles.cell}>{sortiment}</Text>
      <TouchableOpacity
        style={styles.circleCell}
        onPress={() => setModalVisible(true)}
      >
        <View style={[styles.circle, { backgroundColor: selectedColor }]} />
      </TouchableOpacity>
      <Text style={styles.cell}>{offenFM}</Text>
      <Text style={[styles.cell, styles.orangeCell]}>{lassoFM}</Text>
      <Text style={styles.cell}>{gerucktFM}</Text>
    </TouchableOpacity>
  );

  const handleSaveColor = (color: string) => {
    setSelectedColor(color);
  };

  const handleSaveLagerbereich = (data: any) => {
    console.log(data);
  };

  const sumValues = (key: string) => {
    return data
      .reduce((total, item) => {
        const value = parseFloat(item.poi[key]);
        return total + (isNaN(value) ? 0 : value);
      }, 0)
      .toFixed(2);
  };

  const totalVolume = sumValues("log_volume");
  const totalSaleLength = sumValues("log_sale_length");
  const totalGrade = sumValues("log_grade");

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.columnHeader}>Sortiment</Text>
        <Text style={styles.emptyHeader}></Text>
        <Text style={styles.columnHeader}>OFFEN FM</Text>
        <Text style={styles.columnHeader}>LASSO FM</Text>
        <Text style={styles.columnHeader}>GERÜCKT FM</Text>
      </View>

      {/* replace here data */}
      {data && data.length > 0 ? (
        data.map((item, index) => (
          <View key={index}>
            {renderRow(
              index,
              item.poi.log_type,
              (item.poi.log_volume * 0.0001).toFixed(2), // Dividing by 0.0001
              isLassoActive && activeRowIndex === index
                ? lassoArea.toFixed(2)
                : item.poi.log_sale_length,
              item.poi.log_grade
            )}
          </View>
        ))
      ) : (
        <Text>No data available</Text>
      )}
      <View style={styles.footerRow}>
        <Text style={styles.footerCell}>SUMME TOTAL</Text>
        <Text style={styles.footerCell}>{totalVolume}</Text>
        <Text style={[styles.footerCell, styles.orangeCell]}>
          {isLassoActive ? lassoArea.toFixed(2) : totalSaleLength}
        </Text>
        <Text style={styles.footerCell}>{totalGrade}</Text>
      </View>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.lassoButton}
          onPress={handleLassoToggle}
        >
          <Icon
            name={isLassoActive ? "check-box" : "check-box-outline-blank"}
            size={20}
            color="green"
          />
          <Text style={styles.lassoButtonText}>LASSO</Text>
        </TouchableOpacity>
        <View style={styles.dropdownGroup}>
          <Text style={styles.dropdownLabel}>Lagerbereich</Text>
          <Picker
            selectedValue={selectedLagerbereich}
            style={styles.dropdown}
            onValueChange={(itemValue) => setSelectedLagerbereich(itemValue)}
          >
            <Picker.Item label="Select Lagerbereich" value="" />
            {lagerbereichOptions.map((option, index) => (
              <Picker.Item key={index} label={option} value={option} />
            ))}
          </Picker>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setLagerbereichModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.abladenButton}>
          <Text style={styles.abladenButtonText}>ABLADEN</Text>
        </TouchableOpacity>
      </View>
      <ColorSelectionModal
        isVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveColor}
        selectedColor={selectedColor}
      />
      <LagerbereichModal
        isVisible={lagerbereichModalVisible}
        onClose={() => setLagerbereichModalVisible(false)}
        onSave={handleSaveLagerbereich}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 5,
  },
  columnHeader: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  emptyHeader: {
    flex: 0.5,
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
  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 8,
  },
  orangeCell: {
    color: "orange",
    fontSize: 10,
  },
  circleCell: {
    justifyContent: "center",
    alignItems: "center",
    flex: 0.5,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  brownCircle: {
    backgroundColor: "brown",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingVertical: 5,
    marginTop: 100,
  },
  footerCell: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  bottomSection: {
    marginTop: 20,
  },
  lassoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  lassoButtonText: {
    marginLeft: 10,
    fontWeight: "bold",
    color: "green",
    fontSize: 10,
  },
  dropdownGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dropdownLabel: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 10,
  },
  dropdown: {
    flex: 2,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginLeft: 10,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "green",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 20,
  },
  abladenButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  abladenButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
});

export default RueckungDetails;
