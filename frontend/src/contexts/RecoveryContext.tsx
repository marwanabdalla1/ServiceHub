import React, {createContext, useState, useContext, ReactNode} from 'react';
import axios from 'axios';

interface RecoveryContextType {
    email: string;
    otp: string;
    timer: number; // Add timer state
    setEmail: (email: string) => void;
    setOtp: (otp: string) => void;
    resetPasswordEmail: (email: string) => void;
    createAccountEmail: (email: string, firstName: string) => void;
    startTimer: () => void; // Function to start the timer
    resetTimer: () => void; // Function to reset the timer
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
    const [timer, setTimer] = useState<number>(180);

    const startTimer = (onTimerEnd?: () => void) => {
        setTimer(180);
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    if (onTimerEnd) onTimerEnd(); // Execute the callback when the timer ends
                    setTimer(180); // Optionally reset the timer to 180 seconds
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const resetTimer = () => {
        setTimer(180); // Reset timer to 180 seconds
    };

    const generateOtp = () => {
        let otp = '';
        for (let i = 0; i < 4; i++) {
            otp += Math.floor(Math.random() * 10); // generates a random number between 0-9
        }
        return otp;
    };

    const resetPasswordEmail = async (email: string) => {
        const otp = generateOtp();
        await axios.post('/api/forgetPassword/resetPassword', {email: email, otp: otp});
        setEmail(email);
        setOtp(otp);
        startTimer(() => setOtp('')); // Reset the OTP when the timer ends
    };

    const createAccountEmail = async (email: string, firstName: string) => {
        const otp = generateOtp();
        await axios.post('/api/auth/signup/sendEmail', {email: email, otp: otp, firstName: firstName});
        setEmail(email);
        setOtp(otp);
        startTimer(() => setOtp('')); // Reset the OTP when the timer ends
    };

    return (
        <RecoveryContext.Provider value={{
            email,
            otp,
            timer,
            setEmail,
            setOtp,
            resetPasswordEmail,
            createAccountEmail,
            startTimer,
            resetTimer
        }}>
            {children}
        </RecoveryContext.Provider>
    );
};
