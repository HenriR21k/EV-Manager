import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "../config/firebase";

interface UserContextProps {
  userId: string | null;
  setUserId: (uid: string | null) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Track auth initialization

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        setUserId(user.uid); // Update userId when authenticated
      } else {
        setUserId(null); // Reset userId if logged out
      }
      setLoading(false); // Auth state is initialized
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading screen until auth is initialized
  }

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
