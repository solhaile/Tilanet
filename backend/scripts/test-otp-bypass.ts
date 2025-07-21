import { AuthService } from '../src/services/authService';

async function testOtpBypass() {
  try {
    console.log('🧪 Testing OTP Bypass in Development Mode\n');
    
    // Test data
    const testUser = {
      phone: '+12345678901', // Valid US phone number format
      password: 'testpass123',
      firstName: 'Test',
      lastName: 'User',
      countryCode: 'US',
      preferredLanguage: 'en' as const,
    };

    console.log('📝 Creating test user...');
    const user = await AuthService.createUser(testUser);
    
    console.log('✅ User created successfully!');
    console.log(`📱 Phone: ${user.phoneNumber}`);
    console.log(`👤 Name: ${user.firstName} ${user.lastName}`);
    console.log(`✅ Verified: ${user.isVerified}`);
    
    if (user.isVerified) {
      console.log('\n🎉 OTP bypass is working! User is automatically verified.');
    } else {
      console.log('\n❌ OTP bypass is NOT working. User is not verified.');
    }

    console.log('\n🔐 Testing signin...');
    const signinResult = await AuthService.signin({
      phone: testUser.phone,
      password: testUser.password,
    });
    
    console.log('✅ Signin successful!');
    console.log(`🔑 Access Token: ${signinResult.accessToken.substring(0, 20)}...`);
    console.log(`🔄 Refresh Token: ${signinResult.refreshToken.substring(0, 20)}...`);
    
    console.log('\n🎯 OTP bypass test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Check if OTP verification is disabled
if (process.env.SKIP_OTP_VERIFICATION === 'true') {
  console.log('✅ SKIP_OTP_VERIFICATION=true - Running OTP bypass test');
  testOtpBypass();
} else {
  console.log('❌ This test requires SKIP_OTP_VERIFICATION=true');
  console.log('💡 Set SKIP_OTP_VERIFICATION=true to run this test.');
  process.exit(1);
} 