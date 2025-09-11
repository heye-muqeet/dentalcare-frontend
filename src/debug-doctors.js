// This file is for debugging purposes to manually test the API endpoints
import axios from 'axios';

async function testDoctorsEndpoint() {
  try {
    console.log('Testing doctors endpoint...');
    const response = await axios.get('http://localhost:3000/api/users/doctors', {
      withCredentials: true
    });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
}

// Export for use in browser console
window.testDoctorsEndpoint = testDoctorsEndpoint;
