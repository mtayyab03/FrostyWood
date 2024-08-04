// components/AuftragsdatenDetails.tsx
import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AuftragsdatenDetails: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Auftragsnummer</Text>
        <TextInput style={styles.input} value="12345" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Maßnahme</Text>
        <TextInput style={styles.input} value="Sample Maßnahme" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Status</Text>
        <TextInput style={styles.input} value="Aktiv" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Auftraggeber</Text>
        <Picker selectedValue="FF Holztransporte" style={styles.input} enabled={false}>
          <Picker.Item label="FF Holztransporte" value="FF Holztransporte" />
          <Picker.Item label="DEMO Firma Holzernte" value="DEMO Firma Holzernte" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Forstamt</Text>
        <Picker selectedValue="01 Werk Musterhausen" style={styles.input} enabled={false}>
          <Picker.Item label="01 Werk Musterhausen" value="01 Werk Musterhausen" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Revier, Waldfläche</Text>
        <TextInput style={styles.input} value="Sample Revier" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Waldort</Text>
        <TextInput style={styles.input} value="Sample Waldort" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Auftragnehmer</Text>
        <Picker selectedValue="DEMO Firma Auftragnehmer" style={styles.input} enabled={false}>
          <Picker.Item label="DEMO Firma Auftragnehmer" value="DEMO Firma Auftragnehmer" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subunternehmer</Text>
        <Picker selectedValue="DEMO Firma Subunternehmer" style={styles.input} enabled={false}>
          <Picker.Item label="DEMO Firma Subunternehmer" value="DEMO Firma Subunternehmer" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ansprechpartner</Text>
        <TextInput style={styles.input} value="Sample Ansprechpartner" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ext. Vertrags-Nr.</Text>
        <TextInput style={styles.input} value="123-456" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>ext. Auftrags-Nr.</Text>
        <TextInput style={styles.input} value="654-321" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Arbeitsgerät</Text>
        <Picker selectedValue="DEMO Arbeitsgerät" style={styles.input} enabled={false}>
          <Picker.Item label="DEMO Arbeitsgerät" value="DEMO Arbeitsgerät" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Beschreibung Waldort</Text>
        <TextInput style={styles.input} value="Sample Beschreibung" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Zeitplan | Darstellung in der Auftragsliste</Text>
        <Picker selectedValue="DEMO Zeitplan" style={styles.input} enabled={false}>
          <Picker.Item label="DEMO Zeitplan" value="DEMO Zeitplan" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Fläche [ha]</Text>
        <TextInput style={styles.input} value="50" editable={false} />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Einheit</Text>
        <Picker selectedValue="DEMO Einheit" style={styles.input} enabled={false}>
          <Picker.Item label="DEMO Einheit" value="DEMO Einheit" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teilen mit WEB-Portal</Text>
        <Picker selectedValue="demo-0001" style={styles.input} enabled={false}>
          <Picker.Item label="demo-0001" value="demo-0001" />
        </Picker>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teilen mit APP-Zugang</Text>
        <TextInput style={styles.input} value="app-123" editable={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
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
});

export default AuftragsdatenDetails;
