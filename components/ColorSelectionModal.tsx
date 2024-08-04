// components/ColorSelectionModal.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';

interface ColorSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (color: string) => void;
  selectedColor: string;
}

const colors = ['blue', 'red', 'orange', 'purple', 'grey', 'green', 'yellow'];

const ColorSelectionModal: React.FC<ColorSelectionModalProps> = ({ isVisible, onClose, onSave, selectedColor }) => {
  const [color, setColor] = React.useState(selectedColor);

  const handleSave = () => {
    onSave(color);
    onClose();
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Stil - Kiefer, ISN 3m</Text>
        <View style={styles.colorsContainer}>
          {colors.map((col) => (
            <TouchableOpacity key={col} style={[styles.colorCircle, { backgroundColor: col }]} onPress={() => setColor(col)} />
          ))}
        </View>
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>ABBRECHEN</Text>
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
  colorsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default ColorSelectionModal;
