// components/LagerbereichModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LagerbereichModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

const LagerbereichModal: React.FC<LagerbereichModalProps> = ({ isVisible, onClose, onSave }) => {
  const [lagerplatzname, setLagerplatzname] = useState('');
  const [mengeFm, setMengeFm] = useState('');
  const [mengeStuck, setMengeStuck] = useState('');
  const [bemerkung, setBemerkung] = useState('');
  const [status, setStatus] = useState('');

  const handleSave = () => {
    const data = {
      lagerplatzname,
      mengeFm,
      mengeStuck,
      bemerkung,
      status,
    };
    onSave(data);
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
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
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>SCHLIESSEN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>SPEICHERN</Text>
          </TouchableOpacity>
        </View>
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
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
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

export default LagerbereichModal;
