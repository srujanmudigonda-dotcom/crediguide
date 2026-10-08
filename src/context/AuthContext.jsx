import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabaseClient";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Load the profile for the signed-in user
  |--------------------------------------------------------------------------
  */

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();

      if (response?.success && response?.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return response.user;
      }
    } catch (error) {
      console.error("Profile load failed:", error);
    }

    setUser(null);
    setIsAuthenticated(false);
    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | Session bootstrap + live session changes (Supabase Auth)
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      const session = await authService.getSession();

      if (!isMounted) return;

      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login — email + password
  |--------------------------------------------------------------------------
  */

  const login = async (credentials) => {
    const response = await authService.login(credentials);

    if (response?.success) {
      await loadProfile();
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | Registration — name + email + password
  |--------------------------------------------------------------------------
  */

  const register = async (userData) => {
    const response = await authService.register(userData);

    // If email confirmation is disabled, sign-up returns a live
    // session and the new user is signed in immediately.
    if (response?.session) {
      await loadProfile();
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = async () => {
    await authService.logout();

    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,

    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
