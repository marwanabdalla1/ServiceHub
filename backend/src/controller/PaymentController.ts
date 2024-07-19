import {RequestHandler} from 'express';
import Stripe from 'stripe';
import Account from '../models/account';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || ''
);

/**
 * Create a new checkout session for the client
 * @param req
 * @param res
 */
export const pay: RequestHandler = async (req, res) => {
    try {
        const clientId = (req as any).user.userId;
        const account = await Account.findById(clientId);
        if (!account) {
            return res.status(404).json({message: 'Account not found'});
        }
        let customer;

        if (account.stripeId) {
            customer = await stripe.customers.retrieve(account.stripeId);
        } else {
            customer = await stripe.customers.create({email: account.email});
            account.stripeId = customer.id;
            await account.save();
        }

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            line_items: [
                {
                    price: 'price_1PeB1CChuUsrK8kGDpmrWOhN',
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: 'http://localhost:3000/setprofile',
            cancel_url: 'http://localhost:3000/failedpayment',
        });

        console.log('Checkout session created for customer email:', account.email);
        res.json({id: session.id, url: session.url});
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Update the account to premium
 * @param clientId
 */
const becomePro = async (clientId: string) => {
    try {
        await Account.findByIdAndUpdate(clientId, {isPremium: true});
    } catch (err) {
        console.error('Error updating account to premium:', err);
    }
};

/**
 * Get subscription data for the client
 * @param req
 * @param res
 */
export const getSubscriptionData: RequestHandler = async (req, res) => {
    const clientId = (req as any).user.userId;
    const account = await Account.findById(clientId);
    if (!account) {
        return res.status(404).json({message: 'Account not found'});
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

/**
 * Cancel the subscription for the client
 * @param req
 * @param res
 */
export const cancelSubscription: RequestHandler = async (req, res) => {
    const clientId = (req as any).user.userId;
    const account = await Account.findById(clientId);
    if (!account) {
        return res.status(404).json({message: 'Account not found'});
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
        res.json({message: 'Subscription cancelled successfully'});
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Handle incoming stripe webhook events
 * @param req
 * @param res
 */
export const handleStripeWebhook: RequestHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
        if (!sig) throw new Error('Missing stripe-signature header');
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret || '');
    } catch (err) {
        if (err instanceof Error) {
            console.error('Webhook signature verification failed:', err.message);
        } else {
            console.error('Unknown error occurred during webhook signature verification');
        }
        return res.status(400).send('Webhook Error');
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as Stripe.Checkout.Session;
            const customer = await stripe.customers.retrieve(session.customer as string);
            const stripeId = customer.id;
            console.log('Checkout session completed for customer:', stripeId);
            if (stripeId) {
                const account = await Account.findOne({stripeId});
                if (account) {
                    await becomePro(account.id);
                }
            }
            break;
        case 'invoice.payment_succeeded':
            const invoice = event.data.object as Stripe.Invoice;
            console.log('Payment succeeded for invoice:', invoice.id);
            break;
        case 'invoice.payment_failed':
            const failedInvoice = event.data.object as Stripe.Invoice;
            console.log('Payment failed for invoice:', failedInvoice.id);
            break;
        default:
            console.warn(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
};

