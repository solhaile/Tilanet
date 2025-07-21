import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput } from 'react-native';
import { Button } from '../components';
import { OtpVerificationRequest } from '../types/auth';

interface OtpVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      phoneNumber: string;
    };
  };
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { phoneNumber } = route.params;
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<TextInput[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtpCode = [...otpCode];
    newOtpCode[index] = text;
    setOtpCode(newOtpCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const otpRequest: OtpVerificationRequest = {
        phoneNumber,
        otpCode: code,
      };

      // TODO: Call API to verify OTP
      // const response = await authService.verifyOtp(otpRequest);
      
      // For now, simulate success
      setTimeout(() => {
        setIsLoading(false);
        navigation.navigate('IdirSetup');
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      Alert.alert(
        'Verification Failed',
        error instanceof Error ? error.message : 'Invalid OTP code'
      );
    }
  };

  const handleResendOtp = async () => {
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown

    try {
      // TODO: Call API to resend OTP
      // await authService.resendOtp({ phoneNumber });
      Alert.alert('OTP Sent', 'A new verification code has been sent to your phone');
    } catch (error) {
      Alert.alert(
        'Resend Failed',
        error instanceof Error ? error.message : 'Failed to resend OTP'
      );
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Mask the middle digits for privacy
    if (phone.length > 7) {
      return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Verify Your Phone</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter OTP Code</Text>
            <View style={styles.otpInputContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                  selectionColor="#3498db"
                />
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Verify OTP"
              onPress={handleVerifyOtp}
              loading={isLoading}
              disabled={otpCode.join('').length !== 6}
            />
          </View>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resendDisabled}
              style={styles.resendButton}
            >
              <Text
                style={[
                  styles.resendButtonText,
                  resendDisabled && styles.resendButtonTextDisabled,
                ]}
              >
                {resendDisabled
                  ? `Resend in ${countdown}s`
                  : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
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
  otpContainer: {
    marginBottom: 40,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#bdc3c7',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
}); 