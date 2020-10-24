// -------------------------
// main.js
// -------------------------

const axios = require('axios')
const path = require('path')

const express = require('express')

const app = express()
const port = 3000

const base_url = "https://uatgw.nasswallet.com/payment/transaction";
const basicToken = '';
const username = '';
const password = '';
const grantType = 'password';
const transactionPin = '';
let orderId = '263626';
let amount = '10';
let languageCode = 'en';


function getMerchantToken(){
	const url = `${base_url}/login`;
	const data = {
		data: { 
			username: username, 
			password: password, 
			grantType: grantType 
		}
	}
	const headers = {
		authorization: basicToken 
	}
	return axios.post(url, data, {headers})
}

function makePayment(access_token){
	const url = `${base_url}/initTransaction`;
	const data = {
		data: { 
			userIdentifier: username, 
			transactionPin: transactionPin,
			orderId: orderId, 
			amount: amount, 
			languageCode: languageCode 
		}
	}
	const headers = { authorization: `Bearer  ${access_token}`}
	return axios.post(url, data, {headers})
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
});

app.get('/payment', (request, result) => {
	getMerchantToken().then(res => {
		let merchant = res.data
		if(merchant.responseCode == 0 && merchant.data.access_token){
			let access_token = merchant.data.access_token
			makePayment(access_token).then(res => {
				let transaction = res.data;
				let data = transaction.data;
				if(transaction.responseCode == 0 && transaction.data.transactionId){
					result.redirect(`/redirect/?id=${data.transactionId}&token=${data.token}&userIdentifier=${username}`)
				} else {
					result.send('transaction failed.');
				}
			}).catch(err => {
				result.send(err.toString())
			})
		} else {
			result.send('unable to generate merchant token.')
		}
	}).catch(err => {
		result.send(err.toString())
	})

});

app.get('/redirect', (req, res) => {
	res.sendFile(path.join(__dirname + '/redirect.html'))
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
