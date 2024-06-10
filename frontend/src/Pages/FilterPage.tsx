import React, { useState } from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, Account as User} from '../models/Account';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { DrawerFilter } from './DrawFilter';
import { searchServices, searchServicesBackEnd } from '../components/SearchFunction';
import {useNavigate} from "react-router-dom";
import { Typography } from '@mui/material';

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

  /*const combineFilterAndSearch = (users: User[], filter: {
    type: string,
    priceRange: number[],
    locations: string[],
    isLicensed: boolean,
  }, search: string) => {
    console.log(searchServicesBackEnd(filter, search));

    
  
   // Apply filters first
    let filteredUsers = users.filter(user => {
      const matchesType = filter.type 
        ? user.serviceOfferings.some(offering => offering.serviceType === filter.type)
        : true;
  
      const matchesPrice = user.serviceOfferings.some(offering => 
        offering.hourlyRate >= filter.priceRange[0] && offering.hourlyRate <= filter.priceRange[1]
      );
  
      const matchesLocation = filter.locations.length > 0 
        ? user.serviceOfferings.some(offering => offering.location && filter.locations.includes(offering.location))
        : true;
  
      const matchesLicensed = filter.isLicensed 
        ? user.serviceOfferings.some(offering => offering.isCertified === filter.isLicensed)
        : true;
  
      return matchesType && matchesPrice && matchesLocation && matchesLicensed;
    });
  
    // Apply search if search term is not empty
    if (search.trim()) {
      filteredUsers = filteredUsers.filter(user => {
        return user.firstName.toLowerCase().includes(search.toLowerCase()) ||
                user.lastName.toLowerCase().includes(search.toLowerCase()) ||
                user.serviceOfferings.some(offering => offering.serviceType.includes(search.toLowerCase())) ||
               user.location?.toLowerCase().includes(search.toLowerCase())
      });
    }

    return filteredUsers;
  };
    */

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
