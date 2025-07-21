import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Language } from '../types/auth';

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
  {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
  },
];

interface LanguageScreenProps {
  navigation: any;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const handleLanguageSelect = (language: Language) => {
    // Store language preference
    // TODO: Implement language storage
    navigation.navigate('Auth', { selectedLanguage: language.code });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Tilanet</Text>
          <Text style={styles.subtitle}>Select your language</Text>
          <Text style={styles.subtitleAmharic}>ቋንቋዎን ይምረጡ</Text>
        </View>

        <View style={styles.languageContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.code}
              style={styles.languageButton}
              onPress={() => handleLanguageSelect(language)}
              activeOpacity={0.7}
            >
              <Text style={styles.languageName}>{language.nativeName}</Text>
              <Text style={styles.languageNameSecondary}>{language.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Empowering Idir communities with digital tools
          </Text>
          <Text style={styles.footerTextAmharic}>
            የኢድር ማህበረሰቦችን በዲጂታል መሳሪያዎች እንዲያበረታቱ
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleAmharic: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  languageContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  languageButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  languageNameSecondary: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerTextAmharic: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'center',
  },
}); 