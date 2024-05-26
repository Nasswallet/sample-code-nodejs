// -------------------------
// main.js
// -------------------------

const axios = require('axios');
const path = require('path');
const express = require('express');

const app = express();
const port = 3000;

// Configuration values
const base_url = "https://uatgw.nasswallet.com/payment/transaction";
const basicToken = 'Basic <TOKEN>';
const username = '<USERNAME>';
const password = '<PASSWORD>';
const grantType = '<PASSWORD>';
const transactionPin = '<TRANSACTION_PIN>';
const orderId = '263626';
const amount = '10';
const languageCode = 'en';

app.use(express.static('public'));

/**
 * Fetch a merchant token from the authentication endpoint.
 * @returns {Promise<string>} The merchant token.
 */
async function getMerchantToken() {
  try {
    const response = await axios.post(`${base_url}/login`, {
      data: { username, password, grantType }
    }, {
      headers: { authorization: basicToken }
    });
    if (response.data.responseCode === 0) {
      return response.data.data.access_token;
    } else {
      throw new Error('Unable to generate merchant token.');
    }
  } catch (error) {
    throw new Error(`Error fetching merchant token: ${error.message}`);
  }
}

/**
 * Initiate a payment transaction using the provided access token.
 * @param {string} accessToken - The access token for authorization.
 * @returns {Promise<object>} The transaction data.
 */
async function makePayment(accessToken) {
  try {
    const response = await axios.post(`${base_url}/initTransaction`, {
      data: {
        userIdentifier: username,
        transactionPin,
        orderId,
        amount,
        languageCode,
      },
    }, {
      headers: { authorization: `Bearer ${accessToken}` },
    });
    if (response.data.responseCode === 0) {
      return response.data.data;
    } else {
      throw new Error('Transaction failed.');
    }
  } catch (error) {
    throw new Error(`Error initiating payment: ${error.message}`);
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/payment', async (req, res) => {
  try {
    const accessToken = await getMerchantToken();
    const transactionData = await makePayment(accessToken);
    res.redirect(`/redirect/?id=${transactionData.transactionId}&token=${transactionData.token}&userIdentifier=${username}`);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/redirect', (req, res) => {
  res.sendFile(path.join(__dirname, '/redirect.html'));
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
