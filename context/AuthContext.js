"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase auth user
  const [profile, setProfile] = useState(null); // Firestore user doc (name, bio, role, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profileData = await fetchProfile(firebaseUser.uid);
          if (profileData?.disabled) {
            await signOut(auth);
            setUser(null);
            setProfile(null);
          } else {
            setUser(firebaseUser);
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
        setUser(firebaseUser);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const fetchProfile = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  };

  const createUserDoc = async (uid, data) => {
    const userDoc = {
      name: data.name || "",
      email: data.email || "",
      bio: "",
      profilePicUrl: data.profilePicUrl || "",
      role: "user",
      disabled: false,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", uid), userDoc);
    return userDoc;
  };

  const signup = async (name, email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    const newProfile = await createUserDoc(result.user.uid, { name, email });
    setProfile(newProfile);
    return result.user;
  };

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const profileData = await fetchProfile(result.user.uid);
    if (profileData?.disabled) {
      await signOut(auth);
      throw new Error("account-disabled");
    }
    return result.user;
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // If it's their first time, create the Firestore profile doc
    const existing = await fetchProfile(result.user.uid);
    if (!existing) {
      const newProfile = await createUserDoc(result.user.uid, {
        name: result.user.displayName,
        email: result.user.email,
        profilePicUrl: result.user.photoURL || "",
      });
      setProfile(newProfile);
    } else {
      if (existing.disabled) {
        await signOut(auth);
        throw new Error("account-disabled");
      }
      setProfile(existing);
    }

    return result.user;
  };

  const logout = () => signOut(auth);

  const refreshProfile = async () => {
    if (user) {
      const updated = await fetchProfile(user.uid);
      setProfile(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signup, login, loginWithGoogle, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
