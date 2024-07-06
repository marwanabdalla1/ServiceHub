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

interface FilterState {
  type: string;
  priceRange: number[];
  locations: string[];
  isLicensed?: boolean; // Allow it to be undefined
}

function FilterPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    type: '',
    priceRange: [15, 60],
    locations: [],
    isLicensed: undefined, // Set initial state to undefined
  });
  const [offerings, setOfferings] = useState<Account[]>([]);
  const location = useLocation();
  const searchTerm = location.state?.searchTerm ? location.state?.searchTerm : "";
  const [search, setSearch] = useState<string>(searchTerm);
  const [sortKey, setSortKey] = useState<string | null>(null); // Initialize to null
  const [profileImages, setProfileImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const fetchOfferings = () => {
    setLoading(true);
    const params = {
      type: filterState.type,
      priceRange: filterState.priceRange.join(','),
      locations: filterState.locations.join(','),
      isLicensed: filterState.isLicensed,
      searchTerm: search,
    };

    axios.get<Account[]>('/api/offerings', { params })
      .then(response => {
        setOfferings(response.data);
        fetchProfileImages(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false even if there's an error
      });
  };

  const fetchProfileImages = async (accounts: Account[]) => {
    const newProfileImages: { [key: string]: string } = {};

    await Promise.all(accounts.map(async (account) => {
      try {
        const profileImageResponse = await axios.get(`/api/file/profileImage/${account._id}`, {
          responseType: 'blob'
        });

        if (profileImageResponse.status === 200) {
          newProfileImages[account._id] = URL.createObjectURL(profileImageResponse.data);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    }));

    setProfileImages(newProfileImages);
    setLoading(false); // Set loading to false after images are fetched
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
      };

      try {
        const response = await axios.get<Account[]>('/api/offerings', { params });
        let data = response.data;

        // Sorting function
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

        // Apply sorting to the data
        sortAccounts(data);

        // Collect all premium accounts after sorting
        const premiumAccounts = data.filter(account => account.isPremium);

        // Check if filter and sort parameters are set
        const isFilterDefault = 
          filterState.type === '' && 
          filterState.priceRange[0] === 15 && 
          filterState.priceRange[1] === 60 && 
          filterState.locations.length === 0 && 
          filterState.isLicensed === undefined &&
          sortKey === null;

        if (isFilterDefault) {
          // If filter and sort parameters are not set, place all premium accounts at the top
          data = [...premiumAccounts, ...data.filter(account => !account.isPremium)];
        } else {
          // Select the first 4 premium accounts
          const topPremiumAccounts = premiumAccounts.slice(0, 4);

          // Remove the selected premium accounts from the original list to avoid duplication
          const remainingAccounts = data.filter(account => !topPremiumAccounts.includes(account));

          // Combine the top premium accounts with the remaining accounts
          data = [...topPremiumAccounts, ...remainingAccounts];
        }

        setOfferings(data);
        fetchProfileImages(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchAndSortOfferings();
  }, [filterState, search, sortKey]); // Depend on filterState, search, and sortKey

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handlePriceChange = (newValue: number[]) => {
    setFilterState(prevState => ({
      ...prevState,
      priceRange: newValue,
    }));
  };

  const handleLocationChange = (value: string[]) => {
    setFilterState(prevState => ({
      ...prevState,
      locations: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFilterState(prevState => ({
      ...prevState,
      type: value,
    }));
  };

  const handleLicensedChange = (value?: boolean) => {
    setFilterState(prevState => ({
      ...prevState,
      isLicensed: value,
    }));
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
      isLicensed: undefined, // Reset to undefined
    });
  };

  const handleSortChange = (sortKey: string | null) => { // Updated type
    console.log('Sort key:', sortKey);
    setSortKey(sortKey);
  };

  return (
    <div>
      <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch} search={search} setSearch={setSearch} />
      <div className='flex-col items-center'>
        <DrawerFilter
          openDrawer={isDrawerOpen}
          toggleDrawer={toggleDrawer}
          filterState={filterState}
          onPriceChange={handlePriceChange}
          onLocationChange={handleLocationChange}
          onTypeChange={handleTypeChange}
          onLicensedChange={handleLicensedChange}
          onClearFilters={clearFilters}
        />
        <Sort onSortChange={handleSortChange} />
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-auto bg-slate-50 max-w-screen-2xl'>
            {offerings.map((offering) => (
              <MediaCard key={offering._id} user={offering} profileImageUrl={profileImages[offering._id] || null} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterPage;
