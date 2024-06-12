import React from 'react';
import NavigationBar from '../components/Navbar';
import MediaCard from '../components/Card';
import {users, Account as User} from '../models/Account';


function FilterPage() {
  return (
    <div>
      {/* <NavigationBar /> */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-lg w-full mx-auto '>
      {users.map((user : User) => (
        <MediaCard key={user.id} user={user} />
      ))}
      </div>
     
    </div>
  );
}

export default FilterPage;
