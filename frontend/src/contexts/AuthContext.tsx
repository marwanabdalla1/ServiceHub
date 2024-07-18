import {Account} from "../models/Account";
import * as React from "react";
import {createContext, useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import axios, {AxiosResponse} from 'axios';
import {toast} from "react-toastify";
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    exp: number;
}

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

/**
 * Checks if the JWT token is expired.
 * @param token - The JWT token to check.
 * @returns true if the token is expired, false otherwise.
 */
const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

type AccountContextType = {
    token: string | null;
    account: Account | null;
    registerUser: (formData: UserData) => Promise<void>;
    loginUser: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
    isPremium: () => boolean;
    isProvider: () => boolean;
    isAdmin: () => boolean;
    isReady: boolean;
    isFetched: boolean;
}

type Props = { children: React.ReactNode };

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [isFetched, setIsFetched] = useState<boolean>(false);

    const [account, setAccount] = useState<Account | null>(null);


    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            setToken(token);
        }
        setIsReady(true);
    }, []);


    useEffect(() => {
        if (token) {
            axios.get('/api/account', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setAccount(response.data);
                    localStorage.setItem('account', response?.data);
                    setIsReady(true);
                    setIsFetched(true);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }

    }, [token]);

    function handleResponse(response: AxiosResponse<any>) {
        localStorage.setItem('token', response?.data.token);
        localStorage.setItem('isProvider', response?.data.isProvider);
        localStorage.setItem('isPremium', response?.data.isPremium);
        localStorage.setItem('account', response?.data);


        setToken(response?.data.token!);
        setAccount(response.data);
    }

    const registerUser = async (formData: UserData) => {
        try {
            const response = await axios.post('/api/auth/signup', formData);
            if (response) {
                handleResponse(response);
                toast.success('User registered successfully');


                const from = location.state?.from || '/';  // Default path if no redirect was set
                navigate(from);  // Redirect to the intended page or a default path

            }
        } catch
            (error) {
            toast('User registration failed. Please try again.');
        }
    };

    const loginUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const user = {
            email: data.get('email'),
            password: data.get('password'),
            rememberMe: data.get('rememberMe') === 'remember',
        };

        try {
            const response = await axios.post('/api/auth/login', user);
            if (response) {
                handleResponse(response);
                if (response.data.isAdmin === true) {
                    toast.success('Admin logged in successfully');
                    navigate('/admin');
                } else {
                    toast.success('User logged in successfully');

                    const from = location.state?.from || '/';  // Default path if no redirect was set
                    navigate(from);  // Redirect to the intended page or a default path
                }
            }
        } catch (error) {
            toast.error('Login failed. Please check your credentials and try again.');
        }
    };

    const logoutUser = async () => {
        // clear jwt token in the backend
        await axios.get('/api/auth/logout');
        // Clear the user's token and account information from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('account');

        // Clear the token and account state
        setToken(null);
        setAccount(null);

        // Navigate the user back to the login page
        navigate('/login');
    };

    const isLoggedIn = () => {
        if (token !== null && token !== undefined && isTokenExpired(token)) {
            logoutUser().then(r => console.log('User logged out due to expired token'));
        }
        return token !== null && token !== undefined && !isTokenExpired(token);
    };

    const isPremium = () => {
        return account?.isPremium === true;
    };

    const isProvider = () => {
        return account?.isProvider === true;
    };

    const isAdmin = () => {
        return account?.isAdmin === true;
    };


    return (
        <AccountContext.Provider
            value={{token, account, isProvider, isPremium, registerUser, loginUser, logoutUser, isLoggedIn, isAdmin, isReady, isFetched}}>
            {isReady ? children : null}
        </AccountContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AccountContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AccountProvider');
    }
    return context;
};