import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { USER_API_END_POINT } from "@/utils/constant";
import { toast } from "sonner";

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  refreshUser: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = async () => {
    try {
      const res = await axios.get(`${USER_API_END_POINT}/me`, { withCredentials: true });
      console.log(res.data.user);
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      const res = await axios.post(`${USER_API_END_POINT}/logout`, {}, { withCredentials: true });
      if (res.data?.success) {
        setUser(null);
        toast.success(res.data.message);
      };
    } catch (e) {
      toast.error(e.response?.data?.message || "Logout failed");
      await refreshUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);