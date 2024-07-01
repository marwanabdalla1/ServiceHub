import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe('pk_test_51NEdzDChuUsrK8kGX1Wcu8TazsmDPprhV212alFOg78GS9W3FW8JLv1S6FyJnirCaj4f5UevhfUetfDSxIvATSHp003QYXNJYT'); 

const BecomeProPage = () => {
  const {token, account} = useAuth();
  const userid = account?._id;
console.log(token)
  const handleJoinNow = async () => {
    try {
     
      const response = await axios.post('/api/becomepro/payment', 
        {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
    });
      const sessionId = response.data.id;
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error:', error.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center mt-4'>
      <div className="w-3/4 flex flex-col rounded md:flex-row items-center bg-customGreen pl-8">
        <div className="text-left">
          <h1 className="text-4xl font-bold mb-4">ServiceHub: Connecting You to the Best, for All Your Needs!</h1>
          <BlackButton className="py-2" text="Join Now" onClick={handleJoinNow} />
        </div>
        <div className="md:mt-0 mr-0">
          <img src="/images/handshake.png" alt="Handshake" className="w-full" />
        </div>
      </div>
    </div>
  );
};

export default BecomeProPage;
