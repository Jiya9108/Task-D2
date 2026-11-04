
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

import { onIdTokenChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [plan, setPlan] = useState("Free");
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async (currentUser = auth.currentUser) => {
    if (!currentUser) {
      setProfile(null);
      setPlan("Free");
      return null;
    }

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: currentUser.displayName || ""
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load user profile.");
      }

      const userProfile = data.user || data.profile || data;

      const membership = (
        userProfile.plan ||
        userProfile.subscriptionPlan ||
        "Free"
      ).toLowerCase();

      const normalizedPlan =
        membership === "paid" ? "Paid" : "Free";

      setProfile(userProfile);
      setPlan(normalizedPlan);

      return userProfile;
    } catch (error) {
      console.error("Profile loading error:", error);
      throw error;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);

      if (currentUser) {
        try {
          await refreshProfile(currentUser);
        } catch (error) {
          console.error(error);
          setProfile(null);
          setPlan("Free");
        }
      } else {
        setProfile(null);
        setPlan("Free");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [refreshProfile]);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setPlan("Free");
  };

  const value = {
    user,
    profile,
    plan,
    loading,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
