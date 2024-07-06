import React, {createContext, useState, useContext, ReactNode} from 'react';
import axios from 'axios';

interface RecoveryContextType {
    email: string;
    otp: string;
    timer: number; // Add timer state
    setEmail: (email: string) => void;
    setOtp: (otp: string) => void;
    resetPasswordEmail: (email: string) => Promise<void>;
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
    const [timer, setTimer] = useState<number>(60);

    const startTimer = (onTimerEnd?: () => void) => {
        setTimer(60);
        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    if (onTimerEnd) onTimerEnd(); // Execute the callback when the timer ends
                    setTimer(60); // Optionally reset the timer to 60 seconds
                }
                return prevTimer - 1;
            });
        }, 1000);
    };

    const resetTimer = () => {
        setTimer(60); // Reset timer to 60 seconds
    };

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
            })
        setEmail(email);
        setOtp(otp);
        startTimer(() => setOtp('')); // Reset the OTP when the timer ends
        return response;
    };

    return (
        <RecoveryContext.Provider value={{ email, otp, timer, setEmail, setOtp, resetPasswordEmail, startTimer, resetTimer }}>
            {children}
        </RecoveryContext.Provider>
    );
};
