import React from 'react'
import ReactDOM from 'react-dom'


import App from './App'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'

(async () => {
  const {publishableKey} = await fetch('/config').then(r => r.json())
  // console.log(publishableKey)
  const stripePromise = loadStripe(publishableKey)
  // console.log(stripePromise);

  ReactDOM.render(
    <React.StrictMode>
      <Elements stripe={stripePromise}>
        <App />
      </Elements>


    </React.StrictMode>,
    document.getElementById('root')
  );

})()