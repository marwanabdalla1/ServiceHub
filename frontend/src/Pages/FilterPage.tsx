import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import { DrawerFilter } from '../components/DrawFilter';
import Sort from '../components/Sort';
import { useNavigate } from "react-router-dom";
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
  const [sortedOfferings, setSortedOfferings] = useState<Account[]>([]);
  const [search, setSearch] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("priceAsc");
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
    fetchOfferings();
  }, [filterState, search]);

  useEffect(() => {
    let sortedData = [...offerings];

    // Function to shuffle an array
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Collect all premium accounts
    const premiumAccounts = sortedData.filter(account => account.isPremium);

    // Select 4 random premium accounts
    const topPremiumAccounts = shuffleArray(premiumAccounts).slice(0, 4);

    // Remove the selected premium accounts from the original list to avoid duplication
    const remainingAccounts = sortedData.filter(account => !topPremiumAccounts.includes(account));

    // Sorting the remaining accounts based on the selected sort key
    if (sortKey === "priceAsc") {
      remainingAccounts.sort((a, b) => {
        const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
        const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
        return aRate - bRate;
      });
    } else if (sortKey === "priceDesc") {
      remainingAccounts.sort((a, b) => {
        const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
        const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
        return bRate - aRate;
      });
    } else if (sortKey === "ratingAsc") {
      remainingAccounts.sort((a, b) => {
        const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
        const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
        return aRating - bRating;
      });
    } else if (sortKey === "ratingDesc") {
      remainingAccounts.sort((a, b) => {
        const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
        const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
        return bRating - aRating;
      });
    }

    // Combine the top premium accounts with the sorted remaining accounts
    let combinedAccounts = [...topPremiumAccounts, ...remainingAccounts];

    setSortedOfferings(combinedAccounts);
  }, [sortKey, offerings]);

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

  const handleSortChange = (sortKey: string) => {
    setSortKey(sortKey);
  };
//TODO: Add if the filter, sort or search is empty then display all the premium accounts "Promoted"
  return (
    <div>
      <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch} search={search} />
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
            {sortedOfferings.map((offering) => (
              <MediaCard key={offering._id} user={offering} profileImageUrl={profileImages[offering._id] || null} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FilterPage;
