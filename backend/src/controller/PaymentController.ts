import { RequestHandler } from 'express';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe('sk_test_51NEdzDChuUsrK8kGQ9QPN6Zj7mmOI9j61k2q6vCfuDU0cYdf3nn4RGK1uzVZg37iCmrZrODQYzIoagswEbSDZ5J0000jHIY5Nq', {
  apiVersion: '2024-04-10', // Use the appropriate API version
});

export const pay: RequestHandler = async (req, res) => {
  try {
    console.log('Creating checkout session for client reference ID:', req.body.client_reference_id);
    const session = await stripe.checkout.sessions.create({
      client_reference_id: req.body.client_reference_id,
      line_items: [
        {
          price: 'price_1PTqhyChuUsrK8kGBZRIWqab',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3000/filter', // Corrected URL
      cancel_url: 'http://localhost:3000/dontexit', // Corrected URL
    });
    console.log('Checkout session created for client reference ID:', req.body.client_reference_id);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Example fulfillment function (you need to implement the actual logic)
const fulfillOrder = (lineItems: Stripe.LineItem[]) => {
  // Your order fulfillment logic here
  console.log('Fulfilling order with items:', lineItems);
};

const becomePro = () => {
  console.log('Becoming Pro');
};

// Webhook endpoint to handle events from Stripe
export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const endpointSecret = 'whsec_e4288e0ddca69894ef6e5a36c76cd72a81db96434dd98b78a87812094cecde30';

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error('Missing stripe-signature header');
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Webhook signature verification failed:', err.message);
    } else {
      console.error('Unknown error occurred during webhook signature verification');
    }
    return res.status(400).send('Webhook Error');
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      console.log('Checkout session complete with customer id:', sessionWithLineItems.client_reference_id);
      becomePro();
      break;
    // Handle other event types as needed
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
