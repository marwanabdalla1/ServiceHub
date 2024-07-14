// src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext to provide the token

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { token } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (token) {
            const newSocket = io('http://localhost:8080', {
                auth: { token },
                transports: ['websocket'],
            });
            setSocket(newSocket);

            return () => newSocket.close();
        }
    }, [token]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
