import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMSOTP = async (phoneNumber, otp) => {
    try {
        const message = await client.messages.create({
            body: `Your OTP for verification is: ${otp}. Valid for 24 hours.`,
            from: twilioPhone,
            to: phoneNumber
        });
        console.log('SMS sent successfully:', message.sid);
        return message;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};