import React, { createContext, useReducer, useContext, useEffect } from 'react';
//import { authServiceTest } from '../services/authServiceTest';
import { authService } from '../services/authService';

const AuthStateContext = createContext(undefined);
const AuthDispatchContext = createContext(undefined);

const initialState = {
    isLoading: true,
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
};

function authReducer(state, action) {
    switch (action.type) {
        case 'REQUEST_LOGIN':
        case 'REQUEST_REGISTER':
        case 'REQUEST_UPDATE_USER': // Общий тип для запроса обновления
            return {
                ...state,
                isLoading: true, // Можно установить isLoading для обновлений тоже
                error: null,
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                error: null,
            };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
        case 'UPDATE_USER_FAILURE': // Общий тип для ошибки обновления
            return {
                ...state,
                isLoading: false,
                error: action.payload.error,
            };
        case 'LOGOUT':
            return {
                ...initialState, // Сбрасываем к начальному состоянию, кроме isLoading
                isLoading: false,
            };
        case 'LOAD_USER':
            return {
                ...state,
                isLoading: false,
                isAuthenticated: !!action.payload.token,
                user: action.payload.user,
                token: action.payload.token,
            };
        case 'UPDATE_USER_SUCCESS':
            return {
                ...state,
                isLoading: false, // Завершение загрузки
                user: action.payload.user,
                token: action.payload.token, // Обновляем токен, так как он перевыпускается
                error: null,
            };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
}

export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const storedAuth = authService.loadUserFromStorage();
        if (storedAuth) {
            dispatch({ type: 'LOAD_USER', payload: storedAuth });
        } else {
            dispatch({ type: 'LOAD_USER', payload: { user: null, token: null } });
        }
    }, []);

    const login = async (credentials) => {
        dispatch({ type: 'REQUEST_LOGIN' });
        try {
            const data = await authService.login(credentials);
            dispatch({ type: 'LOGIN_SUCCESS', payload: data });
            return data;
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILURE', payload: { error: error.message } });
            throw error;
        }
    };

    const register = async (userData) => {
        dispatch({ type: 'REQUEST_REGISTER' });
        try {
            const data = await authService.register(userData);
            dispatch({ type: 'REGISTER_SUCCESS', payload: data });
            return data;
        } catch (error) {
            dispatch({ type: 'REGISTER_FAILURE', payload: { error: error.message } });
            throw error;
        }
    };

    const logout = async () => {
        await authService.logout();
        dispatch({ type: 'LOGOUT' });
    };

    const updateUserDeliveryAddress = async (userId, address) => {
        dispatch({ type: 'REQUEST_UPDATE_USER' }); // Используем общий тип
        try {
            const updatedUserData = await authService.updateDeliveryAddress(userId, address);
            dispatch({ type: 'UPDATE_USER_SUCCESS', payload: updatedUserData }); // payload теперь {user, token}
            return updatedUserData;
        } catch (error) {
            dispatch({ type: 'UPDATE_USER_FAILURE', payload: { error: error.message } });
            throw error;
        }
    };

    const updateUserProfile = async (userId, profileData) => {
        dispatch({ type: 'REQUEST_UPDATE_USER' }); // Используем общий тип
        try {
            const updatedUserData = await authService.updateUserProfile(userId, profileData);
            dispatch({ type: 'UPDATE_USER_SUCCESS', payload: updatedUserData }); // payload {user, token}
            return updatedUserData;
        } catch (error) {
            dispatch({ type: 'UPDATE_USER_FAILURE', payload: { error: error.message } });
            throw error;
        }
    };


    return (
        <AuthStateContext.Provider value={state}>
            <AuthDispatchContext.Provider value={{ login, register, logout, updateUserDeliveryAddress, updateUserProfile }}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    );
}

export function useAuthState() {
    const context = useContext(AuthStateContext);
    if (context === undefined) {
        throw new Error('useAuthState must be used within a AuthProvider');
    }
    return context;
}

export function useAuthDispatch() {
    const context = useContext(AuthDispatchContext);
    if (context === undefined) {
        throw new Error('useAuthDispatch must be used within a AuthProvider');
    }
    return context;
}