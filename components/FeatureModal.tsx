// components/FeatureModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import Modal from 'react-native-modal';
import MapView, { Marker, Polyline, Polygon, LatLng } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import Constants from 'expo-constants';

interface FeatureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

interface Task {
  id: number;
  number: string;
  status: string;
  details: string[];
  markers: LatLng[];
  polylines: PolylineType[];
  polygons: PolygonType[];
  guid: 'some-guid', // Replace with actual guid
  poiUniqueId: 'some-poiUniqueId' // Replace with actual poiUniqueId
}

interface PolylineType {
  coordinates: LatLng[];
}

interface PolygonType {
  coordinates: LatLng[];
}

const FeatureModal: React.FC<FeatureModalProps> = ({ isVisible, onClose, onSave }) => {
  const [taskNumber, setTaskNumber] = useState('');
  const [details, setDetails] = useState('');
  const [auftraggeber, setAuftraggeber] = useState('');
  const [forstamt, setForstamt] = useState('');
  const [revier, setRevier] = useState('');
  const [waldort, setWaldort] = useState('');
  const [status, setStatus] = useState('');
  const [maßnahme, setMaßnahme] = useState('');
  const [auftragnehmer, setAuftragnehmer] = useState('');
  const [subunternehmer, setSubunternehmer] = useState('');
  const [ansprechpartner, setAnsprechpartner] = useState('');
  const [extVertragsNr, setExtVertragsNr] = useState('');
  const [extAuftragsNr, setExtAuftragsNr] = useState('');
  const [arbeitsgerät, setArbeitsgerät] = useState('');
  const [beschreibungWaldort, setBeschreibungWaldort] = useState('');
  const [zeitplan, setZeitplan] = useState('');
  const [fläche, setFläche] = useState('');
  const [einheit, setEinheit] = useState('');
  const [teilenMitWebPortal, setTeilenMitWebPortal] = useState('');
  const [teilenMitAppZugang, setTeilenMitAppZugang] = useState('');
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [polylines, setPolylines] = useState<PolylineType[]>([]);
  const [polygons, setPolygons] = useState<PolygonType[]>([]);
  const [drawingMode, setDrawingMode] = useState<'marker' | 'line' | 'polygon' | null>(null);
  const apiUrl = Constants.expoConfig?.extra?.API_URL_1;

  const handleSave = async () => {
    const newTask: Task = {
      id: Date.now(),
      number: `Nr.: ${taskNumber}`,
      status: 'VERFÜGBAR',
      details: [details],
      markers,
      polylines,
      polygons,
      guid: 'some-guid', // Replace with actual guid
      poiUniqueId: 'some-poiUniqueId' // Replace with actual poiUniqueId
    };

    // API request payload
    const payload = {
      std: {
        poiUniqueId: 'global/mechanical_timber_harvest',
      },
      poi: {
        _address: {
          city: waldort,
          country: 'Österreich', // Update with appropriate value
          state: 'Oberösterreich', // Update with appropriate value
        },
        actionnumber: taskNumber,
        description: details,
        kundenstamm: auftraggeber,
        region: forstamt,
        working_team: subunternehmer,
        ordernumber: taskNumber,
        status: status === 'AKTIV' ? '10' : '00',
        // Add other fields here as needed
      },
    };

    try {
      const loginName = 'demo-admin001'; // Replace with your login name
      const password = 'azSCiZjF'; // Replace with your password
      const response = await fetch(`${apiUrl}/api/v1/poi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${loginName}:${password}`)}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave(newTask);
        onClose();
        Alert.alert("Success", "Feature saved successfully.");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", `Failed to save feature: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error saving feature:", error);
      Alert.alert("Error", "An error occurred while saving the feature.");
    }
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: LatLng } }) => {
    const { coordinate } = e.nativeEvent;
    if (drawingMode === 'marker') {
      setMarkers([...markers, coordinate]);
    } else if (drawingMode === 'line') {
      setPolylines(prevPolylines => {
        if (prevPolylines.length === 0 || drawingMode !== 'line') {
          return [...prevPolylines, { coordinates: [coordinate] }];
        } else {
          const newPolylines = [...prevPolylines];
          newPolylines[newPolylines.length - 1] = {
            ...newPolylines[newPolylines.length - 1],
            coordinates: [...newPolylines[newPolylines.length - 1].coordinates, coordinate],
          };
          return newPolylines;
        }
      });
    } else if (drawingMode === 'polygon') {
      setPolygons(prevPolygons => {
        if (prevPolygons.length === 0 || drawingMode !== 'polygon') {
          return [...prevPolygons, { coordinates: [coordinate] }];
        } else {
          const newPolygons = [...prevPolygons];
          newPolygons[newPolygons.length - 1] = {
            ...newPolygons[newPolygons.length - 1],
            coordinates: [...newPolygons[newPolygons.length - 1].coordinates, coordinate],
          };
          return newPolygons;
        }
      });
    }
  };

  const clearDrawings = () => {
    setMarkers([]);
    setPolylines([]);
    setPolygons([]);
    setDrawingMode(null);
  };

  const toggleDrawingMode = (mode: 'marker' | 'line' | 'polygon') => {
    setDrawingMode(drawingMode === mode ? null : mode);
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add New Feature</Text>
        <ScrollView>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Auftragsnummer</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter task number"
              value={taskNumber}
              onChangeText={setTaskNumber}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Maßnahme</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Maßnahme"
              value={maßnahme}
              onChangeText={setMaßnahme}
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
          <Text style={styles.sectionTitle}>Geschäftspartner</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Auftraggeber</Text>
            <Picker
              selectedValue={auftraggeber}
              style={styles.input}
              onValueChange={(itemValue) => setAuftraggeber(itemValue)}
            >
              <Picker.Item label="Select Auftraggeber" value="" />
              <Picker.Item label="FF Holztransporte" value="FF Holztransporte" />
              <Picker.Item label="DEMO Firma Holzernte" value="DEMO Firma Holzernte" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Forstamt</Text>
            <Picker
              selectedValue={forstamt}
              style={styles.input}
              onValueChange={(itemValue) => setForstamt(itemValue)}
            >
              <Picker.Item label="Select Forstamt" value="" />
              <Picker.Item label="01 Werk Musterhausen" value="01 Werk Musterhausen" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Revier, Waldfläche</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Revier"
              value={revier}
              onChangeText={setRevier}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Waldort</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Waldort"
              value={waldort}
              onChangeText={setWaldort}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Auftragnehmer</Text>
            <Picker
              selectedValue={auftragnehmer}
              style={styles.input}
              onValueChange={(itemValue) => setAuftragnehmer(itemValue)}
            >
              <Picker.Item label="Select Auftragnehmer" value="" />
              <Picker.Item label="DEMO Firma Auftragnehmer" value="DEMO Firma Auftragnehmer" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subunternehmer</Text>
            <Picker
              selectedValue={subunternehmer}
              style={styles.input}
              onValueChange={(itemValue) => setSubunternehmer(itemValue)}
            >
              <Picker.Item label="Select Subunternehmer" value="" />
              <Picker.Item label="DEMO Firma Subunternehmer" value="DEMO Firma Subunternehmer" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ansprechpartner</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Ansprechpartner"
              value={ansprechpartner}
              onChangeText={setAnsprechpartner}
            />
          </View>
          <Text style={styles.sectionTitle}>Auftragsdetails</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ext. Vertrags-Nr.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ext. Vertrags-Nr."
              value={extVertragsNr}
              onChangeText={setExtVertragsNr}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ext. Auftrags-Nr.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ext. Auftrags-Nr."
              value={extAuftragsNr}
              onChangeText={setExtAuftragsNr}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Arbeitsgerät</Text>
            <Picker
              selectedValue={arbeitsgerät}
              style={styles.input}
              onValueChange={(itemValue) => setArbeitsgerät(itemValue)}
            >
              <Picker.Item label="Select Arbeitsgerät" value="" />
              <Picker.Item label="DEMO Arbeitsgerät" value="DEMO Arbeitsgerät" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Beschreibung Waldort</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Beschreibung Waldort"
              value={beschreibungWaldort}
              onChangeText={setBeschreibungWaldort}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Zeitplan | Darstellung in der Auftragsliste</Text>
            <Picker
              selectedValue={zeitplan}
              style={styles.input}
              onValueChange={(itemValue) => setZeitplan(itemValue)}
            >
              <Picker.Item label="Select Zeitplan" value="" />
              <Picker.Item label="DEMO Zeitplan" value="DEMO Zeitplan" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fläche [ha]</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Fläche"
              value={fläche}
              onChangeText={setFläche}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Einheit</Text>
            <Picker
              selectedValue={einheit}
              style={styles.input}
              onValueChange={(itemValue) => setEinheit(itemValue)}
            >
              <Picker.Item label="Select Einheit" value="" />
              <Picker.Item label="DEMO Einheit" value="DEMO Einheit" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teilen mit WEB-Portal</Text>
            <Picker
              selectedValue={teilenMitWebPortal}
              style={styles.input}
              onValueChange={(itemValue) => setTeilenMitWebPortal(itemValue)}
            >
              <Picker.Item label="Select WEB-Portal" value="" />
              <Picker.Item label="demo-0001" value="demo-0001" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teilen mit APP-Zugang</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter APP-Zugang"
              value={teilenMitAppZugang}
              onChangeText={setTeilenMitAppZugang}
            />
          </View>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={(region) => setRegion(region)}
              onPress={handleMapPress}
            >
              {markers.map((marker, index) => (
                <Marker key={index} coordinate={marker} />
              ))}
              {polylines.map((polyline, index) => (
                <Polyline key={index} coordinates={polyline.coordinates} />
              ))}
              {polygons.map((polygon, index) => (
                <Polygon key={index} coordinates={polygon.coordinates} />
              ))}
            </MapView>
            <View style={styles.mapButtonsContainer}>
              <TouchableOpacity
                style={[styles.mapButton, drawingMode === 'marker' && styles.activeButton]}
                onPress={() => toggleDrawingMode('marker')}
              >
                <Icon name="place" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapButton, drawingMode === 'line' && styles.activeButton]}
                onPress={() => toggleDrawingMode('line')}
              >
                <Icon name="timeline" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.mapButton, drawingMode === 'polygon' && styles.activeButton]}
                onPress={() => toggleDrawingMode('polygon')}
              >
                <Icon name="crop-square" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapButton} onPress={clearDrawings}>
                <Icon name="clear" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Speichern</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: Dimensions.get('window').width * 0.8,
    height: Dimensions.get('window').height * 0.8,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  mapButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'blue',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FeatureModal;
