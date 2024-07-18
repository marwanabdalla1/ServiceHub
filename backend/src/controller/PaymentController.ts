/* eslint-disable no-case-declarations */
import { RequestHandler } from 'express';
import Stripe from 'stripe';
import Account from '../models/account';

const stripe = new Stripe('sk_test_51NEdzDChuUsrK8kGQ9QPN6Zj7mmOI9j61k2q6vCfuDU0cYdf3nn4RGK1uzVZg37iCmrZrODQYzIoagswEbSDZ5J0000jHIY5Nq', {
  apiVersion: '2024-04-10', 
});

//This is an endpoint that reidcts the user to the stripe checkout page
export const pay: RequestHandler = async (req, res) => {
  try {
    const clientId = (req as any).user.userId;
    // Call MongoDB to get the email of the user
    const account = await Account.findById(clientId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    let customer;

    if (account.stripeId) {
      // Retrieve the existing Stripe customer
      customer = await stripe.customers.retrieve(account.stripeId);
    } else {
      // Create a new Stripe customer
      customer = await stripe.customers.create({ email: account.email });
      // Save the Stripe customer ID in the account
      account.stripeId = customer.id;
      await account.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: 'price_1PWIQIChuUsrK8kGzhPiet6K', 
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:3000/setprofile', 
      cancel_url: 'http://localhost:3000/failedpayment',
    });

    console.log('Checkout session created for customer email:', account.email);
    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('Internal Server Error');
  }
};

//This is a webhook that is called when the user has successfully paid for the subscription to become premium
const becomePro = async (clientId: string) => {
  try {
    // Update the account in your database to mark it as a premium user
    await Account.findByIdAndUpdate(clientId, { isPremium: true });
  } catch (err) {
    console.error('Error updating account to premium:', err);
  }
};

// New endpoint to return subscription data based on client ID
export const getSubscriptionData: RequestHandler = async (req, res) => {
  const clientId = (req as any).user.userId;
  // Call MongoDB to get the email of the user
  const account = await Account.findById(clientId);
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const stripeId = account.stripeId;
  if (!stripeId) {
    return res.status(404).send('Customer not found');
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeId,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).send('No subscriptions found for customer');
    }

    res.json(subscriptions.data);
  } catch (error) {
    console.error('Error retrieving subscription data:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Webhook Endpoint to cancel subscription based on client ID
export const cancelSubscription: RequestHandler = async (req, res) => {
  const clientId = (req as any).user.userId;
  // Call MongoDB to get the email of the user
  const account = await Account.findById(clientId);
  if (!account) {
    return res.status(404).json({ message: 'Account not found' });
  }

  const stripeId = account.stripeId;
  if (!stripeId) {
    return res.status(404).send('Customer not found');
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeId,
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).send('No subscriptions found for customer');
    }

    const subscriptionId = subscriptions.data[0].id;
    await stripe.subscriptions.cancel(subscriptionId);
    console.log('Subscription cancelled for customer ID:', stripeId);
    account.isPremium = false;
    await account.save();
    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Webhook endpoint to handle events from Stripe
export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const endpointSecret = 'whsec_a355678d4fb8d4cfc9905764307fd1e29bfbb428e53602b67e9dde8f4ef79fd1';
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
      const customer = await stripe.customers.retrieve(session.customer as string);
      const stripeId = customer.id;
      console.log('Checkout session completed for customer:', stripeId);
      if (stripeId) {
        const account = await Account.findOne({ stripeId });
        if (account) {
          await becomePro(account.id);
        }
      }
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      console.log('Payment succeeded for invoice:', invoice.id);
      // Handle successful payment for subscription
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      console.log('Payment failed for invoice:', failedInvoice.id);
      // Handle failed payment for subscription
      break;
    // Handle other event types as needed
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
