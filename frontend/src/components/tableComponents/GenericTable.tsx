import React, {useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip, IconButton, FormControl, InputLabel, Select, MenuItem, Box, Typography, CircularProgress
} from '@mui/material';
import GenericTableRow from "./GenericTableRow";
import {Job} from "../../models/Job";
import {ServiceRequest} from "../../models/ServiceRequest";
import InfoIcon from '@mui/icons-material/Info';
import {useAuth} from "../../contexts/AuthContext";
import {ServiceType} from "../../models/enums";


type Item = ServiceRequest | Job;

interface GenericTableProps {
    data: Item[];
    count: number;
    page: number;                 // current page
    setPage: (page: number) => void; // setter for current page
    rowsPerPage: number;          // rows per page
    setRowsPerPage: (rowsPerPage: number) => void; // setter for rows per page
    setShowMediaCard: (show: boolean) => void;
    onViewDetails: (item: Item | ServiceRequest | Job | null) => void;
    isProvider: boolean;
    statusOptions: string[];
    statusFilter: string[];
    setStatusFilter: (filter: string[]) => void;
    serviceTypeFilter: string[];

    setServiceTypeFilter: (filter: string[]) => void;

}


function GenericTable({
                          data,
                          count,
                          page,
                          setPage,
                          rowsPerPage,
                          setRowsPerPage,
                          setShowMediaCard,
                          onViewDetails,
                          isProvider,
                          statusOptions,
                          statusFilter,
                          setStatusFilter,
                          serviceTypeFilter,
                          setServiceTypeFilter,
                      }: GenericTableProps) {
    const {token, account} = useAuth();

    const [statusOpen, setStatusOpen] = useState(false);  // For the status dropdown

    const [serviceTypeOpen, setServiceTypeOpen] = useState(false);  // For the service type dropdown

    // change the status filter of the table, multiple statuses possible
    const handleChangeStatus = (event: any) => {
        const value = event.target.value;
        if (value.includes('All Statuses')) {
            setStatusFilter(['All Statuses']); // Reset to only 'All Statuses'
            setStatusOpen(false); // Close the dropdown
        } else {
            setStatusFilter(typeof value === 'string' ? value.split(',') : value);
        }
        setShowMediaCard(false)
        setPage(0);
    };

    const handleStatusOpen = () => {
        if (statusFilter.includes('All Statuses')) {
            setStatusFilter([]);
        }
        setStatusOpen(true);
    }

    // change the service type filter of the table, multiple types possible
    const handleChangeServiceType = (event: any) => {
        const value = event.target.value;
        if (value.includes('All Types')) {
            setServiceTypeFilter(['All Types']); // Reset the filter
            setServiceTypeOpen(false); // Close the dropdown
        } else {
            setServiceTypeFilter(typeof value === 'string' ? value.split(',') : value)
        }

        setShowMediaCard(false)
        setPage(0);
    };

    const handleServiceTypeOpen = () => {
        if (serviceTypeFilter.includes('All Types')) {
            setServiceTypeFilter([]);
        }
        setServiceTypeOpen(true);
    }

    // pagination and changing the number of rows displayed in the page
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ): void => {
        setShowMediaCard(false)
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ): void => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset page to zero after row change
    };


    return (
        <div>

            {/*filtering dropdowns, this allows to select multiple service types and/or multiple statuses*/}
            <Box sx={{display: 'flex', marginBottom: 2}}>
                <FormControl style={{width: 300, marginRight: 5}}>
                    <InputLabel id="service-type-label">Filter Service Type</InputLabel>
                    <Select
                        labelId="service-type-label"
                        id="service-type-select"
                        multiple
                        value={serviceTypeFilter}
                        label="Filter Service Type"
                        open={serviceTypeOpen}
                        onOpen={handleServiceTypeOpen}
                        onClose={() => setServiceTypeOpen(false)}
                        onChange={handleChangeServiceType}
                        renderValue={(selected) => selected.join(', ')}
                        fullWidth
                    >
                        <MenuItem value="All Types">All Types (reset filter)</MenuItem>
                        {Object.values(ServiceType).map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl style={{width: 300}}>
                    <InputLabel id="status-label">Filter Status</InputLabel>
                    <Select
                        labelId="status-label"
                        id="status-select"
                        multiple
                        value={statusFilter}
                        label="Filter Status"
                        open={statusOpen}
                        onOpen={handleStatusOpen}
                        onClose={() => setStatusOpen(false)}
                        onChange={handleChangeStatus}
                        renderValue={(selected) => selected.join(', ')}
                        fullWidth
                    >
                        <MenuItem value="All Statuses">All Statuses (reset filter)</MenuItem>
                        {Object.values(statusOptions).filter(type => type !== "All Statuses").map(type => (
                            <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {data.length === 0 ?
                //display placeholder information if there are no matching results
                (
                    <Typography variant="body1">
                        You don't have any matches
                        {statusFilter.length > 0 && !statusFilter.includes('All Statuses') ? (
                            <span> with status <span
                                style={{fontStyle: 'italic'}}>{statusFilter.join(', ').toLowerCase()}</span></span>
                        ) : ''}
                        {/*{serviceTypeFilter === 'ALL' || serviceTypeFilter === ''*/}
                        {serviceTypeFilter.length > 0 && !serviceTypeFilter.includes('All Types') ? (
                            <span> for service type <span
                                style={{fontStyle: 'italic'}}>{serviceTypeFilter.join(', ').toLowerCase()}</span></span>
                        ) : ''}. </Typography>
                ) :
                (
                    // actual table if there are results
                    <>
                        <TableContainer sx={{mb: 4}}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Status
                                        </TableCell>
                                        <TableCell>
                                            {isProvider ? "Requester/Receiver" : "Provider"}
                                        </TableCell>
                                        <TableCell>Appointment Time
                                            {/*tooltip for the "(invalid date")*/}
                                            <Tooltip
                                                title="Invalid appointment time (invalid date) occurs when the request is cancelled, declined or when the provider has required the time to be changed."
                                                placement="top">
                                                <IconButton>
                                                    <InfoIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            {/*how is the table sorted*/}
                                            <Tooltip
                                                title="Tables are sorted by upcoming appointments nearest to today, followed by recent past appointments."
                                                placement="top">
                                                <IconButton>
                                                    <InfoIcon/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {/*the actual data*/}
                                    {data.map((row) => (
                                        <GenericTableRow key={row._id} item={row}
                                                         isProvider={isProvider}
                                                         onViewDetails={onViewDetails}/>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/*pagination*/}
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
                        /> </>
                )
            }
        </div>
    )
        ;
}

export default GenericTable;
