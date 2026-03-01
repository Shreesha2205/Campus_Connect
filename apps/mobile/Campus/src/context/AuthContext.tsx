import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/axios";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const token = await AsyncStorage.getItem("token");
            if (token) {
                try {
                    // Re-fetch profile so we have _id, name, email etc — not just the token
                    const res = await api.get("/auth/profile");
                    setUser({ ...res.data, token });
                } catch {
                    // Token expired / invalid — clear it
                    await AsyncStorage.removeItem("token");
                }
            }
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await api.post("/auth/login", { email, password });
        await AsyncStorage.setItem("token", res.data.token);
        setUser(res.data);
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await api.post("/auth/register", { name, email, password });
        await AsyncStorage.setItem("token", res.data.token);
        setUser(res.data);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        setUser(null);
    };

    const updateUser = (data: any) => {
        setUser((prev: any) => ({ ...prev, ...data }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);