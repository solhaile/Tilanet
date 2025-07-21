import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Button, InputField } from '../components';
import { Country } from '../types/auth';

interface IdirSetupScreenProps {
  navigation: any;
}

const countries: Country[] = [
  { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
];

const currencies = [
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'ETB' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

interface IdirSetupData {
  idirName: string;
  countryCode: string;
  primaryCurrency: string;
}

export const IdirSetupScreen: React.FC<IdirSetupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<IdirSetupData>({
    idirName: '',
    countryCode: '',
    primaryCurrency: '',
  });
  const [errors, setErrors] = useState<Partial<IdirSetupData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<IdirSetupData> = {};

    if (!formData.idirName.trim()) {
      newErrors.idirName = 'Idir name is required';
    } else if (formData.idirName.trim().length < 3) {
      newErrors.idirName = 'Idir name must be at least 3 characters';
    }

    if (!formData.countryCode) {
      newErrors.countryCode = 'Country of operation is required';
    }

    if (!formData.primaryCurrency) {
      newErrors.primaryCurrency = 'Primary currency is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSetup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // TODO: Call API to create Idir profile
      // const response = await idirService.createProfile(formData);
      
      // For now, simulate success
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('Dashboard');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Setup Failed',
        error instanceof Error ? error.message : 'Failed to create Idir profile'
      );
    }
  };

  const updateField = (field: keyof IdirSetupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getSelectedCountry = () => {
    return countries.find(country => country.code === formData.countryCode);
  };

  const getSelectedCurrency = () => {
    return currencies.find(currency => currency.code === formData.primaryCurrency);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Set Up Your Idir</Text>
            <Text style={styles.subtitle}>
              Create your Idir profile to get started
            </Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="Idir Name"
              value={formData.idirName}
              onChangeText={(text) => updateField('idirName', text)}
              error={errors.idirName}
              placeholder="Enter your Idir name"
              autoComplete="organization"
              textContentType="organizationName"
            />

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Country of Operation</Text>
              <View style={styles.pickerContainer}>
                {countries.map((country) => (
                  <View
                    key={country.code}
                    style={[
                      styles.countryOption,
                      formData.countryCode === country.code && styles.selectedCountry,
                    ]}
                  >
                    <Text style={styles.countryFlag}>{country.flag}</Text>
                    <Text style={styles.countryName}>{country.name}</Text>
                  </View>
                ))}
              </View>
              {errors.countryCode && (
                <Text style={styles.errorText}>{errors.countryCode}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Primary Currency</Text>
              <View style={styles.pickerContainer}>
                {currencies.map((currency) => (
                  <View
                    key={currency.code}
                    style={[
                      styles.currencyOption,
                      formData.primaryCurrency === currency.code && styles.selectedCurrency,
                    ]}
                  >
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                ))}
              </View>
              {errors.primaryCurrency && (
                <Text style={styles.errorText}>{errors.primaryCurrency}</Text>
              )}
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Important Note</Text>
              <Text style={styles.infoText}>
                The primary currency you select will be used for all financial operations in your Idir. 
                This setting cannot be changed later.
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Create Idir Profile"
              onPress={handleSetup}
              loading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  pickerContainer: {
    gap: 8,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedCountry: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  selectedCurrency: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginRight: 12,
    minWidth: 20,
  },
  currencyName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
}); 