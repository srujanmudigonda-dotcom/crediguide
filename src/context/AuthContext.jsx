import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser =
      localStorage.getItem("creditGuideUser");

    try {
      return storedUser
        ? JSON.parse(storedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to read stored user:",
        error
      );

      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem("creditGuideToken")
      );
    });

  const [loading, setLoading] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | Check Existing Authentication
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const token =
        localStorage.getItem(
          "creditGuideToken"
        );

      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        }

        return;
      }

      if (isMounted) {
        setIsAuthenticated(true);
      }

      try {
        const response =
          await authService.getProfile();

        if (!isMounted) {
          return;
        }

        if (
          response?.success &&
          response?.user
        ) {
          setUser(response.user);
          setIsAuthenticated(true);

          localStorage.setItem(
            "creditGuideUser",
            JSON.stringify(response.user)
          );

          localStorage.setItem(
            "creditGuideLoggedIn",
            "true"
          );
        } else {
          authService.logout();

          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Authentication check failed:",
          error
        );

        if (
          error.response?.status === 401
        ) {
          authService.logout();

          setUser(null);
          setIsAuthenticated(false);
        } else {
          /*
           * Keep the current authentication state if
           * the server is temporarily unavailable.
           */
          setIsAuthenticated(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Login - Step 1
  |--------------------------------------------------------------------------
  |
  | Sends email + password to backend.
  | Backend generates login OTP.
  |
  | IMPORTANT:
  | No JWT is stored here.
  |
  */

  const login = async (credentials) => {
    return await authService.login(
      credentials
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Login - Step 2
  |--------------------------------------------------------------------------
  |
  | Verifies login OTP.
  | Backend returns JWT after successful verification.
  |
  */

  const verifyLoginOTP = async (
    email,
    otp
  ) => {
    const response =
      await authService.verifyLoginOTP(
        email,
        otp
      );

    if (
      response?.success &&
      response?.token
    ) {
      setUser(response.user);
      setIsAuthenticated(true);

      localStorage.setItem(
        "creditGuideToken",
        response.token
      );

      localStorage.setItem(
        "creditGuideUser",
        JSON.stringify(
          response.user
        )
      );

      localStorage.setItem(
        "creditGuideLoggedIn",
        "true"
      );
    }

    return response;
  };

  /*
  |--------------------------------------------------------------------------
  | Registration
  |--------------------------------------------------------------------------
  */

  const register = async (userData) => {
    return await authService.register(
      userData
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Registration OTP Verification
  |--------------------------------------------------------------------------
  */

  const verifyOTP = async (
    email,
    otp
  ) => {
    return await authService.verifyOTP(
      email,
      otp
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Resend Registration OTP
  |--------------------------------------------------------------------------
  */

  const resendOTP = async (email) => {
    return await authService.resendOTP(
      email
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const logout = () => {
    authService.logout();

    setUser(null);
    setIsAuthenticated(false);
  };

  /*
  |--------------------------------------------------------------------------
  | Context Value
  |--------------------------------------------------------------------------
  */

  const value = {
    user,
    isAuthenticated,
    loading,

    login,
    verifyLoginOTP,

    register,
    verifyOTP,
    resendOTP,

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