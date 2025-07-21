import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Button, InputField } from '../components';
import { useAuth } from '../context';
import { RegisterRequest } from '../types';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterRequest>({
    phone: '',
    password: '',
    firstName: '',
    lastName: '',
    countryCode: 'US',
    preferredLanguage: 'en',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<RegisterRequest & { confirmPassword: string }>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest & { confirmPassword: string }> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[1-9]\d{6,15}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number (without country code)';
    }

    if (!formData.countryCode) {
      newErrors.countryCode = 'Country code is required';
    }

    if (!formData.preferredLanguage) {
      (newErrors as any).preferredLanguage = 'Language preference is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      // Get the country dial code
      const countries = [
        { code: 'US', dialCode: '+1' },
        { code: 'ET', dialCode: '+251' },
        { code: 'CA', dialCode: '+1' },
        { code: 'GB', dialCode: '+44' },
      ];
      const selectedCountry = countries.find(c => c.code === formData.countryCode);
      
      // Combine country code with phone number
      const fullPhoneNumber = selectedCountry ? `${selectedCountry.dialCode}${formData.phone}` : formData.phone;
      
      const registrationData = {
        ...formData,
        phone: fullPhoneNumber,
      };

      await register(registrationData);
      // Navigate to OTP verification
      navigation.navigate('OtpVerification', { phoneNumber: fullPhoneNumber });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Check if user already exists and offer to go to login
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        Alert.alert(
          'Account Already Exists',
          errorMessage,
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert(
          'Registration Failed',
          errorMessage
        );
      }
    }
  };

  const updateField = (field: keyof RegisterRequest | 'confirmPassword', value: string) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Tilanet today</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <InputField
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              error={errors.firstName}
              autoComplete="given-name"
              textContentType="givenName"
              placeholder="First name"
              style={styles.nameInput}
            />
            <InputField
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              error={errors.lastName}
              autoComplete="family-name"
              textContentType="familyName"
              placeholder="Last name"
              style={styles.nameInput}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Country Code</Text>
            <View style={styles.countryPickerContainer}>
              {[
                { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
                { code: 'ET', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹' },
                { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
                { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
              ].map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={[
                    styles.countryOption,
                    formData.countryCode === country.code && styles.selectedCountry,
                  ]}
                  onPress={() => updateField('countryCode', country.code)}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                  <Text style={styles.countryDialCode}>{country.dialCode}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.countryCode && (
              <Text style={styles.errorText}>{errors.countryCode}</Text>
            )}
          </View>

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            error={errors.phone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            placeholder="Enter your local phone number"
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.languagePickerContainer}>
              {[
                { code: 'en', name: 'English', nativeName: 'English' },
                { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
              ].map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[
                    styles.languageOption,
                    formData.preferredLanguage === language.code && styles.selectedLanguage,
                  ]}
                  onPress={() => updateField('preferredLanguage', language.code)}
                >
                  <Text style={styles.languageName}>{language.nativeName}</Text>
                  <Text style={styles.languageNameSecondary}>{language.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.preferredLanguage && (
              <Text style={styles.errorText}>{errors.preferredLanguage}</Text>
            )}
          </View>

          <InputField
            label="Password"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            isPassword
            autoComplete="password-new"
            textContentType="newPassword"
            placeholder="Create a password"
          />

          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            isPassword
            autoComplete="password-new"
            textContentType="newPassword"
            placeholder="Confirm your password"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            style={styles.registerButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Button
              title="Sign In"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.signInButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInput: {
    flex: 1,
  },
  registerButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 16,
  },
  signInButton: {
    width: '100%',
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
  countryPickerContainer: {
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
    flex: 1,
  },
  countryDialCode: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  languagePickerContainer: {
    gap: 8,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
  },
  selectedLanguage: {
    borderColor: '#3498db',
    backgroundColor: '#ebf3fd',
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  languageNameSecondary: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
});
