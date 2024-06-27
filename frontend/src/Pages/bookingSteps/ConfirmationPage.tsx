import React, { CSSProperties, FC } from 'react';

interface Styles {
    container: CSSProperties;
    header: CSSProperties;
    content: CSSProperties;
    highlight: CSSProperties;
}

const ConfirmationPage: FC = () => {

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
                <h1 style={styles.header}>Hi John</h1>
                <h2 style={styles.header}>Thank you for your order!</h2>
                <div style={styles.content}>
                    <p>Your booking number is <span style={styles.highlight}>1570VL</span></p>
                    <p>We'll send your confirmation to <span style={styles.highlight}>John.Newman.Baymard2021@gmail.com</span></p>
                    <p>It might not arrive immediately. Make sure to check your spam folder.</p>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;