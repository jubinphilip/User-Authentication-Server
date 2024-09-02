const twilio = require('twilio');
require('dotenv').config()
const nodemailer=require('nodemailer')
const randomString=require('randomstring');
const https = require('https');
const client = twilio(process.env.ACCOUNT_ID,process.env.AUTH_TOKEN);

//Generates a random number as OTP
function generateOTP()
{
    console.log("generate")
    return randomString.generate({ length: 4, charset: 'numeric' });
}
const otpCache={};//object for storing specified email and otp

//Function which sends the mail to the user
function sendOTP(email, otp) {
    const mailOptions = {
        from: 'jubinphilip25@gmail.com', // Sender's email address
        to: email, 
        subject: "OTP verification", // Email subject
        text: `Your OTP for verification is: ${otp}` // Email body
    };

    console.log("Sending OTP...");

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user:process.env.EMAIL, // Sender's email address
            pass: process.env.APP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending OTP:', err); 
        } else {
            console.log('OTP sent:', info.response); 
        }
    });
}


//Function for sending otp to mobile number 
const sendOtp = async (req, res) => {
    try {
        const { name, email, phone, dob } = req.body;
        console.log(name, email, phone, dob);

        // Send OTP via SMS using v2 API
        const verification = await client.verify.v2.services(process.env.SERVICE_ID)
            .verifications.create({
                to: `+91${phone}`,
                channel: 'sms'
            });

        // Otp generator for email
        const otp = generateOTP();
        console.log(otp);
        otpCache[email] = otp;
        console.log(otpCache);

        // Send OTP email
        await sendOTP(email, otp);

        // Set cookie for storing the email and otp
        res.cookie('otpCache', JSON.stringify(otpCache), { maxAge: 30000, httpOnly: true });

        // Send response after setting the cookie
        res.json({ message: 'OTP sent successfully', verification });

        console.log("OTP sent");
    } catch (error) {
        // Handle errors (e.g., network issues, Twilio API errors)
        console.error('Error sending OTP:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Failed to send OTP' });
        }
    }
};
//Checks whether the otp entered by the user is correct or not 
const otpMobile = async (req, res) => {
      try {
         const { otp} = req.body; 
        console.log(otp)
 
         if (!otp ) {
             return res.status(400).json({ message: 'OTP and phone number are required' });
         }
 
         const verificationCheck = await client.verify.v2.services(process.env.SERVICE_ID)
             .verificationChecks.create({
                 to: '+917025889751', 
                 code: otp
             });
 
         // Check the verification status
         if (verificationCheck.status === 'approved') {
             console.log('OTP verified successfully');
             res.json({ status:1,message: 'OTP verified successfully' });
         } else {
             console.log('OTP verification failed');
             res.status(400).json({ status:0, message: 'OTP verification failed' });
         }
     } catch (error) {
         // Handle errors (e.g., network issues, Twilio API errors)
         console.error('Error verifying OTP:', error);
         res.status(500).json({
             message: 'Failed to verify OTP',

             error: error.message,
             code: error.code,
             moreInfo: error.moreInfo
         });
     }}
    
     //Otp verification for Email
const otpEmail=async(req,res)=>{
    try {
        const { verifymail, otp: { otp } }=req.body
        console.log(verifymail,otp)

        const email = verifymail;
        console.log(otp);

        // Check if email exists in the cache
        if (!otpCache.hasOwnProperty(email)) {
            return res.status(400).json({ message: 'Email not found' });
        }

        // Check if OTP matches the one stored in the cache
        if (otpCache[email] === otp.trim()) {
            // Remove OTP from cache after successful verification
            delete otpCache[email];
            console.log("OTP verified");
            return res.status(200).json({ status:1,message: 'OTP verified' });
        } else {
            console.log("Invalid OTP");
            return res.status(400).json({ message: 'Invalid OTP' });
        } 
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ status:0,message: 'Failed to verify OTP' });
    }
};

//Function for vrifying adar number
const adharVerify=(req,res)=>
{
    const{adhar}=req.body
    console.log(adhar)
    const options = {
        method: 'POST',
        headers: {
         'apy-token': 'APY0JJzGDOaXAe4rOCA8il6XxgoNwFJ0m4LU1GLem2vJ3ND4BoT5zPH25tUU8RX8',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ aadhaar: String(adhar).trim() })
      }
      fetch('https://api.apyhub.com/validate/aadhaar', options)
        .then(response => response.json())
        .then(response => res.json(response))
        .catch(err => console.error(err));  
}

