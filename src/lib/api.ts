import axios from "axios";

// Auto-detect backend URL based on current hostname
const getBackendURL = () => {
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Otherwise, try to auto-detect based on current hostname
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  // If accessing via IP address or network hostname, use same IP for backend
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${protocol}//${hostname}:3000/api/v1`;
  }
  
  // Default to localhost
  return "http://localhost:3000/api/v1";
};

export const API_BASE_URL = getBackendURL();
// API origin (used for static asset URLs returned by the backend, e.g. /img/...)
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/users/login", { email, password });
    return response.data;
  },
  signup: async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.post("/users/signup", {
      name,
      email,
      password,
      passwordConfirm,
    });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.get(`/users/verifyEmail/${token}`);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

// Experiences API
export const experiencesAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString() ? `/experiences?${params.toString()}` : "/experiences";
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/experiences/${id}`);
    return response.data;
  },
  create: async (experienceData: any) => {
    const response = await api.post("/experiences", experienceData);
    return response.data;
  },
  update: async (id: string, experienceData: any) => {
    const response = await api.patch(`/experiences/${id}`, experienceData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/experiences/${id}`);
    return response.data;
  },
  getTopCheap: async () => {
    const response = await api.get("/experiences/top-5-cheap");
    return response.data;
  },
  getExperienceStats: async () => {
    const response = await api.get("/experiences/experience-stats");
    return response.data;
  },
  getExperiencesWithin: async (
    distance: number,
    latlng: string,
    unit: string = "mi"
  ) => {
    const response = await api.get(
      `/experiences/experiences-within/${distance}/center/${latlng}/unit/${unit}`
    );
    return response.data;
  },
  getDistances: async (latlng: string, unit: string = "mi") => {
    const response = await api.get(`/experiences/distances/${latlng}/unit/${unit}`);
    return response.data;
  },
};

// Users API
// Host Application API
export const hostApplicationAPI = {
  createOrUpdate: async (personalInfo: any) => {
    const response = await api.post("/host-applications", { personalInfo });
    return response.data;
  },
  updateExperienceDetails: async (experienceDetails: any) => {
    const response = await api.patch("/host-applications/experience-details", { experienceDetails });
    return response.data;
  },
  updateMedia: async (media: any) => {
    const response = await api.patch("/host-applications/media", { media });
    return response.data;
  },
  uploadMedia: async (formData: FormData) => {
    const response = await api.post("/host-applications/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  submitApplication: async () => {
    const response = await api.post("/host-applications/submit");
    return response.data;
  },
  reapplyApplication: async () => {
    const response = await api.post("/host-applications/reapply");
    return response.data;
  },
  getMyApplication: async () => {
    const response = await api.get("/host-applications/my-application");
    return response.data;
  },
  // Admin only
  getPendingApplications: async () => {
    const response = await api.get("/host-applications/pending");
    return response.data;
  },
  approveApplication: async (id: string) => {
    const response = await api.patch(`/host-applications/${id}/approve`);
    return response.data;
  },
  rejectApplication: async (id: string, rejectionReason?: string) => {
    const response = await api.patch(`/host-applications/${id}/reject`, { rejectionReason });
    return response.data;
  },
};

export const usersAPI = {
  getAll: async (filters?: { role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role) {
      params.append("role", filters.role);
    }
    const url = params.toString() ? `/users?${params.toString()}` : "/users";
    const response = await api.get(url);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateMe: async (userData: { name?: string; email?: string }) => {
    const response = await api.patch("/users/updateMe", userData);
    return response.data;
  },
  deleteMe: async () => {
    const response = await api.delete("/users/deleteMe");
    return response.data;
  },
  updateMyPassword: async (
    passwordCurrent: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch("/users/updateMyPassword", {
      passwordCurrent,
      password,
      passwordConfirm,
    });
    return response.data;
  },
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role?: string;
  }) => {
    const response = await api.post("/users", userData);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post("/users/forgotPassword", { email });
    return response.data;
  },
  resetPassword: async (
    token: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch(`/users/resetPassword/${token}`, {
      password,
      passwordConfirm,
    });
    return response.data;
  },
  applyForHost: async () => {
    const response = await api.post("/users/applyForHost");
    return response.data;
  },
  getPendingHostApplications: async () => {
    const response = await api.get("/users/pending-hosts");
    return response.data;
  },
  approveHost: async (id: string) => {
    const response = await api.patch(`/users/approve-host/${id}`);
    return response.data;
  },
  rejectHost: async (id: string) => {
    const response = await api.patch(`/users/reject-host/${id}`);
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/reviews?${params.toString()}`
      : "/reviews";
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  create: async (reviewData: {
    review: string;
    rating: number;
    experience: string;
  }) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },
  update: async (
    id: string,
    reviewData: { review?: string; rating?: number }
  ) => {
    const response = await api.patch(`/reviews/${id}`, reviewData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getReviewsForExperience: async (
    experienceId: string,
    paramsObj?: Record<string, any>
  ) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "")
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/experiences/${experienceId}/reviews?${params.toString()}`
      : `/experiences/${experienceId}/reviews`;
    const response = await api.get(url);
    return response.data;
  },
  createReviewForExperience: async (
    experienceId: string,
    reviewData: { review: string; rating: number }
  ) => {
    const response = await api.post(`/experiences/${experienceId}/reviews`, reviewData);
    return response.data;
  },
};

// Tours API (deprecated, use experiencesAPI)
export const toursAPI = experiencesAPI;

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    // Placeholder - would need backend booking endpoints
    throw new Error("Booking functionality not yet implemented in backend");
  },
  getById: async (id: string) => {
    // Placeholder - would need backend booking endpoints
    throw new Error("Booking functionality not yet implemented in backend");
  },
  create: async (experienceId: string) => {
    // Calls backend to create a checkout session (Chapa)
    // backend route: GET /api/v1/bookings/checkout-session/:experienceId
    const response = await api.get(`/bookings/checkout-session/${experienceId}`);
    return response.data;
  },
  verify: async (txRef: string) => {
    const response = await api.get(`/bookings/verify/${txRef}`);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get("/bookings/me");
    return response.data;
  },
  getHostBookings: async () => {
    const response = await api.get("/bookings/host/bookings");
    return response.data;
  },
};

// Hosts API
export const hostsAPI = {
  getAll: async () => {
    const response = await api.get("/hosts");
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/hosts/${id}`);
    return response.data;
  },
};

export default api;
