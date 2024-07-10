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
        priceRange: [15, 60],
        locations: [],
        isLicensed: undefined,
    });
    const [offerings, setOfferings] = useState<ServiceOffering[]>([]);
    const location = useLocation();
    const searchTerm = location.state?.searchTerm ? location.state?.searchTerm : "";
    const [search, setSearch] = useState<string>(searchTerm);
    const [sortKey, setSortKey] = useState<string | null>(null);
    const [profileImages, setProfileImages] = useState<{ [key: string]: string }>({});
    const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // You can adjust this as needed
    const [totalItems, setTotalItems] = useState(0); // To keep track of total items
    const navigate = useNavigate();
    console.log(defaultProfileImage);

    const fetchProfileImage = async (providerId: string) => {
        try {
            const response = await axios.get(`/api/file/profileImage/${providerId}`, {
                responseType: 'blob'
            });
            if (response.status === 200) {
                return URL.createObjectURL(response.data);
            }
        } catch (error) {
            if ((error as any).response && (error as any).response.status === 404) {
                console.log('No profile image found for provider:', providerId);
            } else {
                console.error('Error fetching profile image:', error);
            }
        }
        return defaultProfileImage; // Return default image on error or not found
    };

    const fetchProfileImages = async (offerings: ServiceOffering[]) => {
        const newProfileImages: { [key: string]: string } = {};
        const newLoadingImages: { [key: string]: boolean } = {};
        offerings.forEach(offering => {
            newLoadingImages[offering._id] = true;
        });
        setLoadingImages(newLoadingImages);

        await Promise.all(offerings.map(async (offering) => {
            const imageUrl = await fetchProfileImage(offering.provider._id);
            newProfileImages[offering._id] = imageUrl;
            setProfileImages(prevImages => ({
                ...prevImages,
                [offering._id]: imageUrl,
            }));
            setLoadingImages(prevLoading => ({
                ...prevLoading,
                [offering._id]: false,
            }));
        }));

        setLoading(false);
    };

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
            };

            try {
                const response = await axios.get<{ data: ServiceOffering[], total: number }>('/api/offerings', { params });
                let data = response.data.data;
                const totalItems = response.data.total;
                setTotalItems(totalItems); // Set total items

                const sortOfferings = (offerings: ServiceOffering[]) => {
                    if (sortKey === "priceAsc") {
                        offerings.sort((a, b) => a.hourlyRate - b.hourlyRate);
                    } else if (sortKey === "priceDesc") {
                        offerings.sort((a, b) => b.hourlyRate - a.hourlyRate);
                    } else if (sortKey === "ratingAsc") {
                        offerings.sort((a, b) => a.rating - b.rating);
                    } else if (sortKey === "ratingDesc") {
                        offerings.sort((a, b) => b.rating - a.rating);
                    }
                };

                sortOfferings(data);
                const premiumOfferings = data.filter(offering => offering.provider.isPremium);
                const isFilterDefault = 
                    filterState.type === '' &&
                    filterState.priceRange[0] === 15 &&
                    filterState.priceRange[1] === 60 &&
                    filterState.locations.length === 0 &&
                    filterState.isLicensed === undefined &&
                    sortKey === null;

                if (isFilterDefault) {
                    data = [...premiumOfferings, ...data.filter(offering => !offering.provider.isPremium)];
                } else {
                    const topPremiumOfferings = premiumOfferings.slice(0, 4);
                    const remainingOfferings = data.filter(offering => !topPremiumOfferings.includes(offering));
                    data = [...topPremiumOfferings, ...remainingOfferings];
                }
                setOfferings(data);
                setLoading(false);
                await fetchProfileImages(data);

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
        navigate("/filter");
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(event.target.value);
        navigate("/filter");
    };

    const clearFilters = () => {
        setFilterState({
            type: '',
            priceRange: [15, 60],
            locations: [],
            isLicensed: undefined,
        });
    };

    const handleSortChange = (sortKey: string | null) => {
        console.log('Sort key:', sortKey);
        setSortKey(sortKey);
    };

    const handleApplyFilters = (newFilterState: FilterState) => {
        setFilterState(newFilterState);
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
                ) : (
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
                )}
            </div>
        </div>
    );
}

export default FilterPage;