import {Account} from "../models/Account";
import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import axios, {AxiosResponse} from 'axios';
import {toast} from 'react-toastify';

type AccountContextType = {
    token: string | null;
    account: Account | null;
    isPremium: boolean;
    isProvider: boolean;
    registerUser: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    loginUser: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
}

type Props = { children: React.ReactNode };

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [isProvider, setIsProvider] = useState<boolean>(false);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [account, setAccount] = useState<Account | null>(null);




    useEffect(() => {
        // const account = localStorage.getItem('account');
        const token = localStorage.getItem('token');
        const isProvider = localStorage.getItem('isProvider');
        const isPremium = localStorage.getItem('isPremium');
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
                    console.log("account:" , response.data)
                    setAccount(response.data);
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

        setToken(response?.data.token!);
        setIsProvider(response?.data.isProvider);
        setIsPremium(response?.data.isPremium);
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
            console.error('Error logging in:', error);
        }
    };

    const logoutUser = async () => {
        // clear jwt token in the backend
        await axios.get('/api/auth/logout');
        // Clear the user's token and account information from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('isProvider');
        localStorage.removeItem('isPremium');

        // Clear the token and account state
        setToken(null);
        setIsProvider(false);
        setIsPremium(false);

        // Navigate the user back to the login page
        navigate('/login');
    };

    const isLoggedIn = () => {
        return token !== null && token !== undefined;
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