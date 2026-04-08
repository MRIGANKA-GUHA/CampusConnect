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

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Verify token with backend
          const response = await api.get("/auth/profile");
          setUser(response.data);
        } catch (error) {
          console.error("Session validation failed:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Login with email/password via backend
  const loginWithEmail = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user: userData } = response.data;
    
    // Sign in to Firebase with custom token
    await signInWithCustomToken(auth, token);
    
    // Get ID token for API calls
    const currentUser = auth.currentUser;
    const idToken = await currentUser.getIdToken();
    localStorage.setItem("token", idToken);
    
    setUser(userData);
    return response.data;
  };

  // Register with email/password (still uses backend)
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

  // Verify OTP and complete registration
  const verifyOtp = async (email, otp) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    const { token, user: userData } = response.data;

    // Sign in with custom token
    await signInWithCustomToken(auth, token);
    const idToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", idToken);

    setUser(userData);
    return response.data;
  };

  // Login with Google via Firebase popup, then send token to backend
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Send ID token to backend for verification
    const response = await api.post("/auth/oauth", { idToken });
    const { token, user: userData } = response.data;
    
    // Sign in with custom token from backend
    await signInWithCustomToken(auth, token);
    const newIdToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", newIdToken);
    
    setUser(userData);
    return response.data;
  };

  // Login with GitHub via Firebase popup, then send token to backend
  const loginWithGithub = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();
    
    // Send ID token to backend for verification
    const response = await api.post("/auth/oauth", { idToken });
    const { token, user: userData } = response.data;
    
    // Sign in with custom token from backend
    await signInWithCustomToken(auth, token);
    const newIdToken = await auth.currentUser.getIdToken();
    localStorage.setItem("token", newIdToken);
    
    setUser(userData);
    return response.data;
  };

  // Logout
  const logout = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, registerWithEmail, verifyOtp, loginWithGoogle, loginWithGithub, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
