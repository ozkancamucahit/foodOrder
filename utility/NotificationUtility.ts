
// EMAIL

import { TWILIO_ACCOUNT_SID, TWILIO_AUTHTOKEN } from "../config";


// NOTIFICATIONS


// OTP
export const GenerateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  let expiry = new Date();
  expiry.setTime(new Date().getTime() + (30*60*1000));

  return {otp, expiry}
}

export const onRequestOtp = async(otp: number, toPhonenumber: string) => {

  const accountSid = TWILIO_ACCOUNT_SID;
  const authToken = TWILIO_AUTHTOKEN;

  console.log('TWILIO PARAMS =>',accountSid, authToken);

  const client = require("twilio")(accountSid, authToken);
  const response = await client.messages.create({
    body: `Your otp :${otp}`,
    from : '',
    toPhonenumber: toPhonenumber
  });

  return response;
}


// PAYMENT NOTIFICATIONS OR EMAILS

