import {Account} from "../models/Account";
import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import axios, {AxiosResponse} from 'axios';
import {toast} from 'react-toastify';

type AccountContextType = {
    token: string | null;
    account: Account | null;
    registerUser: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    loginUser: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
    isPremium: () => boolean;
    isProvider: () => boolean;
}

type Props = { children: React.ReactNode };

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [account, setAccount] = useState<Account | null>(null);
    // const [nextPath, setNextPath] = useState('/');  // Default to home


    useEffect(() => {
        // const account = localStorage.getItem('account');
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
                    console.log("account:", response.data)
                    setAccount(response.data);
                    localStorage.setItem('account', response?.data);
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
        // localStorage.setItem('account', response?.data);


        setToken(response?.data.token!);
        // setAccount(response.data);
    }

    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const newaccount = {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
        };

        try {
            const response = await axios.post('/api/auth/signup', newaccount);
            if (response) {
                handleResponse(response);
                toast.success('User registered successfully');

                console.log(`Status: ${response.status}`);
                console.log(`Status Text: ${response.statusText}`);

                console.log(response.data);
                navigate('/');
            }
        } catch
            (error) {
            console.error('Error creating user:', error);
            toast('User registration failed. Please try again.');
        }
    };

    const loginUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const user = {
            email: data.get('email'),
            password: data.get('password'),
        };

        try {
            const response = await axios.post('/api/auth/login', user);
            if (response) {
                handleResponse(response);
                toast.success('User logged in successfully');

                console.log(`Status: ${response.status}`);
                console.log(`Status Text: ${response.statusText}`);
                console.log(response.data);
                navigate('/');
            }
        } catch (error) {
            toast.error('Login failed. Please check your credentials and try again.');
            console.error('Error logging in:', error);
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

        toast('User logged out successfully');
        // Navigate the user back to the login page
        navigate('/login');
    };

    const isLoggedIn = () => {
        return token !== null && token !== undefined;
    };

    const isPremium = () => {
        return account?.isPremium === true;
    };

    const isProvider = () => {
        return account?.isProvider === true;
    };


    return (
        <AccountContext.Provider
            value={{token, account, isProvider, isPremium, registerUser, loginUser, logoutUser, isLoggedIn}}>
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