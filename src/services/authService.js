import { supabase } from "../lib/supabaseClient";

/*
|--------------------------------------------------------------------------
| CrediGuide auth — Supabase Auth (email + password only, no OTP)
|--------------------------------------------------------------------------
| Registration creates the auth account; a database trigger
| (public.handle_new_user) creates the matching profile row and
| takes the full name from the sign-up metadata below.
*/

const register = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: { full_name: fullName.trim() },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    user: data.user,
    session: data.session,
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    user: data.user,
    session: data.session,
  };
};

const logout = async () => {
  await supabase.auth.signOut();
};

const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

const getProfile = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    success: true,
    user: {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      isEmailVerified: true,
      createdAt: data.created_at,
    },
  };
};

const authService = {
  register,
  login,
  logout,
  getSession,
  getProfile,
};

export default authService;
