import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import { Link } from 'react-router-dom';
const BecomeProPage = () => {
  return (
    <div className='flex flex-col items-center justify-center mt-4'>
    <div className="w-3/4 flex flex-col rounded md:flex-row items-center bg-customGreen pl-8">
      <div className="text-left">
        <h1 className="text-4xl font-bold mb-4">ServiceHub: Connecting You to the Best, for All Your Needs!</h1>
          <BlackButton className="py-2" text="Join Now" onClick={() => console.log('Black button pressed')} />
      </div>
      <div className="md:mt-0 mr-0">
        <img src="/images/handshake.png" alt="Handshake" className="w-full" />
      </div>
    </div>
  
   
  </div>
  
  );
}

export default BecomeProPage;
