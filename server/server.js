const express = require('express');
const app = express();
const { resolve } = require('path');
// Replace if using a different env file or config
const env = require('dotenv').config({ path: './.env' });
var bodyParser = require('body-parser')


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27',
  appInfo: { // For sample support and debugging, not required for production:
    name: "stripe-samples/<your-sample-name>",
    version: "0.0.1",
    url: "https://github.com/stripe-samples"
  }
});

app.use(express.static(process.env.STATIC_DIR));
app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith('/webhook')) {
        req.rawBody = buf.toString();
      }
    }
  })
);


app.post('/create-payment-intent', async (req, res) => {

  const { paymentMethodType, currency } = req.body;


  try {

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1999,
      currency: currency,
      payment_method_types: [paymentMethodType]

    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (e) {

    res.status(400).json({ error: { message: e.message } });

  }

});



app.get('/', (req, res) => {
  const path = resolve(process.env.STATIC_DIR + '/index.html');
  res.sendFile(path);
});



// #1 Endpoint

app.get('/config', (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// Expose a endpoint as a webhook handler for asynchronous events.
// Configure your webhook in the stripe developer dashboard
// https://dashboard.stripe.com/test/webhooks



app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

// webhookSecret is not defined 

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.log(`Error message: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.created') {
      const paymentIntent = event.data.object;
      console.log(` [${event.id}] PaymentIntent (${paymentIntent.id}): ${paymentIntent.status}`);
    }


    res.json({ received: true });
  }
);

app.listen(4242, () => console.log(`Node server listening at http://localhost:4242`));
