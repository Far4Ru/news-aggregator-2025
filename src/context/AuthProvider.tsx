import CryptoJS from 'crypto-js';
import { useState, useEffect } from 'react';

import { supabase } from '../services/supabase';
import { userService } from '../services/userService';
import type { User } from '../types';

import { AuthContext } from './AuthContext';

function isValidMd5Token(token: string): boolean {
  return /^[a-f0-9]{32}$/i.test(token);
}

function checkAuthToken(token: string): boolean {
  return token === CryptoJS.MD5(import.meta.env.VITE_SUPABASE_MODERATOR_PASSWORD).toString();
}

function getTokenFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);

  return urlParams.get('token') || localStorage.getItem('auth_token');
}

async function getPublicIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();

    return data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);

    return null;
  }
}

;

/**
 * Авторизация модератора:
 * /?token=<MD5-hash>
 * - сохранение auth_token в local
 * - сохранение ip в state
 * Авторизация пользователя:
 * - сохранение ip в state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const children = props.children;
  const { checkIp, createNewUser, checkUserByIp, createNewIpByUser } = userService;

  const handleTokenAuth = async (token: string) => {
    if (isValidMd5Token(token) && checkAuthToken(token)) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: import.meta.env.VITE_SUPABASE_MODERATOR_EMAIL,
        password: import.meta.env.VITE_SUPABASE_MODERATOR_PASSWORD
      });
      const ip = await getPublicIP();
      const id = await getUserIdByIp(ip) ?? '';

      console.log(data, error, ip);
      if (data) {
        setUser({
          id,
          ip,
          email: data.user?.email,
          role: 'moderator'
        });

        localStorage.setItem('auth_token', token);

        // const url = new URL(window.location.href)
        // url.searchParams.delete('token')
        // window.history.replaceState({}, '', url.toString())
      }
    }
  };

  const getUserIdByIp = async (ip: string) => {
    const ipData = await checkIp(ip);

    if (ipData?.user_id) {
      return ipData.user_id;
    } else {
      const userData = await createNewUser();

      if (userData?.id) {
        const userId = await checkUserByIp(ip);

        if (userId) {
          return userId;
        }
        const userIpNewData = await createNewIpByUser(ip, userData.id);

        if (userIpNewData) {
          return userData.id;
        }
      }
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const urlToken = getTokenFromUrl();

      if (urlToken) {
        handleTokenAuth(urlToken);
      } else {
        const ip = await getPublicIP();
        const id = await getUserIdByIp(ip) ?? '';

        setUser({
          id,
          ip,
          role: 'guest'
        });
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    localStorage.removeItem('auth_token');
    const { error } = await supabase.auth.signOut();

    if (error) throw error;
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};
