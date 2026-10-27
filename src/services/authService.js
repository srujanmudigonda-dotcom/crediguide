import api from "./api";

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Store Session
|--------------------------------------------------------------------------
|
| Persists the JWT and user returned by a successful login
| (password login or the legacy OTP login, whichever issued it).
|
*/

const storeSession = (data) => {
  if (data?.success && data?.token) {
    localStorage.setItem(
      "creditGuideToken",
      data.token
    );

    localStorage.setItem(
      "creditGuideUser",
      JSON.stringify(data.user)
    );

    localStorage.setItem(
      "creditGuideLoggedIn",
      "true"
    );
  }
};

/*
|--------------------------------------------------------------------------
| Register
|--------------------------------------------------------------------------
*/

const register = async (userData) => {
  const response = await api.post(
    "/auth/register",
    userData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Verify Registration OTP
|--------------------------------------------------------------------------
*/

const verifyOTP = async (email, otp) => {
  const response = await api.post(
    "/auth/verify-otp",
    {
      email,
      otp,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Resend Registration OTP
|--------------------------------------------------------------------------
*/

const resendOTP = async (email) => {
  const response = await api.post(
    "/auth/resend-otp",
    {
      email,
    }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Login - Step 1
|--------------------------------------------------------------------------
|
| Checks email + password and generates a login OTP.
|
*/

const login = async (credentials) => {
  const response = await api.post(
    "/auth/login",
    credentials
  );

  // Password login now returns the JWT directly.
  storeSession(response.data);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Login - Step 2
|--------------------------------------------------------------------------
|
| Verifies the login OTP and stores the JWT.
|
*/

const verifyLoginOTP = async (email, otp) => {
  const response = await api.post(
    "/auth/verify-login-otp",
    {
      email,
      otp,
    }
  );

  storeSession(response.data);

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Get Profile
|--------------------------------------------------------------------------
*/

const getProfile = async () => {
  const response = await api.get(
    "/auth/profile"
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Update Profile
|--------------------------------------------------------------------------
*/

const updateProfile = async (profileData) => {
  const response = await api.put(
    "/auth/profile",
    profileData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

const logout = () => {
  localStorage.removeItem(
    "creditGuideToken"
  );

  localStorage.removeItem(
    "creditGuideUser"
  );

  localStorage.removeItem(
    "creditGuideLoggedIn"
  );
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Forgot Password - Request OTP
|--------------------------------------------------------------------------
|
| Accepts the account email or mobile number; the backend sends
| the reset OTP to the registered mobile number by SMS.
|
*/

const forgotPassword = async (identifier) => {
  const response = await api.post(
    "/auth/forgot-password",
    { identifier }
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Reset Password - Verify OTP and Set New Password
|--------------------------------------------------------------------------
*/

const resetPassword = async (resetData) => {
  const response = await api.post(
    "/auth/reset-password",
    resetData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

const authService = {
  register,
  verifyOTP,
  resendOTP,
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  logout,
};

export default authService;