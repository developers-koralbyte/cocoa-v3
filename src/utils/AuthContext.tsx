// AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Extend the Firebase User type to include custom fields
export interface ExtendedUser extends User {
  role?: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isLoading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthContext] onAuthStateChanged fired:", firebaseUser);
      if (firebaseUser) {
        // Instead of a one-time getDoc, subscribe to the user's document for real-time updates.
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const userData = docSnap.data();
              console.log("[AuthContext] Fetched user doc via onSnapshot:", userData);
              const mergedUser: ExtendedUser = { ...firebaseUser, ...userData };
              console.log("[AuthContext] Merged user object:", mergedUser);
              setUser(mergedUser);
            } else {
              console.warn("[AuthContext] No user doc found for uid:", firebaseUser.uid);
              setUser(firebaseUser);
            }
            setIsLoading(false);
          },
          (error) => {
            console.error("[AuthContext] Error in onSnapshot:", error);
            setUser(firebaseUser);
            setIsLoading(false);
          }
        );
        return () => unsubscribeDoc();
      } else {
        console.log("[AuthContext] No user is signed in.");
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
