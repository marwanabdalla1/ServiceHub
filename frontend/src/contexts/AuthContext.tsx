import {Account} from "../models/Account";
import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import axios, {AxiosResponse} from 'axios';
import {toast} from 'react-toastify';

type AccountContextType = {
    account: Account | null;
    token: string | null;
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
    const [account, setAccount] = useState<Account | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);

    useEffect(() => {
        const account = localStorage.getItem('account');
        const token = localStorage.getItem('token');
        if (account && token) {
            setAccount(JSON.parse(account));
            setToken(token);
        }
        setIsReady(true);
    }, []);

    function handleResponse(response: AxiosResponse<any>) {
        localStorage.setItem('token', response?.data.token);
        const accountObj = {
            _id: response?.data.id,
            firstName: response?.data.firstName,
            lastName: response?.data.lastName,
            email: response?.data.email,
            serviceOfferings: []
        };
        localStorage.setItem('account', JSON.stringify(accountObj));

        setToken(response?.data.token!);
        setAccount(accountObj!);
    }

    const registerUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);

        const account = {
            firstName: data.get('firstName'),
            lastName: data.get('lastName'),
            email: data.get('email'),
            password: data.get('password'),
        };

        try {
            const response = await axios.post('/api/auth/signup', account);
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
        localStorage.removeItem('account');

        // Clear the token and account state
        setToken(null);
        setAccount(null);

        // Navigate the user back to the login page
        navigate('/login');
    };

    const isLoggedIn = () => {
        return token !== null;
    };

    return (
        <AccountContext.Provider value={{account, token, registerUser, loginUser, logoutUser,isLoggedIn}}>
            {isReady ? children:null}
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