//Pan Number Verification
const panVerify = async (request, response) => {
    const { panno } = request.body;  // Extract panno from request body
    const cleanedPan = panno.trim().toUpperCase();//for getting clear data 
    console.log(panno);

     const options = {
        method: 'POST',
        hostname: 'pan-information-verification-api.p.rapidapi.com',
        port: null,
        path: '/validation/api/v1/panverification',
        headers: {
            'x-rapidapi-key': '20ed44c9e7msha033b53c580a8d0p187eecjsn767d66c1ac53',
            'x-rapidapi-host': 'pan-information-verification-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };
    
    const req = https.request(options, function (res) {
        const chunks = [];
    
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
    
        res.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            const parsedBody = JSON.parse(body);//Extracting json to js object
            if(parsedBody.status=="success")
            {
                response.json({status:1,message:"pan found"})
            }
            else
            {
                response.json({status:0,message:"Pan not found"})
            }
        
        });
    });
    req.write(JSON.stringify({
      pan:cleanedPan,
      consent: 'yes',
      consent_text: 'I hear by declare my consent agreement for fetching my information via AITAN Labs API'
    }));
    req.end(); 
}

//Function for generating a request id for checking bank details
const bankVerify=async(request,response)=>
{
    const{accno,ifsc}=request.body
    console.log(accno,ifsc)
    const options = {
        method: 'POST',
        hostname: 'indian-bank-account-verification.p.rapidapi.com',
        port: null,
        path: '/v3/tasks/async/verify_with_source/validate_bank_account',
        headers: {
            'x-rapidapi-key': '86367067a4mshbbff21f23e078b7p1ceca9jsn7f02d77136ff',
            'x-rapidapi-host': 'indian-bank-account-verification.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };
    
    const req = https.request(options, function (res) {
        const chunks = [];
    
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
    
        res.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            const parsedBody = JSON.parse(body);
            response.json(parsedBody)//the gerated request id is sent back to the client side
        });
    });
    req.write(JSON.stringify({
      task_id: '123',
      group_id: '1234',
      data: {
        bank_account_no: accno,
        bank_ifsc_code: ifsc
      }
    }));
    req.end();
}
//Fuction for verifying whether the bank details exist or not
const bankDetails=async(request,response)=>{
    const { id } = request.params; //recieve the request id from client side
    console.log(id)

const options = {
	method: 'GET',
	hostname: 'indian-bank-account-verification.p.rapidapi.com',
	port: null,
	path: `/v3/tasks?request_id=${id}`,
	headers: {
		'x-rapidapi-key': '86367067a4mshbbff21f23e078b7p1ceca9jsn7f02d77136ff',
		'x-rapidapi-host': 'indian-bank-account-verification.p.rapidapi.com'
	}
};

const req = https.request (options, function (res) {
	const chunks = [];

	res.on('data', function (chunk) {
		chunks.push(chunk);
	});



	res.on('end', function () {
		const body = Buffer.concat(chunks);
		console.log(body.toString());
        const parsedBody = JSON.parse(body);
        const verified= parsedBody[0].result.status
        console.log(verified)
        if(verified=="id_found")
        {
            response.json({status:1})
        }
        else
        {
            response.json({status:0})
        }
	});

});
req.end();
}

//Function for verifying gst number isvalid or not
const gstVerify = async (request, response) => {
    const { gstno } = request.body;
    console.log(gstno)

    const options = {
        method: 'GET',
        hostname: 'gst-insights-api.p.rapidapi.com',
        port: null,
        path: '/getGSTStatus/27AABCI6363G3ZH',
        headers: {
            'x-rapidapi-key': '86367067a4mshbbff21f23e078b7p1ceca9jsn7f02d77136ff',
            'x-rapidapi-host': 'gst-insights-api.p.rapidapi.com'
        }
    };
    
    const req = https.request(options, function (res) {
        const chunks = [];
    
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
    
        res.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            const parsedBody = JSON.parse(body);
            response.json(parsedBody.data.isActive)
        });
    });
    
    req.end();
}

//Function for feching address with users pincode
const fetchAddress=async(request,response)=>
{
    const{pincode}=request.body

    const options = {
        method: 'GET',
        hostname: 'india-pincode-with-latitude-and-longitude.p.rapidapi.com',
        port: null,
        path: `/api/v1/pincode/${pincode}`,
        headers: {
            'x-rapidapi-key': '86367067a4mshbbff21f23e078b7p1ceca9jsn7f02d77136ff',
            'x-rapidapi-host': 'india-pincode-with-latitude-and-longitude.p.rapidapi.com'
        }
    };
    
    const req = https.request(options, function (res) {
        const chunks = [];
    
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
    
        res.on('end', function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
        const parsedBody = JSON.parse(body);
        console.log(parsedBody)
        response.json(parsedBody)
	});
});

req.end();
}
//Exporting functions
module.exports={
    sendOtp,
    otpMobile,
    otpEmail,
    adharVerify,
    panVerify,
    bankVerify,
    gstVerify,
    fetchAddress,
    bankDetails
}