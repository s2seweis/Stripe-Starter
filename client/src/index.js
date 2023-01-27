import React from 'react'
import ReactDOM from 'react-dom'


import App from './App'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'

(async () => {
  const {publishableKey} = await fetch('/config').then(r => r.json())
  const stripePromise = loadStripe(publishableKey)

  ReactDOM.render(
    <React.StrictMode>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>

{/* <h1>Hi Stripe Devs!</h1> */}

    </React.StrictMode>,
    document.getElementById('root')
  );

})()