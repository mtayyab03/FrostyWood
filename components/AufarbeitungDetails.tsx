import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface LogType {
  log_species: string;
  log_type: string;
  log_volume: string;
  treenumber: string;
  std: {
    mts: string;
  };
}

const AufarbeitungDetails: React.FC = () => {
  const [data, setData] = useState<LogType[]>([]);
  const [logTypeData, setLogTypeData] = useState<any[]>([]);
  const [totalLogVolume, setTotalLogVolume] = useState(0);
  const [treeCount, setTreeCount] = useState(0);
  const [averageVolumePerTree, setAverageVolumePerTree] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const loginName = "demo-admin001"; // Replace with your login name
    const password = "XYVJDuke"; // Replace with your password

    try {
      const response = await fetch(
        "https://portal.wood-in-vision.com/api/v1/poi?poiUniqueId=global/mechanical_timber_list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
          },
        }
      );
      const result = await response.json();
      console.log("Fetched data:", result);
      if (Array.isArray(result)) {
        processFetchedData(result);
      } else {
        console.error("Fetched data is not an array:", result);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const processFetchedData = (fetchedData: any[]) => {
    const groupedData: { [key: string]: number } = {};
    let totalVolume = 0;
    let allTreeNumbers: string[] = [];
    let timestamps: number[] = [];

    fetchedData.forEach((item) => {
      const { log_species, log_type, log_volume, treenumber, std } = item.poi;
      totalVolume += parseFloat(log_volume) || 0;
      allTreeNumbers.push(treenumber);
      timestamps.push(new Date(item.std.mts).getTime());

      const key = `${log_species} - ${log_type}`;
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key] += parseFloat(log_volume) || 0;
    });

    const distinctTreeNumbers = Array.from(new Set(allTreeNumbers));
    const treeCount = distinctTreeNumbers.length;
    const averageVolumePerTree = totalVolume / (treeCount || 1);

    const startDate = new Date(Math.min(...timestamps)).toLocaleString();
    const endDate = new Date(Math.max(...timestamps)).toLocaleString();

    setTotalLogVolume(totalVolume);
    setTreeCount(treeCount);
    setAverageVolumePerTree(averageVolumePerTree);
    setStartDate(startDate);
    setEndDate(endDate);

    const formattedData = Object.entries(groupedData).map(([type, volume]) => ({
      type,
      volume,
    }));

    setLogTypeData(formattedData);
    setData(fetchedData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableHeader}>Sortiment</Text>
          <Text style={styles.tableHeader}>Anzahl</Text>
          <Text style={styles.tableHeader}>m3 price</Text>
        </View>
        {logTypeData.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCell}>{item.type}</Text>
            <Text style={styles.tableCell}>{item.volume.toFixed(2)}</Text>
            <Text style={styles.tableCell}>{item.volume.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>TOTAL</Text>
          <Text style={styles.tableCell}>{totalLogVolume.toFixed(2)}</Text>
          <Text style={styles.tableCell}>{totalLogVolume.toFixed(2)}</Text>
        </View>
      </View>
      <ScrollView horizontal>
        <BarChart
          data={{
            labels: logTypeData.map((item) => item.type),
            datasets: [
              {
                data: logTypeData.map((item) => item.volume),
              },
            ],
          }}
          width={Dimensions.get("window").width}
          height={220}
          yAxisLabel=""
          yAxisSuffix="m3"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
      </ScrollView>
      <View style={styles.detailRow}>
        <Text style={styles.detailText}>{averageVolumePerTree.toFixed(2)}</Text>
        <Text style={styles.detailText}>-</Text>
        <Text style={styles.detailText}>{treeCount}</Text>
      </View>
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <Text style={styles.dateText}>{startDate}</Text>
          <Text style={styles.dateLabel}>Startdatum</Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateText}>{endDate}</Text>
          <Text style={styles.dateLabel}>Enddatum</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  table: {
    width: "100%",
    marginVertical: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: "center",
    fontSize: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  detailText: {
    fontSize: 10,
    color: "green",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 10,
  },
  dateItem: {
    alignItems: "center",
  },
  dateText: {
    fontSize: 10,
    color: "green",
  },
  dateLabel: {
    fontSize: 10,
    color: "gray",
  },
});

export default AufarbeitungDetails;
