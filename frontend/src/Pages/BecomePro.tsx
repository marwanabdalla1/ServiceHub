import React from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import BlackButton from '../components/inputs/blackbutton';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const stripePromise = loadStripe('pk_test_51NEdzDChuUsrK8kGX1Wcu8TazsmDPprhV212alFOg78GS9W3FW8JLv1S6FyJnirCaj4f5UevhfUetfDSxIvATSHp003QYXNJYT'); 

const BecomeProPage = () => {
  const { token, account } = useAuth();
  const userid = account?._id;
  console.log(token);

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

  const reviews = [
    {
      name: 'Mattias Gleisberg',
      location: 'Munich',
      date: 'March 3, 2024',
      title: 'Absolutely worth it',
      content: 'Signing up for the Pro membership has been a game-changer for my freelance plumbing service. My profile now pops up at the top when potential clients search for designers. I\'ve seen a 40% increase in inquiries, and it\'s only been three months!'
    },
    {
      name: 'Michelle Jackson',
      location: 'United States',
      date: 'May 12, 2023',
      title: 'Awesome Service!',
      content: 'I was initially skeptical about upgrading to Pro, but the results speak for themselves. Since my profile started appearing at the top of search results, I\'ve been contacted by more students than ever before. It\'s made it much easier to expand my tutoring services into new subjects.'
    }
  ];

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
      {/* Review Section */}
      <div className="w-3/4 mt-8">
        <h2 className="text-3xl font-bold mb-4">What Our Pro Members Say</h2>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          {reviews.map((review, index) => (
            <div className="mb-4" key={index}>
              <h3 className="font-semibold">{review.name}</h3>
              <p className="text-sm text-gray-600">Reviewed in {review.location} on {review.date}</p>
              <p className="mt-2">{review.title}</p>
              <p className="text-gray-700">{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BecomeProPage;
