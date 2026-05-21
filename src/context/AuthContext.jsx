import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Think of Context like a shared global variable any component can read
const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // stores the logged-in user object
  const [loading, setLoading] = useState(true); // true while we check auth status

  useEffect(() => {
    // On app load, check if a user session already exists (e.g. they were logged in before)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for login/logout events and update state automatically
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    // Cleanup: stop listening when the component unmounts
    return () => listener.subscription.unsubscribe();
  }, []);

  // Sign in with email + password
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  // Sign up with email + password + full name
  const signUp = (email, password, fullName) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

  // Sign out
  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut hook — instead of writing useContext(AuthContext) everywhere,
// you just write useAuth()
export const useAuth = () => useContext(AuthContext);
