const express = require("express");

const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT;
const axios = require("axios")
// const token = "yj3KOZu0SKc6VEj2PHGAAWJn8mVT";



app.listen(port, () =>{
    console.log(`Server running on port: ${port}`)
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// try route
app.get("/", (req, res)=>{
    res.send("<h2>Hey, let's try this. The integration</h2>");
})

app.get("/token", (req, res, next)=>{
    generateToken();
})

// middleware for generating token: step 5
const generateToken = async (req, res, next)=>{
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const consumer = process.env.MPESA_CONSUMER_KEY;

    const auth = new Buffer.from(`${secret}:${consumer}`).toString("base64");
    // const auth = new Buffer.from(secret + consumer).toString("base64");

    await axios
        .get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
            {
                headers:{
                    Authorization:`Basic QUxWQVQza0ZjUlZsRkhUWWFmbFV3WXpqM05HNm9uSFY0ZmFsUFhOY1picEtiOExmOlB5dHFwVlNnNkZXb0hPTXZ6TDJ3clZMOFpjZVAzUmZVUXptU3V3dkdMNG5jdGo5QXNuZDRoSnhOd040MUNTaU4`,
                },
            }).then((response)=>{
                console.log(response.data.access_token);
                token = response.data.access_token
                next();
            }).catch((err)=>{
                console.log(err);
                // res.status(400).json(err.message)
            })
        }   

// send a stk push to safaricom: step 1
//pass generateToken as a prop in stk post rquest: step 6
app.post("/stk",  generateToken, async (req,res)=>{
    const phone = req.body.phone.substring(1);
    const amount = req.body.amount;
    // res.json({phone, amount});
    //generating a timestamp: step 3
    const date = new Date();
    const timestamp = 
        date.getFullYear() + 
        ("0" + (date.getMonth() + 1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);

    //generating password : step 4
    const shortcode = process.env.MPESA_PAYBILL;
    const passkey = process.env.MPESA_PASSKEY;

    const password = new Buffer.from(shortcode + passkey + timestamp).toString("base64");

    //verify payload for the request: step 2
    await axios.post(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {    
            BusinessShortCode: shortcode,    
            Password: password,    
            Timestamp:timestamp,    
            TransactionType: "CustomerPayBillOnline", //"CustomerBuyGoodOnline",   
            Amount: amount,    
            PartyA:`254${phone}`,    
            PartyB:shortcode,    
            PhoneNumber:`254${phone}`,    
            CallBackURL: "https://webhook.site/9460e61d-d7da-4834-91ba-cfede9cba097",    
            // CallBackURL: "https://mydomain.com/pat",
            AccountReference:`254${phone}`,    
            TransactionDesc:"Test"
         },
         {
            headers: {
                Authorization: `Bearer ${token}`
            }
         }
    ).then((data)=>{
        console.log(data.data)
        res.status(200).json(data.data)
    }).catch((err)=>{
        console.log(err.message)
        res.status(400).json(err.message)
    })
});