import {
  createContext,
  useEffect,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../../SupabaseClient";
import type { Session } from "@supabase/supabase-js";

type Profile = {
  uid: string;
  name: string;
  firstname: string;
  lastname: string;
  middle_initial: string;
  email: string;
  role: string;
  shop_name: string;
  shop_gcash: string;
  shop_description: string;
  image: string;
  id_number: string;
  shop_status: string;
};

type NewProfile = {
  firstname: string;
  lastname: string;
  id_number: string;
  email: string;
  role: string;
  password: string;
  shop_name?: string;
};

type AuthContextType = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signupNewUser: (
    payload: NewProfile
  ) => Promise<{ success: boolean; error?: any }>;
  signInUser: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: any }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export const AuthContextProvider = ({ children }: Props) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // SIGN UP
  // =============================
  const signupNewUser = async (payload: NewProfile) => {
    try {
      console.log("SIgning up:", payload);
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
      });

      if (error) return { success: false, error };
      if (!data.user) return { success: false, error: "User not returned" };

      const { error: profileError } = await supabase.from("profiles").insert({
        uid: data.user.id,
        name: payload.firstname + " " + payload.lastname,
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        role: payload.role,
        id_number: payload.id_number,
        shop_name: payload.shop_name ?? null
      });

      if (profileError) return { success: false, error: profileError };

      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  // =============================
  // SIGN IN
  // =============================
  const signInUser = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo: "https://lccfoods.xyz"
        }
      });

      if (error) return { success: false, error };

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // =============================
  // SIGN OUT
  // =============================
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  };

  // =============================
  // AUTH LISTENER
  // =============================
  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =============================
  // LOAD PROFILE WHEN SESSION CHANGES
  // =============================
  useEffect(() => {
    const loadProfile = async () => {
      if (!session) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("uid", session.user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
    };

    loadProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signupNewUser,
        signInUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =============================
// HOOK
// =============================
export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UserAuth must be used within AuthContextProvider");
  }
  return context;
};
