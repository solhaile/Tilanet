import { CountryCode, LanguageOption } from '../types/auth';

export class LocaleService {
  static getSupportedCountries(): CountryCode[] {
    return [
      {
        code: 'ET',
        name: 'Ethiopia',
        dialCode: '+251',
        flag: '🇪🇹'
      },
      {
        code: 'US',
        name: 'United States',
        dialCode: '+1',
        flag: '🇺🇸'
      },
      {
        code: 'CA',
        name: 'Canada',
        dialCode: '+1',
        flag: '🇨🇦'
      },
      {
        code: 'GB',
        name: 'United Kingdom',
        dialCode: '+44',
        flag: '🇬🇧'
      },
      {
        code: 'DE',
        name: 'Germany',
        dialCode: '+49',
        flag: '🇩🇪'
      },
      {
        code: 'FR',
        name: 'France',
        dialCode: '+33',
        flag: '🇫🇷'
      },
      {
        code: 'AU',
        name: 'Australia',
        dialCode: '+61',
        flag: '🇦🇺'
      },
      {
        code: 'SE',
        name: 'Sweden',
        dialCode: '+46',
        flag: '🇸🇪'
      },
      {
        code: 'NO',
        name: 'Norway',
        dialCode: '+47',
        flag: '🇳🇴'
      },
      {
        code: 'DK',
        name: 'Denmark',
        dialCode: '+45',
        flag: '🇩🇰'
      }
    ];
  }

  static getSupportedLanguages(): LanguageOption[] {
    return [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flag: '🇺🇸'
      },
      {
        code: 'am',
        name: 'Amharic',
        nativeName: 'አማርኛ',
        flag: '🇪🇹'
      }
    ];
  }

  static validateCountryCode(countryCode: string): boolean {
    const supportedCountries = this.getSupportedCountries();
    return supportedCountries.some(country => country.code === countryCode);
  }

  static validateLanguage(language: string): boolean {
    const supportedLanguages = this.getSupportedLanguages();
    return supportedLanguages.some(lang => lang.code === language);
  }

  static getCountryByCode(countryCode: string): CountryCode | null {
    const supportedCountries = this.getSupportedCountries();
    return supportedCountries.find(country => country.code === countryCode) || null;
  }

  static getLanguageByCode(languageCode: string): LanguageOption | null {
    const supportedLanguages = this.getSupportedLanguages();
    return supportedLanguages.find(lang => lang.code === languageCode) || null;
  }

  static validatePhoneNumber(phone: string, countryCode: string): boolean {
    const country = this.getCountryByCode(countryCode);
    if (!country) return false;

    // Remove country code from phone number for validation
    const phoneWithoutCountryCode = phone.replace(country.dialCode, '');
    
    // Basic validation - adjust based on country-specific rules
    switch (countryCode) {
      case 'ET': // Ethiopia
        return /^[1-9]\d{8}$/.test(phoneWithoutCountryCode);
      case 'US': // United States
      case 'CA': // Canada
        return /^[2-9]\d{9}$/.test(phoneWithoutCountryCode);
      case 'GB': // United Kingdom
        return /^[1-9]\d{9,10}$/.test(phoneWithoutCountryCode);
      default:
        // Generic validation for other countries
        return /^[1-9]\d{6,15}$/.test(phoneWithoutCountryCode);
    }
  }
} 