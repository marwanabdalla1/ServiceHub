import React, {createContext, useState, useContext, ReactNode} from 'react';
import axios from 'axios';

interface RecoveryContextType {
    email: string;
    otp: string;
    setEmail: (email: string) => void;
    setOtp: (otp: string) => void;
    resetPasswordEmail: (email: string) => Promise<void>;
}

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export const useRecovery = (): RecoveryContextType => {
    const context = useContext(RecoveryContext);
    if (!context) {
        throw new Error('useRecovery must be used within a RecoveryProvider');
    }
    return context;
};

interface RecoveryProviderProps {
    children: ReactNode;
}

export const RecoveryProvider: React.FC<RecoveryProviderProps> = ({children}) => {
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string>('');

    const resetPasswordEmail = async (email: string) => {
        const generateOtp = () => {
            let otp = '';
            for (let i = 0; i < 4; i++) {
                otp += Math.floor(Math.random() * 10); // generates a random number between 0-9
            }
            return otp;
        };

        const otp = generateOtp();
        const response = await axios.post('/api/forgetPassword/resetPassword', {email: email, otp: otp})
            .then((res) => {
                console.log(res);
            }).catch((err) => {
                console.error(err);
            });
        setEmail(email);
        setOtp(otp);
        return response;
    };

    return (
        <RecoveryContext.Provider value={{email, otp, setEmail, setOtp, resetPasswordEmail}}>
            {children}
        </RecoveryContext.Provider>
    );
};
