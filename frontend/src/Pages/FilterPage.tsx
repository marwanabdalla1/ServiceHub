import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import { DrawerFilter } from '../components/DrawFilter';
import Sort from '../components/Sort';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { ServiceOffering } from '../models/ServiceOffering';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Pagination } from '../components/Pagination';
import { fetchProfileImagesForServiceOffering } from "../services/fetchProfileImage";
import {Typography} from "@mui/material";
import BlackButton from "../components/inputs/blackbutton"; // Import from the new file
import OutletIcon from '@mui/icons-material/Outlet';


interface FilterState {
    type: string;
    priceRange: number[];
    locations: string[];
    isLicensed?: boolean;
}

function FilterPage() {
    const defaultProfileImage = '/images/default-profile.png'; // Use relative path for public folder

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filterState, setFilterState] = useState<FilterState>({
        type: '',
        priceRange: [0, 9999],
        locations: [],
        isLicensed: undefined,
    });
    const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
    const location = useLocation();
    const searchTerm = location.state?.searchTerm || ""; // Use empty string if searchTerm is not provided
    const [search, setSearch] = useState<string>(searchTerm);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [profileImages, setProfileImages] = useState<{ [key: string]: string }>({});
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // You can adjust this as needed
    const [totalItems, setTotalItems] = useState(0); // To keep track of total items
    const navigate = useNavigate();
    console.log(defaultProfileImage);

    useEffect(() => {
        const fetchAndSortOfferings = async () => {
            setLoading(true);
            const params = {
                type: filterState.type,
                priceRange: filterState.priceRange.join(','),
                locations: filterState.locations.join(','),
                isLicensed: filterState.isLicensed,
                searchTerm: search,
                page: currentPage,
                limit: itemsPerPage,
                sortKey, 
            };

            try {
                const response = await axios.get<{ data: ServiceOffering[], total: number }>('/api/offerings', { params });
                const data = response.data.data;
                const totalItems = response.data.total;
                setTotalItems(totalItems); // Set total items

                setOfferings(data);
                setLoading(false);
                await fetchProfileImagesForServiceOffering(data, setProfileImages, setLoadingImages, setLoading);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchAndSortOfferings();
    }, [filterState, search, sortKey, currentPage]); // Add currentPage to dependency array

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        navigate("/filter", { state: { searchTerm: search } });
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilterState({
            type: '',
            priceRange: [15, 60],
            locations: [],
            isLicensed: undefined,
        });
        setSearch("");
        setCurrentPage(1);
    };

    const handleSortChange = (sortKey: string | null) => {
        console.log('Sort key:', sortKey);
        setSortKey(sortKey);
    };

    const handleApplyFilters = (newFilterState: FilterState) => {
        setFilterState(newFilterState);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch}
                           search={search} setSearch={setSearch} />
            <div className='flex-col items-center'>
                <DrawerFilter
                    openDrawer={isDrawerOpen}
                    toggleDrawer={toggleDrawer}
                    filterState={filterState}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={clearFilters}
                />
                <Sort onSortChange={handleSortChange} />
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                        <CircularProgress />
                    </Box>
                ) : offerings.length > 0 ? (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto bg-slate-50 max-w-screen-2xl'>
                            {offerings.map((offering) => (
                                <MediaCard key={offering._id} offering={offering}
                                           profileImageUrl={profileImages[offering._id] || defaultProfileImage}
                                           loading={loadingImages[offering._id]} />
                            ))}
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (

                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" minHeight="70vh" maxWidth='40vw' mt={4} mx="auto">
                        <OutletIcon sx={{mb: 2, fontSize: 80}}></OutletIcon>
                        <Typography variant="h4" textAlign="center" sx={{mb: 5}}>
                            Oh no, it looks like we couldn't find any service offerings matching your criteria!
                        </Typography>
                        <BlackButton text ='Explore All Our Offerings' onClick={clearFilters} sx={{marginRight: "1rem", fontSize:'20px', padding: "1rem 1rem"}} />
                    </Box>
                )
                // ) : (
                //     <>
                //         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto bg-slate-50 max-w-screen-2xl'>
                //             {offerings.map((offering) => (
                //                 <MediaCard key={offering._id} offering={offering}
                //                            profileImageUrl={profileImages[offering._id] || defaultProfileImage}
                //                            loading={loadingImages[offering._id]} />
                //             ))}
                //         </div>
                //         <Pagination
                //             currentPage={currentPage}
                //             totalItems={totalItems}
                //             itemsPerPage={itemsPerPage}
                //             onPageChange={handlePageChange}
                //         />
                //     </>
                // )
                }
            </div>
        </div>
    );
}

export default FilterPage;
