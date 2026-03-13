import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { warmUpServer } from "../api/axios";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = await AsyncStorage.getItem("token");

                if (token) {
                    // 🔥 Restore session + ping server in parallel
                    const [res] = await Promise.all([
                        api.get("/auth/profile"),
                        warmUpServer(),
                    ]);
                    setUser({ ...res.data, token });
                } else {
                    // No token — pre-warm the server so login is fast
                    warmUpServer();
                }
            } catch (error) {
                await AsyncStorage.removeItem("token");
            } finally {
                setLoading(false);
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
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);