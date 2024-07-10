import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import { DrawerFilter } from '../components/DrawFilter';
import Sort from '../components/Sort';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Account } from '../models/Account';
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
    const [offerings, setOfferings] = useState<Account[]>([]);
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

    const fetchProfileImage = async (account: Account) => {
        try {
            const response = await axios.get(`/api/file/profileImage/${account._id}`, {
                responseType: 'blob'
            });
            if (response.status === 200) {
                return URL.createObjectURL(response.data);
            }
        } catch (error) {
            if ((error as any).response && (error as any).response.status === 404) {
                console.log('No profile image found for account:', account._id);
            } else {
                console.error('Error fetching profile image:', error);
            }
        }
        return defaultProfileImage; // Return default image on error or not found
    };

    const fetchProfileImages = async (accounts: Account[]) => {
        const newProfileImages: { [key: string]: string } = {};
        const newLoadingImages: { [key: string]: boolean } = {};
        accounts.forEach(account => {
            newLoadingImages[account._id] = true;
        });
        setLoadingImages(newLoadingImages);

        await Promise.all(accounts.map(async (account) => {
            const imageUrl = await fetchProfileImage(account);
            newProfileImages[account._id] = imageUrl;
            setProfileImages(prevImages => ({
                ...prevImages,
                [account._id]: imageUrl,
            }));
            setLoadingImages(prevLoading => ({
                ...prevLoading,
                [account._id]: false,
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
                const response = await axios.get<{ data: Account[], total: number }>('/api/offerings', { params });
                let data = response.data.data;
                const totalItems = response.data.total;
                setTotalItems(totalItems); // Set total items

                const sortAccounts = (accounts: Account[]) => {
                    if (sortKey === "priceAsc") {
                        accounts.sort((a, b) => {
                            const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
                            const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
                            return aRate - bRate;
                        });
                    } else if (sortKey === "priceDesc") {
                        accounts.sort((a, b) => {
                            const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
                            const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
                            return bRate - aRate;
                        });
                    } else if (sortKey === "ratingAsc") {
                        accounts.sort((a, b) => {
                            const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
                            const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
                            return aRating - bRating;
                        });
                    } else if (sortKey === "ratingDesc") {
                        accounts.sort((a, b) => {
                            const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
                            const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
                            return bRating - aRating;
                        });
                    }
                };

                sortAccounts(data);
                const premiumAccounts = data.filter(account => account.isPremium);
                const isFilterDefault = 
                    filterState.type === '' &&
                    filterState.priceRange[0] === 15 &&
                    filterState.priceRange[1] === 60 &&
                    filterState.locations.length === 0 &&
                    filterState.isLicensed === undefined &&
                    sortKey === null;

                if (isFilterDefault) {
                    data = [...premiumAccounts, ...data.filter(account => !account.isPremium)];
                } else {
                    const topPremiumAccounts = premiumAccounts.slice(0, 4);
                    const remainingAccounts = data.filter(account => !topPremiumAccounts.includes(account));
                    data = [...topPremiumAccounts, ...remainingAccounts];
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
                                <MediaCard key={offering._id} user={offering}
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
