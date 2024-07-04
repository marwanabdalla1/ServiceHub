import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
    Box, Container, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, Typography
} from '@mui/material';
import {useAuth} from "../../contexts/AuthContext";

interface Certificate {
    serviceId: string;
    serviceType: string;
    certificateFile: ArrayBuffer;
    isCertified: boolean | null;
}

interface User {
    email: string;
    services: Certificate[];
}

export default function VerifyCertificates(): React.ReactElement {
    const [users, setUsers] = useState<User[]>([]);
    const {token} = useAuth();

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axios.get('/api/certificate/admin/unverified', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    responseType: 'arraybuffer'
                });

                const dataView = new DataView(response.data);
                let offset = 0;

                while (offset < dataView.byteLength && dataView.getUint8(offset) !== '|'.charCodeAt(0)) {
                    offset++;
                }

                const metadataBuffer = response.data.slice(0, offset);
                const metadata = JSON.parse(new TextDecoder().decode(metadataBuffer));
                const certificateData = response.data.slice(offset + 1);
                const base64Certificate = btoa(
                    String.fromCharCode(...Array.from(new Uint8Array(certificateData)))
                );

                // Combine metadata and certificate data
                const usersData: User[] = metadata.map((user: any) => ({
                    email: user.email,
                    services: [{
                        serviceId: user.serviceId,
                        serviceType: user.serviceType,
                        certificateFile: base64Certificate,
                        isCertified: user.isCertified,
                    }]
                }));

                setUsers(usersData);
            } catch (error) {
                console.error('Error fetching unverified certificates', error);
            }
        };

        fetchCertificates();
    }, []);

    const handleVerify = async (serviceId: string) => {
        try {
            await axios.post('/api/certificate/admin/verifyCertificate', {serviceId}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setUsers(users.map(user => ({
                ...user,
                services: user.services.filter(service => service.serviceId !== serviceId)
            })));
        } catch (error) {
            console.error('Error verifying certificate', error);
        }
    };

    const downloadFile = (fileBuffer: ArrayBuffer, filename: string) => {
        const blob = new Blob([fileBuffer], {type: 'application/pdf'});
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                Verify Certificates
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">User Email</TableCell>
                            <TableCell align="center">Service</TableCell>
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
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            onClick={() => downloadFile(service.certificateFile, `${user.email}-${service.serviceType}.pdf`)}
                                        >
                                            Download
                                        </Button>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleVerify(service.serviceId)}
                                        >
                                            Verify
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

