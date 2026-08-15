'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('Rourkela, Odisha');
  
  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);
  const [selectedWindowForBooking, setSelectedWindowForBooking] = useState(null);

  useEffect(() => {
    // Check if user is logged in & restore session immediately from localStorage
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('mediarca_token');
        const savedUserStr = localStorage.getItem('mediarca_user');

        if (savedUserStr) {
          try {
            const parsedUser = JSON.parse(savedUserStr);
            setUser(parsedUser);
          } catch (e) {}
        }

        if (token) {
          const res = await api.getMe();
          if (res?.success && res.data) {
            setUser(res.data);
            localStorage.setItem('mediarca_user', JSON.stringify(res.data));
          }
        }
      } catch (err) {
        console.warn('Silent auth refresh sync:', err?.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loginUser = (userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem('mediarca_token', token);
    }
    if (userData) {
      localStorage.setItem('mediarca_user', JSON.stringify(userData));
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('mediarca_token');
    localStorage.removeItem('mediarca_user');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const startBooking = (doctor, window = null) => {
    if (!user) {
      setSelectedDoctorForBooking(doctor);
      setSelectedWindowForBooking(window);
      openAuthModal('login');
      return;
    }
    setSelectedDoctorForBooking(doctor);
    setSelectedWindowForBooking(window);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedDoctorForBooking(null);
    setSelectedWindowForBooking(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        selectedLocation,
        setSelectedLocation,
        loginUser,
        logoutUser,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        closeAuthModal,
        isBookingModalOpen,
        selectedDoctorForBooking,
        selectedWindowForBooking,
        startBooking,
        closeBookingModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
