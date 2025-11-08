import { API_BASE_URL } from './config';

export const authAPI = {
  login: async (email, password) => {
    console.log("Sending login request to backend...");
    console.log("Email:", email);
    
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log("Backend response:", data);
      
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }
};