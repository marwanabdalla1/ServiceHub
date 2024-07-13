import {isValidPhoneNumber} from "../validators/AccountDataValidator";
import {toast} from "react-toastify";
import axios from "axios";
import {Account} from "../models/Account";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

type FieldType = {
    [key: string]: string;
};

export const updateAccountFields = async (account: any, field: string, token: string | null, accountId: string | null, fieldValue: FieldType, setFieldValue: (value: (((prevState: FieldType) => FieldType) | FieldType)) => void) => {
    const updatedAccount = {...account, [field]: fieldValue[field]};

    if (field === 'phone' && !isValidPhoneNumber(fieldValue[field])) {
        toast('Invalid phone number', {type: 'error'});
        // set the value of phone back to the account phone number
        setFieldValue(prevState => ({...prevState, [field]: account.phone}));
        return;
    }

    try {
        if (token && !accountId) {
            const response = await axios.put('/api/account', updatedAccount, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        }
        if (token && accountId) {
            const response = await axios.put(`/api/account/${accountId}`, updatedAccount, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        }
    } catch (error) {
        console.error('Error updating account details:', error);
    }
};

export const saveAddress = async (updatedAddress: {
    address: string;
    postal: string;
    location: string
}, account: any, token: string | null, accountId: string | null, setAccount: (value: any) => void) => {
    const updatedAccount = {
        ...account,
        ...updatedAddress
    };

    try {
        if (token && !accountId) {
            const response = await axios.put('/api/account', updatedAccount, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAccount(response.data);
        }
        if (token && accountId) {
            const response = await axios.put(`/api/account/${accountId}`, updatedAccount, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setAccount(response.data);
        }
    } catch (error) {
        console.error('Error updating account details:', error);
    }
};

export const loadAccount = async (token: string | null, accountId: string | null) => {

    if (token && !accountId) {
        const response = await axios.get('/api/account', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }

    if (token && accountId) {
        const response = await axios.get(`/api/account/${accountId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    }
}

export const deleteAccount = async (token: string, accountId: string | null) => {
    if (token && !accountId) {
        await axios.delete('/api/account', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
    if (token && accountId) {
        await axios.delete(`/api/account`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                accountId: accountId
            }
        });
    }
}

