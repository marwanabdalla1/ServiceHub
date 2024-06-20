// This test secret API key is a placeholder. Don't include personal details in requests with this key.
// To see your test secret API key embedded in code samples, sign in to your Stripe account.

import { RequestHandler } from "express";

// You can also find your test secret API key at https://dashboard.stripe.com/test/apikeys.
const stripe = require('stripe')('sk_test_Y17KokhC3SRYCQTLYiU5ZCD2');




export const pay:RequestHandler = async(req, res) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: '{{PRICE_ID}}',
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http:localhost:3000/filter`,
        cancel_url: `http:localhost:3000/don'texit`,
      });
    
      res.redirect(303, session.url);

}