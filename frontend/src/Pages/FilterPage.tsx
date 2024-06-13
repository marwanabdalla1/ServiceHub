import React, { useState } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, Account as User} from '../models/Account';
import { DrawerFilter } from './DrawFilter';
import { searchServices, searchServicesBackEnd } from '../components/SearchFunction';
import {useNavigate} from "react-router-dom";

function FilterPage() {


  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [filterState, setFilterState] = React.useState({
    type: 'Bike Repair',
    priceRange: [15, 35] as number[],
    locations: [] as string[],
    isLicensed: false,
  });
  console.log(filterState);

  const navigate = useNavigate();
  const [search, setSearch] = useState<string>("");

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  const handlePriceChange = (newValue: number[]) => {
    setFilterState((prevState) => ({
      ...prevState,
      priceRange: newValue,
    }));
  };

  const handleLocationChange = (value: string[]) => {
    setFilterState((prevState) => ({
      ...prevState,
      locations: value,
    }));
  };

  const handleTypeChange = (value: string) => {
    setFilterState((prevState) => ({
      ...prevState,
      type: value,
    }));
  };

  const handleLicensedChange = (value: boolean) => {
    setFilterState((prevState) => ({
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

  const combineFilterAndSearch = (users: User[], filter: {
    type: string,
    priceRange: number[],
    locations: string[],
    isLicensed: Boolean,
  },  search: string) => {
    console.log(searchServicesBackEnd(filterState, search));
    return searchServices(users, filterState, search);
   };

  const clearFilters = () => {
    setFilterState({
      type: '',
      priceRange: [15, 35],
      locations: [],
      isLicensed: false,
    });
  };
  return (
    <div>
      <NavigationBar toggleDrawer = {toggleDrawer} onChange = {handleInputChange} onSearch = {handleSearch} search={search} />
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
      {((search.trim() === ''   ) ? users : combineFilterAndSearch(users, filterState, search)).map((user: User) => (
        <MediaCard key={user.id} user={user} />
      ))}
    </div>
      </div>
     
     
    </div>
  );
}

export default FilterPage;
