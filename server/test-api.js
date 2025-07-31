const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data
const testUser = {
  name: 'John Doe',
  serviceType: 'consultation'
};

const testUser2 = {
  name: 'Jane Smith',
  serviceType: 'payment'
};

async function testAPI() {
  console.log('🚀 Testing Queue Management System API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);

    // Test 2: Add first user to queue
    console.log('\n2. Adding first user to queue...');
    const addUser1Response = await axios.post(`${BASE_URL}/api/queue`, testUser);
    const user1Id = addUser1Response.data.data._id;
    console.log('✅ User added:', addUser1Response.data.data.name);

    // Test 3: Add second user to queue
    console.log('\n3. Adding second user to queue...');
    const addUser2Response = await axios.post(`${BASE_URL}/api/queue`, testUser2);
    const user2Id = addUser2Response.data.data._id;
    console.log('✅ User added:', addUser2Response.data.data.name);

    // Test 4: Get all users in queue
    console.log('\n4. Getting all users in queue...');
    const getQueueResponse = await axios.get(`${BASE_URL}/api/queue`);
    console.log('✅ Queue retrieved:', getQueueResponse.data.count, 'users');
    console.log('   Users:', getQueueResponse.data.data.map(u => u.name));

    // Test 5: Get queue statistics
    console.log('\n5. Getting queue statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/api/queue/stats`);
    console.log('✅ Statistics retrieved:');
    console.log('   Total users:', statsResponse.data.data.totalUsers);
    console.log('   Service types:', statsResponse.data.data.serviceTypeStats);

    // Test 6: Predict wait time
    console.log('\n6. Predicting wait time...');
    const predictResponse = await axios.post(`${BASE_URL}/api/predict`, {
      serviceType: 'consultation'
    });
    console.log('✅ Wait time predicted:', predictResponse.data.data.predictedWaitTimeFormatted);

    // Test 7: Get prediction algorithm info
    console.log('\n7. Getting prediction algorithm info...');
    const predictInfoResponse = await axios.get(`${BASE_URL}/api/predict/info`);
    console.log('✅ Algorithm info retrieved:', predictInfoResponse.data.data.algorithm);

    // Test 8: Remove first user from queue
    console.log('\n8. Removing first user from queue...');
    const removeResponse = await axios.delete(`${BASE_URL}/api/queue/${user1Id}`);
    console.log('✅ User removed:', removeResponse.data.message);

    // Test 9: Verify queue after removal
    console.log('\n9. Verifying queue after removal...');
    const finalQueueResponse = await axios.get(`${BASE_URL}/api/queue`);
    console.log('✅ Final queue count:', finalQueueResponse.data.count, 'users');

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📋 API Summary:');
    console.log('- Health check: ✅');
    console.log('- Add user: ✅');
    console.log('- Get queue: ✅');
    console.log('- Get stats: ✅');
    console.log('- Predict wait time: ✅');
    console.log('- Remove user: ✅');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('1. MongoDB is running');
    console.log('2. Server is started (npm run dev)');
    console.log('3. Environment variables are set correctly');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 