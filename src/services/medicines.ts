import api from './api';

export interface Medicine {
  id: number;
  name: string;
  description: string;
  price: number;
  manufacturer: string;
  image: string;
  stock: number;
  prescription_required: boolean;
}

export interface CartItem {
  medicine: number;
  quantity: number;
}

export const medicineService = {
  getAll: async () => {
    const response = await api.get('/medicines/');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/medicines/${id}/`);
    return response.data;
  },

  addToCart: async (medicineId: number, quantity: number) => {
    const response = await api.post('/cart/add_item/', {
      medicine_id: medicineId,
      quantity
    });
    return response.data;
  },

  removeFromCart: async (medicineId: number) => {
    const response = await api.post('/cart/remove_item/', {
      medicine_id: medicineId
    });
    return response.data;
  },

  getCart: async () => {
    const response = await api.get('/cart/');
    return response.data;
  },

  placeOrder: async (shippingAddress: string) => {
    const response = await api.post('/orders/', {
      shipping_address: shippingAddress
    });
    return response.data;
  }
}; 