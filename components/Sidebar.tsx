// components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import FeatureModal from "./FeatureModal";
import DetailedSidebar from "./DetailedSidebar";
import Constants from "expo-constants";
import uuid from "react-native-uuid";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  setIsDrawing: (isDrawing: boolean) => void;
  lassoArea: number;
  onMapGuidChange: (mapGuid: string) => void; // Add this prop
}

interface Task {
  id: number;
  number: string;
  status: string;
  details: string[];
  guid: string;
  xMapGuid?: string; // Optional property
  poiUniqueId: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  setIsDrawing,
  lassoArea,
  onMapGuidChange, // Destructure the new prop
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(300105);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [detailedTask, setDetailedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLassoActive, setIsLassoActive] = useState(false);
  const apiUrl = Constants.expoConfig?.extra?.API_URL_1;
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const loginName = "demo-admin001"; // Replace with your login name
    const password = "XYVJDuke"; // Replace with your password

    try {
      const response = await fetch(
        `${apiUrl}/api/v1/poi?poiUniqueId=global/mechanical_timber_harvest&loginNamesQuery=${loginName}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(`${loginName}:${password}`)}`,
          },
        }
      );

      const data = await response.json();
      console.log("Fetched data:", data);
      const mapguid = data.poi?.x_map?.guid;
      console.log("xmap contract guid", mapguid);

      if (Array.isArray(data)) {
        const formattedTasks = data.map((item: any) => ({
          id: item.poi.ordernumber
            ? item.poi.ordernumber.toString()
            : uuid.v4().toString(), // Ensure each task has a unique id
          number: `Nr.: ${item.poi.ordernumber || "Unknown"}`,
          status: item.poi.status === "10" ? "AKTIV" : "VERFÜGBAR",
          details: [
            `- ${item.poi.description || "No Description"}`,
            `Auftraggeber: ${item.poi.kundenstamm || "Unknown"}`,
            `${item.poi.working_team || "Unknown"}`,
          ],
          guid: item.std.guid,
          xMapGuid: item.poi.x_map?.guid, // Safe access to x_map.guid
          poiUniqueId:
            item.poi.poiUniqueId || "global/mechanical_timber_harvest",
        }));
        setTasks(formattedTasks);
      } else {
        console.error("Data is not an array:", data);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleTaskClick = (taskId: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "AKTIV" ? "VERFÜGBAR" : "AKTIV" }
          : { ...task, status: "VERFÜGBAR" }
      )
    );
    setActiveTaskId((prevActiveTaskId) =>
      prevActiveTaskId === taskId ? null : taskId
    );
    const clickedTask = tasks.find((task) => task.id === taskId);
    if (clickedTask) {
      console.log("x_map GUID:", clickedTask.xMapGuid);
      onMapGuidChange(clickedTask.xMapGuid || ""); // Pass the xMapGuid to the callback
    }
  };

  const handleTaskDoubleClick = (task: Task) => {
    console.log("Detailed Task:", task);
    setDetailedTask(task);
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

  const addNewTask = (newTask: Task) => {
    setTasks([...tasks, newTask]);
  };

  const closeDetailedSidebar = () => {
    setDetailedTask(null);
  };

  const deactivateTask = () => {
    if (detailedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === detailedTask.id ? { ...task, status: "VERFÜGBAR" } : task
        )
      );
      setDetailedTask(null);
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.id.toString().includes(searchQuery)
  );

  const handleLassoToggle = () => {
    setIsLassoActive(!isLassoActive);
    setIsDrawing(!isLassoActive);
  };

  return (
    <View style={[styles.sidebar, !isOpen && styles.sidebarCollapsed]}>
      <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
        <Icon
          name={isOpen ? "chevron-left" : "chevron-right"}
          size={30}
          color="#fff"
        />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>1.5 Holzernte mechanisiert</Text>
          </View>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AKTIVER AUFTRAG</Text>
              {tasks
                .filter((task) => task.status === "AKTIV")
                .map((task) => (
                  <View key={task.id} style={styles.taskContainer}>
                    <TouchableOpacity
                      onPress={() => handleTaskClick(task.id)}
                      onLongPress={() => handleTaskDoubleClick(task)}
                      style={[
                        styles.task,
                        activeTaskId === task.id && styles.activeTask,
                      ]}
                    >
                      <Text style={styles.taskNumber}>{task.number}</Text>
                      <Text style={styles.status}>{task.status}</Text>
                      {task.details.map((detail, index) => (
                        <Text key={index} style={styles.taskDetails}>
                          {detail}
                        </Text>
                      ))}
                    </TouchableOpacity>
                    {activeTaskId === task.id && (
                      <TouchableOpacity
                        style={styles.editIcon}
                        // onPress={toggleModal}
                      >
                        <Icon name="edit" size={20} color="#000" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>VERFÜGBARE AUFTRÄGE</Text>
              <TextInput
                placeholder="Suche"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {/* onPress={toggleModal} */}
              <TouchableOpacity style={styles.addButton}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
              {filteredTasks
                .filter((task) => task.status === "VERFÜGBAR")
                .map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => handleTaskClick(task.id)}
                    style={[
                      styles.task,
                      activeTaskId === task.id && styles.activeTask,
                    ]}
                  >
                    <Text style={styles.taskNumber}>{task.number}</Text>
                    <Text style={styles.status}>{task.status}</Text>
                    {task.details.map((detail, index) => (
                      <Text key={index} style={styles.taskDetails}>
                        {detail}
                      </Text>
                    ))}
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
          <FeatureModal
            isVisible={isModalVisible}
            onClose={toggleModal}
            onSave={addNewTask}
          />
          {detailedTask && (
            <DetailedSidebar
              task={detailedTask}
              onClose={closeDetailedSidebar}
              onDeactivate={deactivateTask}
              setIsDrawing={setIsDrawing}
              lassoArea={lassoArea}
              handleLassoToggle={handleLassoToggle}
              isLassoActive={isLassoActive}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 300,
    backgroundColor: "#f4f4f4",
    height: Dimensions.get("window").height,
    position: "relative",
    zIndex: 2,
  },
  sidebarCollapsed: {
    width: 0,
    padding: 0,
  },
  toggleButton: {
    position: "absolute",
    top: 20,
    right: -45,
    backgroundColor: "#333",
    borderRadius: 50,
    padding: 5,
    zIndex: 3,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  header: {
    padding: 10,
    backgroundColor: "#333",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  taskContainer: {
    position: "relative",
  },
  activeTask: {
    backgroundColor: "#e0ffe0",
    padding: 10,
    borderRadius: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  task: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  taskNumber: {
    fontWeight: "bold",
  },
  taskDetails: {
    marginTop: 5,
  },
  status: {
    color: "green",
    fontWeight: "bold",
  },
  searchInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    height: 40,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green",
    borderRadius: 20,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
  },
  editIcon: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});

export default Sidebar;
