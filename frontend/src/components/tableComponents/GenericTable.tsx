import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import GenericTableRow from "./GenericTableRow";
import {Job} from "../../models/Job";
import {ServiceRequest} from "../../models/ServiceRequest";



type Item = ServiceRequest | Job;

interface GenericTableProps {
    data: Item[];
}



function GenericTable({data}:GenericTableProps) {
    const [showMediaCard, setShowMediaCard] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<ServiceRequest | Job | null>(null);
    const [selectedItems, setSelectedItems] = React.useState<Item[]>([]);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);


    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ): void => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to zero after row change
    };

    const handleToggleMediaCard = (req: ServiceRequest | Job | null) => {
        setSelectedItem(req);
        setShowMediaCard(req !== null);
    };

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Appointment Date</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0
                                ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                : data
                        ).map((row) => (
                            <GenericTableRow key={row._id} item={row} onViewDetails={handleToggleMediaCard} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                sx={{
                    '.MuiTablePagination-toolbar': {
                        justifyContent: 'flex-end', // Ensures all elements are aligned to the right
                    },
                    '.MuiTablePagination-spacer': {
                        flex: '1 1 100%', // Adjusts flex settings to push controls to the right
                    },
                    '.MuiTablePagination-selectRoot': {
                        marginRight: '32px', // Adds right margin to the rows per page select element
                        marginTop: 2,
                    },
                    '.MuiToolbar-root': {
                        alignContent: 'center',
                        justifyContent: 'flex-end'
                    },
                    '.MuiTablePagination-displayedRows': {
                        marginRight: 'auto',  // Adjusts margin to align text properly
                        marginLeft: 0,        // Ensures no left margin affecting alignment
                        marginTop: 2,
                    },
                    '.MuiTablePagination-selectLabel': {marginTop: 2,}, //for the "rows per page"

                    '.MuiTablePagination-select': {margin: 0}, // for the dropdown
                    '.MuiTablePagination-actions': {margin: 2}
                }}
                rowsPerPageOptions={[10, 20, 50, {label: 'All', value: -1}]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}

export default GenericTable;
