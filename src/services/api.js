import axios from 'axios';

const API_URL = 'https://jsonplaceholder.typicode.com';

export const fetchData = async () => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error for handling later
  }
};