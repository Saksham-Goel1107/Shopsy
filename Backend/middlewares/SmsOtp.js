import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMSOTP = async (phoneNumber, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP for verification is: ${otp}. 
      Please do not share this OTP with anyone. This OTP is valid for 24 hours. 
      Didn't request this? Ignore it. Your account is safe.
      Help:
      Email: sakshamgoel1107@gmail.com
      Phone Number: +918882534712
      Github Account: https://github.com/Saksham-Goel1107`,
      from: twilioPhone,
      to: phoneNumber,
    });
    console.log("SMS sent successfully:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};
