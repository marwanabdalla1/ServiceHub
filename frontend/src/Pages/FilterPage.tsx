import React, {useState, useEffect} from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import {DrawerFilter} from '../components/DrawFilter';
import Sort from '../components/Sort';
import {useLocation, useNavigate} from "react-router-dom";
import axios from 'axios';
import {Account} from '../models/Account';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface FilterState {
    type: string;
    priceRange: number[];
    locations: string[];
    isLicensed?: boolean;
}

function FilterPage() {
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
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();


    const fetchProfileImages = async (accounts: Account[]) => {
        const newProfileImages: { [key: string]: string } = {};
        await Promise.all(accounts.map(async (account) => {

            await axios.get(`/api/file/profileImage/${account._id}`, {
                responseType: 'blob'
            }).then((response) => {
                if (response.status === 200) {
                    newProfileImages[account._id] = URL.createObjectURL(response.data);
                }
                return response;
            }).catch((error) => {
                if (error.response.status === 404) {
                    console.log('No profile image found for account:', account._id);
                } else {
                    console.error('Error fetching profile image:', error);
                }
            });
            setProfileImages(newProfileImages);
            setLoading(false);
        }));

    }

    useEffect(() => {
        const fetchAndSortOfferings = async () => {
            setLoading(true);
            const params = {
                type: filterState.type,
                priceRange: filterState.priceRange.join(','),
                locations: filterState.locations.join(','),
                isLicensed: filterState.isLicensed,
                searchTerm: search,
            };

            try {
                const response = await axios.get<Account[]>('/api/offerings', {params});
                let data = response.data;

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
                fetchProfileImages(data).then(r => console.log('Profile images fetched'));

            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchAndSortOfferings();
    }, [filterState, search, sortKey]);



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

    return (
        <div>
            <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch}
                           search={search} setSearch={setSearch}/>
            <div className='flex-col items-center'>
                <DrawerFilter
                    openDrawer={isDrawerOpen}
                    toggleDrawer={toggleDrawer}
                    filterState={filterState}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={clearFilters}
                />
                <Sort onSortChange={handleSortChange}/>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                        <CircularProgress/>
                    </Box>
                ) : (
                    <div
                        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto bg-slate-50 max-w-screen-2xl'>
                        {offerings.map((offering) => (
                            <MediaCard key={offering._id} user={offering}
                                       profileImageUrl={profileImages[offering._id] || null}/>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FilterPage;
