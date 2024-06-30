import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/ProfileCard';
import { DrawerFilter } from '../components/DrawFilter';
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
  //TODO: Implement sorting on client side after fetching data
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>({
    type: '',
    priceRange: [15, 60],
    locations: [],
    isLicensed: undefined, // Set initial state to undefined
  });
  const [offerings, setOfferings] = useState<Account[]>([]);
  const [search, setSearch] = useState<string>("");

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

  return (
    <div>
      <NavigationBar toggleDrawer={toggleDrawer} onChange={handleInputChange} onSearch={handleSearch} search={search} />
      <div>
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
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-lg w-full mx-auto '>
          {offerings.map((offering) => (
            <MediaCard key={offering._id} user={offering} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterPage;
