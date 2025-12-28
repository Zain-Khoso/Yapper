// Lib Imports.
import Stripe from 'stripe';

// Local Imports.
import { schema_URL } from '../utils/validations.js';
import { serializeResponse } from '../utils/serializers.js';
import User from '../models/user.model.js';

// Constants.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const checkout_items = [
  {
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Yapper Gold',
        description: 'One-time payment for lifetime access to yapper Gold features.',
      },
      unit_amount: 500,
    },
    quantity: 1,
  },
];

async function checkout(req, res) {
  const user = req.user;

  // Working body data.
  const { success_url, cancel_url } = req.body;

  const result_SuccessURL = schema_URL.safeParse(success_url);
  const result_CancelURL = schema_URL.safeParse(cancel_url);
  if (!result_SuccessURL.success || !result_CancelURL.success) {
    return res
      .status(400)
      .json(serializeResponse({}, { root: 'Success or Cancel URL is invalid.' }));
  }

  // Creating an Stripe Checkout session.
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    metadata: {
      userId: user.id,
      plan: 'gold',
    },
    success_url,
    cancel_url,
    customer_email: user.email,
    line_items: checkout_items,
  });

  res.status(200).json(serializeResponse({ url: session.url }));
}

// STRIPE WEBHOOKS USE RAW REQUESTS. SO AVIOD USING EXPRESS SPECIFIC SYNTAX (on "req").
async function stripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];
  let event;

  // Extracting Stripe Event.
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('\nStripe Webhook Error: ', err, '\n');

    return res.status(400).json(serializeResponse({}, { root: 'Something went wrong.' }));
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;

    await User.update({ plan: 'gold' }, { where: { id: userId } });

    console.log(`\nUser ${userId}: Upgraded to Gold Plan.\n`);
  }

  res.status(200).json();
}

export { checkout, stripeWebhook };
