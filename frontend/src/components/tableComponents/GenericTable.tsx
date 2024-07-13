import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Container,
    Tooltip, IconButton
} from '@mui/material';
import GenericTableRow from "./GenericTableRow";
import {Job} from "../../models/Job";
import {ServiceRequest} from "../../models/ServiceRequest";
import InfoIcon from '@mui/icons-material/Info';



type Item = ServiceRequest | Job;

interface GenericTableProps {
    data: Item[];
    count: number;
    page: number;                 // current page
    setPage: (page: number) => void; // setter for current page
    rowsPerPage: number;          // rows per page
    setRowsPerPage: (rowsPerPage: number) => void; // setter for rows per page
    setShowMediaCard: (show:boolean) => void;
    onViewDetails: (item: Item | ServiceRequest | Job | null) => void;

}



function GenericTable({data, count, page, setPage, rowsPerPage, setRowsPerPage, setShowMediaCard, onViewDetails }:GenericTableProps) {
    const [selectedItem, setSelectedItem] = React.useState<ServiceRequest | Job | null>(null);
    const [selectedItems, setSelectedItems] = React.useState<Item[]>([]);



    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ): void => {
        console.log("new page", newPage)
        setShowMediaCard(false)
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to zero after row change
    };

    const handleToggleMediaCard = (req: Item | null) => {
        setSelectedItem(req);
        setShowMediaCard(req !== null);
    };



    return (
        <div>
            <TableContainer sx={{mb: 4}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Appointment Time</TableCell>
                            <TableCell>
                                <Tooltip title="Tables are sorted by upcoming appointments nearest to today, followed by recent past appointments." placement="top">
                                <IconButton>
                                    <InfoIcon />
                                </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row) => (
                            <GenericTableRow key={row._id} item={row} onViewDetails={onViewDetails} />
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
                count={count}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </div>
    );
}

export default GenericTable;
