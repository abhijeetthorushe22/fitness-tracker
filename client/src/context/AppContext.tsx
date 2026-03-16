import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityEntry, AppContextType, Credentials, FoodEntry, User } from "../types";

import api from "../config/api";
import toast from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User>(null);
    const [isUserFetched, setIsUserFetched] = useState(localStorage.getItem('token') ? false: true);
    
    const [onboardingCompleted, setOnboardingCompleted] = useState(false);
    const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);

    const signup = async (credentials: Credentials) => {
        try {
            const { data } = await api.post("/api/auth/local/register", credentials);
            setUser({ ...data.user, token: data.jwt });
            if (data?.user?.age && data?.user?.weight && data?.user?.height && data?.user?.goal) {
                setOnboardingCompleted(true);
            }
            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const login = async (credentials: Credentials) => {
        try {
            const { data } = await api.post('/api/auth/local', {
                identifier: credentials.email,
                password: credentials.password
            });
            setUser({ ...data.user, token: data.jwt });
            if (data?.user?.age && data?.user?.weight && data?.user?.height && data?.user?.goal) {
                setOnboardingCompleted(true);
            }
            localStorage.setItem("token", data.jwt);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const fetchUser = async (token: string) => {
        try {
            const { data } = await api.get('/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data) {
                setUser({ ...data, token });
                if (data.age && data.weight && data.height && data.goal) {
                    setOnboardingCompleted(true);
                }
            }
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } catch (error: any) {
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
        setIsUserFetched(true);
    };

    const fetchFoodLogs = async (token:string) => {
        try{
               const { data } = await api.get('/api/food-logs',{headers:{
                Authorization: `Bearer ${token}`
               }});
               const logsArray = Array.isArray(data) ? data : (data.data || []);
               const mappedLogs = logsArray.map((log: any) => ({
                 ...log,
                 calories: log.calorie,
                 mealType: log.mealtype
               }));
               setAllFoodLogs(mappedLogs)
        }
        catch(error:any){
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const fetchActivityLogs = async (token:string) => {
        try{
               const { data } = await api.get('/api/activitylogs',{headers:{
                Authorization: `Bearer ${token}`
               }});
               const logsArray = Array.isArray(data) ? data : (data.data || []);
               const mappedLogs = logsArray.map((log: any) => ({
                 ...log,
                 calories: log.calorie
               }));
               setAllActivityLogs(mappedLogs)
        }
        catch(error:any){
            console.log(error);
            toast.error(error?.response?.data?.error?.message || error?.message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setOnboardingCompleted(false);
        api.defaults.headers.common["Authorization"] = '';
        navigate('/login');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            (async () => {
                await fetchUser(token);
                await fetchFoodLogs(token);
                await fetchActivityLogs(token);
            })();
        } else {
            setIsUserFetched(true);
        }
    }, []);

    const value: AppContextType = {
        user,
        setUser,
        login,
        signup,
        fetchUser,
        isUserFetched,
        logout,
        onboardingCompleted,
        setOnboardingCompleted,
        allFoodLogs,
        setAllFoodLogs,
        allActivityLogs,
        setAllActivityLogs,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
