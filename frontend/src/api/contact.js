export const API_BASE_URL = 'http://localhost:8000/api';

export const contactAPI = {
  submitContactForm: async (formData) => {
    console.log("Sending to backend:", formData);
    
    const response = await fetch(`${API_BASE_URL}/contact/`, {  
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    return response.json();
  }
};