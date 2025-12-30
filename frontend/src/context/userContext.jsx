import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";

import { apiClient } from "../services/api";
import Cookies from 'js-cookie'
import { endpoints } from "../constant/ENDPOINTS";
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const storedToken = Cookies.get("authToken")
      const storedUser = Cookies.get("user")
      const storedRole = Cookies.get("userRole")

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setRole(storedRole);
          setIsAuthenticated(true);

          // Skip token validation for now to prevent logout on refresh
          // TODO: Implement proper token validation later
          console.log("Auth initialized from stored data:", userData);
        } catch (error) {
          console.warn("Failed to parse stored user data:", error);
          // Only clear auth if parsing fails, not on API errors
          setUser(null);
          setToken(null);
          setRole(null);
          setIsAuthenticated(false);
          Cookies.remove("authToken");
          Cookies.remove("user");
          Cookies.remove("userRole");

        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, userType = "user") => {
    setLoading(true);
    try {

      const response = await apiClient.post(endpoints.LOGIN, {
        email,
        password,
      });

      const data = response?.data;
      const authToken = data?.data?.access_token;


      if (!authToken) throw new Error("No access token received");

      // Save token
      setToken(authToken);
      Cookies.set("authToken", authToken);




      setIsAuthenticated(true);

      // Fetch user 'me' from API
      try {
        const meResp = await apiClient.get(endpoints.GET_USER);
        const userData = meResp.data;
        setUser(userData);
        setRole(userData.role || userType);
        Cookies.set("user", JSON.stringify(userData));
        Cookies.set("userRole", userData.role || userType);

      } catch (err) {
        console.warn("Failed to fetch /api/me/:", err);
      }

      message.success("Login successful!");
      return { success: true, data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Login failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Admin-specific login wrapper
  const adminLogin = async (email, password) => {

    const result = await login(email, password, "admin");
    if (!result.success) return result;

    // Wait a bit for the user state to be set
    await new Promise(resolve => setTimeout(resolve, 100));

    // verify role from current user state or cookies
    const currentUser = user || JSON.parse(Cookies.get("user") || "null");
    if (!currentUser || currentUser.role !== "admin") {
      await logout();
      return { success: false, error: "Access denied. Admin privileges required." };
    }

    return { success: true, data: currentUser };
  };

  // Logout function
  const logout = async () => {
    try {

    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear context
      setUser(null);
      setToken(null);
      setRole(null);
      setIsAuthenticated(false);

      Cookies.remove("authToken");
      Cookies.remove("user");
      Cookies.remove("userRole");


      message.success("Logged out successfully");
    }
  };

  // Register function
  const register = async (registerData) => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        endpoints.USER_REGISTER,
        registerData
      );

      message.success("Registration successful! Please login.");
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Registration failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updatedUserData) => {
    setLoading(true);
    try {
      const response = await apiClient.patch(endpoints.UPDATE_PROFILE, updatedUserData);
      const userData = response.data;
      setUser(userData);
      Cookies.set("user", JSON.stringify(userData));
      message.success("Profile updated successfully");
      return { success: true, data: response.data };
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || error.message || "Update failed";
      message.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Get current user info
  const getCurrentUser = async () => {
    if (!token) return false;

    try {
      const response = await apiClient.get(endpoints.GET_USER);
      const userData = response.data;
      setUser(userData);
      Cookies.set("user", JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error("Get user error:", error);
      await logout();
      return false;
    }
  };

  const value = {
    user,
    setUser,
    token,
    setToken,
    role,
    setRole,
    loading,
    isAuthenticated,
    login,
    adminLogin,
    logout,
    register,
    updateProfile,
    getCurrentUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
