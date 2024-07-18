import React, {CSSProperties, FC, useEffect} from 'react';
import {useAuth} from "../../contexts/AuthContext";
import {useNavigate, useParams} from 'react-router-dom';
import axios from "axios";
import {Feedback} from "../../models/Feedback";

interface Styles {
    container: CSSProperties;
    header: CSSProperties;
    content: CSSProperties;
    highlight: CSSProperties;
}

type MessageType = 'booking' | 'timeslotChange';

// confirmation page sent out to the consumers to confirm their booking
const ConfirmationPage: FC = () => {

    const { requestId, type } = useParams<{ requestId: string; type?: MessageType }>();
    const { account, token } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        if (!token || !account){
            navigate("/unauthorized")
        }

    }, [account, token]);
    const messages = {
        booking: {
            thankYou: "Thank you for your order!",
            confirmationInfo: "We'll send your confirmation to",
        },
        timeslotChange: {
            thankYou: "Your timeslot change was successful!",
            confirmationInfo: "Your new timeslot details will be sent to",
        },
        default: {
            thankYou: "Thank you!",
            confirmationInfo: "Information will be sent to",
        }
    };

    const currentMessage = messages[type as MessageType] || messages.default;


    const styles: Styles = {
        container: {
            maxWidth: '500px',
            margin: '50px auto',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            borderTop: '10px solid #007BFF'  // Adding a blue top border
        },
        header: {
            color: '#333333',
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '20px',
            textTransform: 'uppercase'
        },
        content: {
            color: '#666666',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '20px 0'
        },
        highlight: {
            color: '#007BFF',
            fontWeight: 'bold',
            fontSize: '20px',
            display: 'block',
            margin: '20px 0'
        }
    };

    return (
        <div>
            <div style={styles.container}>
                <h1 style={styles.header}>Hi {account?.firstName} {account?.lastName}</h1>
                <h2 style={styles.header}>{currentMessage.thankYou}</h2>
                <div style={styles.content}>
                    <p>Your booking number is <span style={styles.highlight}>{requestId}</span></p>
                    <p>{currentMessage.confirmationInfo} <span style={styles.highlight}>{account?.email}</span></p>
                    <p>It might not arrive immediately. Make sure to check your spam folder.</p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;