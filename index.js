/*const express = require ("express");
const app = express();
require ("dotenv").config();
const cors = require ("cors");
const axios = require ("axios");
const port = process.env.PORT 

app.listen(port,()=>{
console.log(`App os running at localhost: ${port}`);

})
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get("/token",(req, res) => {
generateToken();
});

app.get("/",(req,res)=>{
res.send("<h1> Hello</h1><br/><h2> Welcome to my API</h2>");
});

const generateToken =async (req, res)=>{
  const secret = process.env.MPESA_SECRET_KEY
  const consumer = process.env.MPESA_CONSUMER_KEY
  const auth = new Buffer.from(`${consumer}:${secret}`).toString("base64");
  
  await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",{    headers: {
      authorization: `Basic ${auth}`,
    }
}).then((response)=>{
  //console.log(response.token.access_token);
  const token = response.token.access_token;
  next();
}).catch((err)=>{
  console.log(err);
  //res.status(400).json(err.message);
})
};
//middleware fuction to generate token
app.post("/stk",generateToken, async (req, res)=>{
  const phone = req.body.phone.substring(1);
  const amount = req.body.amount;

  res.json({phone, amount});

  const timestamp=
  date.getFullYear() +
  ("0" + (date.getMonth() + 1)).slice(-2) +
  ("0" + (date.getDate())).slice(-2) +
  ("0" + (date.getHours())).slice(-2) +
  ("0" + (date.getMinutes())).slice(-2) +
  ("0" + (date.getSeconds())).slice(-2);

const shortcode = process.env.MPESA_PAYBILL;
const passkey = process.env.MPESA_PASSKEY;


const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");
  await axios
  .post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  {    
   "BusinessShortCode": shortcode,    
   "Password":password,   
   "Timestamp":timestamp,    
   "TransactionType": "CustomerPayBillOnline",  //"CustomerBuyGoodsOnline"  
   "Amount": amount,    
   "PartyA":`254${phone}`,    
   "PartyB":shortcode,    
   "PhoneNumber":`254${phone}`,    
   "CallBackURL": "https://mydomain.com/pat",    
   "AccountReference":`254${phone}`,    
   "TransactionDesc":"Test"
},
{
  headers: {
    Authorization: `Bearer ${token}`
  }
}

  ).then((data)=>{
    console.log(data);
    res.status(200).json(data);
  }).catch((err)=>{
    console.log(err.message);
    res.status(400).json(err.message);
  })
});*/

const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const axios = require("axios");

const port = process.env.PORT || 8000; // Add a default port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.listen(port, () => {
  console.log(`App is running at localhost: ${port}`);
});

/*app.get("/", (req, res) => {
  res.send("<h1>Hello</h1><br/><h2>Welcome to my API</h2>");
});
*/

// Function to generate token
const generateToken = async () => {
  try {
    const secret = process.env.MPESA_SECRET_KEY;
    const consumer = process.env.MPESA_CONSUMER_KEY;
    const auth = Buffer.from(`${consumer}:${secret}`).toString("base64");

    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    return response.data.access_token;
  } catch (err) {
    console.error("Error generating token:", err.message);
    throw new Error("Failed to generate token");
  }
};

// Route to get token
app.get("/token", async (req, res) => {
  try {
    const token = await generateToken();
    res.status(200).json({ access_token: token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// STK Push Route
app.post("/stk", async (req, res) => {
  try {
   const token = await generateToken(); // Get the token

    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;

    // Get current timestamp
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;

    const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline", // or "CustomerBuyGoodsOnline"
        Amount: amount,
        PartyA: `254${phone}`,
        PartyB: shortcode,
        PhoneNumber: `254${phone}`,
        CallBackURL: "https://mydomain.com/pat",
        AccountReference: `254${phone}`,
        TransactionDesc: "Test",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.status(200).json(response.data.data);
  } catch (err) {
    console.error("STK Push Error:", err.message);
    res.status(400).json({ error: err.message });
  }
});
