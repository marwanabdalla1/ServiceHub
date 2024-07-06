import {Account} from "../models/Account";
import {createContext, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import * as React from "react";
import axios, {AxiosResponse} from 'axios';
import {toast} from "react-toastify";
import {jwtDecode} from 'jwt-decode';

interface DecodedToken {
    exp: number;
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
        console.log('Token expiry:', decoded.exp, 'Current time:', currentTime);
        return decoded.exp < currentTime;
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

type AccountContextType = {
    token: string | null;
    account: Account | null;
    isReady: boolean;
    registerUser: (event: React.FormEvent<HTMLFormElement>, redirect:string) => Promise<void>;
    loginUser: (event: React.FormEvent<HTMLFormElement>, redirect:string) => Promise<void>;
    logoutUser: () => void;
    isLoggedIn: () => boolean;
    isPremium: () => boolean;
    isProvider: () => boolean;
    isAdmin: () => boolean;
}

type Props = { children: React.ReactNode };

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({children}: Props) => {
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [account, setAccount] = useState<Account | null >(null);
    // const [nextPath, setNextPath] = useState('/');  // Default to home


    useEffect(() => {
        // const account = localStorage.getItem('account');
        const token = localStorage.getItem('token');
        // Fetch the item from localStorage and store it in a variable
        // const accountData = localStorage.getItem('account');
    // Check if the accountData is not null before parsing

        if (token) {
            setToken(token);
        }
        // if (accountData){
        //     setAccount(accountData as unknown as Account)
        // }
        // setIsReady(true);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchAccountDetails = async () => {
            if (!token || isTokenExpired(token)) {
                console.log('Token is missing or expired');
                return;
            }

            try {
                const response = await axios.get('/api/account', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (isMounted) {
                    setAccount(response.data);
                    console.log("Account fetched and set:", response.data);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

            setIsReady(true);
        };

        if (isMounted && token) {
            fetchAccountDetails();
        }

        return () => {
            isMounted = false;
        };
    }, [token]);





    // useEffect(() => {
    //     if (token) {
    //         axios.get('/api/account', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
    //             .then(response => {
    //                 console.log("account:", response.data)
    //                 setAccount(response.data);
    //                 localStorage.setItem('account', response?.data);

    //             })
    //             .catch(error => {
    //                 console.error('Error fetching user data:', error);
    //             });
    //     }
    // }, [token]);
    //
    function handleResponse(response: AxiosResponse<any>) {
        localStorage.setItem('token', response?.data.token);
        localStorage.setItem('isProvider', response?.data.isProvider);
        localStorage.setItem('isPremium', response?.data.isPremium);
        localStorage.setItem('account', response?.data);
    //
    //
        setToken(response?.data.token!);
        console.log("setting account in handle response")
        setAccount(response.data);
    }





    const registerUser = async (event: React.FormEvent<HTMLFormElement>, redirect='/') => {
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
                navigate(redirect);
            }
        } catch
            (error) {
            console.error('Error creating user:', error);
            toast('User registration failed. Please try again.');
        }
    };

    const loginUser = async (event: React.FormEvent<HTMLFormElement>, redirect:string='/') => {
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
                console.log(`Status: ${response.status}`);
                console.log(`Status Text: ${response.statusText}`);
                console.log(response.data.isAdmin);
                if (response.data.isAdmin === true) {
                    toast.success('Admin logged in successfully');
                    navigate('/admin');
                } else {
                    toast.success('User logged in successfully');
                    navigate(redirect);
                }
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
        console.log("logging out user now")
        setAccount(null);

        if (isAdmin()) {
            toast('Admin logged out successfully');
        } else {
            toast('User logged out successfully');
        }

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
            value={{token, account, isProvider, isPremium, registerUser, loginUser, logoutUser, isLoggedIn, isAdmin, isReady}}>
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