import { transporter } from "./email.config.js";
import { Verification_Email_Template, Welcome_Email_Template, Reseting_Verification_Email_Template, Email_password_change_Template } from "./emailTemplate.js";

const sendVerificationEmail = async (email, verificationCode) => {
    if (!email || !verificationCode) {
        throw new Error('Email and verification code are required');
    }

    try {
        const response = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your Email",
            text: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode),
        });
        console.log('Verification email sent successfully to:', email);
        return response;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error; // Re-throw to handle in the route
    }
};

const sendResetingVerificationEmail = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reseting Email",
            text: "Verify your Password Reseting Request",
            html: Reseting_Verification_Email_Template.replace("{verificationCode}", verificationCode),
        });
        console.log('Verification email sent successfully', response);
    } catch (error) {
        console.error('Error sending verification email', error);
        throw error;
    }
};

const sendWelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to Our Community",
            text: "Welcome to Our Community",
            html: Welcome_Email_Template.replace("{name}", name),
        });
        console.log('Welcome email sent successfully', response);
    } catch (error) {
        console.error('Error sending welcome email', error);
        throw error;
    }
};

const sendpasswordchangetemplate = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Changed",
            text: "Your Account Password Has Been Changed",
            html: Email_password_change_Template.replace("{name}", name),
        });
        console.log('Password change email sent successfully', response);
    } catch (error) {
        console.error('Error sending password change email:', error);
        throw error;
    }
};

export { sendVerificationEmail, sendWelcomeEmail, sendResetingVerificationEmail, sendpasswordchangetemplate };
