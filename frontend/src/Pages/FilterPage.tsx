import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import { DrawerFilter } from '../components/DrawFilter';
import Sort from '../components/Sort'; 
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Account } from '../models/Account';

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

  const navigate = useNavigate();

  const fetchOfferings = () => {
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
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchOfferings();
  }, [filterState, search]);

  useEffect(() => {
    let sortedData = [...offerings];
    if (sortKey === "priceAsc") {
      sortedData.sort((a, b) => {
        const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
        const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
        return aRate - bRate;
      });
    } else if (sortKey === "priceDesc") {
      sortedData.sort((a, b) => {
        const aRate = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].hourlyRate : 0;
        const bRate = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].hourlyRate : 0;
        return bRate - aRate;
      });
    } else if (sortKey === "ratingAsc") {
      sortedData.sort((a, b) => {
        const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
        const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
        return aRating - bRating;
      });
    } else if (sortKey === "ratingDesc") {
      sortedData.sort((a, b) => {
        const aRating = a.serviceOfferings.length > 0 ? a.serviceOfferings[0].rating : 0;
        const bRating = b.serviceOfferings.length > 0 ? b.serviceOfferings[0].rating : 0;
        return bRating - aRating;
      });
    }
    setSortedOfferings(sortedData);
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

  return (
    <div>
      <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch} search={search} />
      <div className='flex-col justify-center'>
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
        <div className="flex justify-center "> {/* Flex container for alignment */}
          <Sort onSortChange={handleSortChange} />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-lg w-full mx-auto '>
          {sortedOfferings.map((offering) => (
            <MediaCard key={offering._id} user={offering} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterPage;
