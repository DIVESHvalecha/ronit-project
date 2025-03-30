import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
}

export const authService = {
  login: async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", { email, password });
      const response = await api.post('/login/', {
        email,
        password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log("Login successful");
      return response.data;
    } catch (error: any) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  signup: async (data: SignupData) => {
    try {
      console.log("Attempting signup with data:", data);
      const response = await api.post('/users/register/', data);
      console.log("Signup response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Signup error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("Attempting logout");
      await api.post('/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      console.log("Logout successful");
    } catch (error: any) {
      console.error("Logout error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      // Even if the server request fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw error;
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
}; 