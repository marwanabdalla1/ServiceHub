import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, User} from '../models/Account';
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

function FilterPage() {


  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [filterState, setFilterState] = React.useState({
    type: 'Bike Repair',
    priceRange: [15, 35] as number[],
    locations: [] as string[],
    isLicensed: false,
  });
  console.log(filterState)

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
      <NavigationBar toggleDrawer = {toggleDrawer} />
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
        {users.map((user : User) => (
          <MediaCard key={user.userId} user={user} />
        ))}
        </div>
      </div>
     
     
    </div>
  );
}

export default FilterPage;
