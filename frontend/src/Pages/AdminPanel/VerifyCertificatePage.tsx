import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import {useAuth} from "../../contexts/AuthContext";
import {useNavigate} from "react-router-dom";

interface Service {
    serviceId: string;
    serviceType: string;
    isCertified: boolean | null;
}

interface User {
    email: string;
    services: Service[];
}


export default function VerifyCertificates(): React.ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const [checkedUsers, setCheckedUsers] = useState<User[]>([]);
    const {isAdmin, token, account} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token || (account && !isAdmin())) {
            navigate('/unauthorized');
        }
    }, [token, account]);

    const parseCertificateData = (responseData: ArrayBuffer): User[] => {
        const dataView = new DataView(responseData);
        let offset = 0;

        while (offset < dataView.byteLength && dataView.getUint8(offset) !== '|'.charCodeAt(0)) {
            offset++;
        }

        const metadataBuffer = responseData.slice(0, offset);
        const metadata = JSON.parse(new TextDecoder().decode(metadataBuffer));

        // Combine metadata and certificate data
        const usersData: User[] = metadata.map((user: any) => ({
            email: user.email,
            services: [{
                serviceId: user.serviceId,
                serviceType: user.serviceType,
                isCertified: user.isCertified,
            }]
        }));

        return usersData;
    };

    useEffect(() => {
        const fetchUncheckedCertificates = async () => {
            try {
                const response = await axios.get('/api/certificate/admin/unchecked', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'arraybuffer'
                });

                const usersData = parseCertificateData(response.data);
                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching unverified certificates', error);
            }
        };

        fetchUncheckedCertificates().then(r => console.log('Certificates fetched'));
    }, []);

    useEffect(() => {
        const fetchCheckedCertificates = async () => {
            try {
                const response = await axios.get('/api/certificate/admin/checked', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'arraybuffer'
                });
                const usersData = parseCertificateData(response.data);
                setCheckedUsers(usersData);
            } catch (error) {
                console.error('Error fetching verified certificates', error);
            }
        };
        fetchCheckedCertificates().then(r => console.log('Checked certificates fetched'));
    }, []);

    function updateUserCertificationStatus(serviceId: string, users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>>, setCheckedUsers: React.Dispatch<React.SetStateAction<User[]>>, isCertified: boolean) {
        const userIndex = users.findIndex(user => user.services.some(service => service.serviceId === serviceId));
        if (userIndex > -1) {
            const user = {...users[userIndex]};
            // Update the service as certified or not certified before moving
            user.services = user.services.map(service => service.serviceId === serviceId ? {
                ...service,
                isCertified: isCertified
            } : service);
            setUsers(prev => prev.filter((_, index) => index !== userIndex));
            setCheckedUsers(prev => [...prev, user]);
        }
    }

    const handleVerify = async (serviceId: string) => {
        try {
            await axios.post('/api/certificate/admin/verifyCertificate', {serviceId}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            updateUserCertificationStatus(serviceId, users, setUsers, setCheckedUsers, true);
        } catch (error) {
            console.error('Error verifying certificate', error);
        }
    };

    const handleDecline = async (serviceId: string) => {
        try {
            await axios.post('/api/certificate/admin/declineCertificate', {serviceId}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            updateUserCertificationStatus(serviceId, users, setUsers, setCheckedUsers, false);
        } catch (error) {
            console.error('Error decline certificate', error);
        }
    };

    const handleRevert = async (serviceId: string) => {
        try {
            await axios.post('/api/certificate/admin/revertVerifyCertificate', {serviceId}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            updateUserCertificationStatus(serviceId, checkedUsers, setCheckedUsers, setUsers, false);
        } catch (error) {
            console.error('Error reverting certificate verification', error);
        }
    };

    const fetchCertificate = async (_id: string, filename: string) => {
        try {
            // Fetch certificate
            const certificateResponse = await axios.get(`/api/certificate/${_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(certificateResponse.data);
            console.log(
                'Certificate fetched:',
                certificateResponse.data,
                'URL:', url
            );
            window.open(url);
            window.URL.revokeObjectURL(url);

            console.log('Certificate fetched:', certificateResponse.data)
        } catch (error) {
            console.error('Error fetching certificate:', error);
        }
    };

    const renderCertificatesTable = (users: User[], actions: {
        label: string;
        color: string;
        action: (serviceId: string) => void
    }[]) => {
        // If the table contain the revert action -> verified certificate table -> include status column
        const showStatusColumn = actions.some(action => action.label === "Revert");

        return (
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">User Email</TableCell>
                            <TableCell align="center">Service</TableCell>
                            {showStatusColumn && <TableCell align="center">Status</TableCell>}
                            <TableCell align="center">Certificate</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            user.services.map((service) => (
                                <TableRow key={service.serviceId}>
                                    <TableCell align="center">{user.email}</TableCell>
                                    <TableCell align="center">{service.serviceType}</TableCell>
                                    {showStatusColumn && (
                                        <TableCell align="center">
                                            {service.isCertified ? "Approved" : "Declined"}
                                        </TableCell>
                                    )}
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            onClick={() => fetchCertificate(service.serviceId, `${user.email}-${service.serviceType}.pdf`)}
                                        >
                                            View
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center">
                                        {actions.map(({label, color, action}) => (
                                            <Button
                                                key={label}
                                                variant="contained"
                                                color={color as "primary" | "error"}
                                                onClick={() => action(service.serviceId)}
                                                style={{marginLeft: '10px'}}
                                            >
                                                {label}
                                            </Button>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            ))
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };


    return (
        <Container component="main" maxWidth="md" sx={{mt: 4}}>
            <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '30px', color: '#007BFF'}}>
                Unverified Certificates
            </Typography>
            {renderCertificatesTable(users, [
                {label: "Verify", color: "primary", action: handleVerify},
                {label: "Decline", color: "error", action: handleDecline}
            ])}
            <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold', fontSize: '30px', color: '#007BFF', mt: 4}}>
                Verified Certificates
            </Typography>
            {renderCertificatesTable(checkedUsers, [
                {label: "Revert", color: "error", action: handleRevert}
            ])}
        </Container>
    );
};

