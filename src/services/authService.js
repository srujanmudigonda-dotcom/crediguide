import api from "./api";

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

  if (
    response.data?.success &&
    response.data?.token
  ) {
    localStorage.setItem(
      "creditGuideToken",
      response.data.token
    );

    localStorage.setItem(
      "creditGuideUser",
      JSON.stringify(response.data.user)
    );

    localStorage.setItem(
      "creditGuideLoggedIn",
      "true"
    );
  }

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

const authService = {
  register,
  verifyOTP,
  resendOTP,
  login,
  verifyLoginOTP,
  getProfile,
  updateProfile,
  logout,
};

export default authService;