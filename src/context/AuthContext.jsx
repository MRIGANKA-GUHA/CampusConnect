import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signInWithCustomToken,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../firebase";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Core logout: inform backend, then clean up locally ─────────────────────
  const performLogout = async () => {
    try {
      // Tell backend to delete the Firestore session record
      await api.post("/auth/logout");
    } catch (_) {
      // Ignore — session may already be gone (expired on the server)
    }
    await firebaseSignOut(auth);
    localStorage.removeItem("token");
    setUser(null);
  };

  // ── Check for existing session on mount ────────────────────────────────────
  // The backend's verifyToken middleware is the single source of truth.
  // If the session is expired, /auth/profile returns 401 and we log out.
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await api.get("/auth/profile");
          setUser(response.data);
        } catch (error) {
          // 401 = session expired or invalid → clean up
          await firebaseSignOut(auth);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // ── Login with email/password via backend ──────────────────────────────────
  const loginWithEmail = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;

    await signInWithCustomToken(auth, token);
    const idToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", idToken);

    setUser(userData);
    return response.data;
  };

  // ── Register with email/password ──────────────────────────────────────────
  const registerWithEmail = async (email, password, displayName, rollNo, role) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      displayName,
      rollNo,
      role,
    });
    return response.data;
  };

  // ── Verify OTP and complete registration ──────────────────────────────────
  const verifyOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    const { token, user: userData } = response.data;

    await signInWithCustomToken(auth, token);
    const idToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", idToken);

    setUser(userData);
    return response.data;
  };

  // ── Login with Google ──────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    const response = await api.post("/auth/oauth", { idToken });
    const { token, user: userData } = response.data;

    await signInWithCustomToken(auth, token);
    const newIdToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", newIdToken);

    setUser(userData);
    return response.data;
  };

  // ── Login with GitHub ──────────────────────────────────────────────────────
  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();

    const response = await api.post("/auth/oauth", { idToken });
    const { token, user: userData } = response.data;

    await signInWithCustomToken(auth, token);
    const newIdToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", newIdToken);

    setUser(userData);
    return response.data;
  };

  // ── Manual Logout ──────────────────────────────────────────────────────────
  const logout = async () => {
    await performLogout();
  };

  // ── Update User State (for profile updates) ──────────────────────────
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, verifyOtp, loginWithGoogle, loginWithGithub, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
