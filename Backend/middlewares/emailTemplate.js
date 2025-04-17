const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
              .contact-buttons {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #eee;
          }
          .contact-btn {
              display: flex;
              align-items: center;
              padding: 8px 15px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #555;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.3s ease;
          }
          .contact-btn:hover {
              background-color: #e9ecef;
              border-color: #bbb;
          }
          .contact-btn svg {
              margin-right: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
              <div class="contact-buttons">
                <a href="mailto:sakshamgoel1107@gmail.com" class="contact-btn">
                  <span>Email Us</span>
                </a>
                <a href="https://github.com/Saksham-Goel1107" class="contact-btn">
                  <span>GitHub</span>
                </a>
                <a href="tel:+918882534712" class="contact-btn">
                  <span>Call Us</span>
                </a>
              </div>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Saksham-Goel1107. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;


const Reseting_Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Password Reseting Request</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
              .contact-buttons {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #eee;
          }
          .contact-btn {
              display: flex;
              align-items: center;
              padding: 8px 15px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #555;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.3s ease;
          }
          .contact-btn:hover {
              background-color: #e9ecef;
              border-color: #bbb;
          }
          .contact-btn svg {
              margin-right: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Password Reseting Verification Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>An Request has been made to reset the Password! Please confirm the request by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you didn't make an request for reseting the password, no further action is required. If you have any questions, feel free to contact our support team.</p>
               <div class="contact-buttons">
                <a href="mailto:sakshamgoel1107@gmail.com" class="contact-btn">
                  <span>Email Us</span>
                </a>
                <a href="https://github.com/Saksham-Goel1107" class="contact-btn">
                  <span>GitHub</span>
                </a>
                <a href="tel:+918882534712" class="contact-btn">
                  <span>Call Us</span>
                </a>
              </div>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Saksham-Goel1107. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

const Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome To The Comunity</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #007BFF;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
              .contact-buttons {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #eee;
          }
          .contact-btn {
              display: flex;
              align-items: center;
              padding: 8px 15px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #555;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.3s ease;
          }
          .contact-btn:hover {
              background-color: #e9ecef;
              border-color: #bbb;
          }
          .contact-btn svg {
              margin-right: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome To The Comunity!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We’re thrilled to have you join us! Your registration was successful, and we’re committed to providing you with the best experience possible.</p>
              <p>Here’s how you can get started:</p>
              <ul>
                  <li>Explore our features and customize your experience.</li>
                  <li>Stay informed by checking out our blog for the latest updates and tips.</li>
                  <li>Reach out to our support team if you have any questions or need assistance.</li>
              </ul>
              <a href="https://shopify-tau-seven.vercel.app/" class="button">Get Started</a>
              <p>If you need any help, don’t hesitate to contact us. We’re here to support you every step of the way.</p>
               <div class="contact-buttons">
                <a href="mailto:sakshamgoel1107@gmail.com" class="contact-btn">
                  <span>Email Us</span>
                </a>
                <a href="https://github.com/Saksham-Goel1107" class="contact-btn">
                  <span>GitHub</span>
                </a>
                <a href="tel:+918882534712" class="contact-btn">
                  <span>Call Us</span>
                </a>
              </div>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Saksham-Goel1107. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

const Email_password_change_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #dc3545;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #007BFF;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
              .contact-buttons {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 15px;
              margin-top: 25px;
              padding-top: 15px;
              border-top: 1px solid #eee;
          }
          .contact-btn {
              display: flex;
              align-items: center;
              padding: 8px 15px;
              background-color: #f8f9fa;
              border: 1px solid #ddd;
              border-radius: 4px;
              color: #555;
              text-decoration: none;
              font-size: 14px;
              transition: all 0.3s ease;
          }
          .contact-btn:hover {
              background-color: #e9ecef;
              border-color: #bbb;
          }
          .contact-btn svg {
              margin-right: 8px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Password Changed</div>
          <div class="content">
              <p class="message">Hello {name},</p>
              <p>Your account password has been successfully changed.</p>
              <p>If you made this change, no further action is needed.</p>
              <p><strong>If you did not change your password</strong>, please secure your account immediately by resetting your password and contacting support.</p>
              <a href="https://shopify-tau-seven.vercel.app/products" class="button">Reset Password</a>
              <p>If you need assistance, our support team is here to help you.</p>
               <div class="contact-buttons">
                <a href="mailto:sakshamgoel1107@gmail.com" class="contact-btn">
                  <span>Email Us</span>
                </a>
                <a href="https://github.com/Saksham-Goel1107" class="contact-btn">
                  <span>GitHub</span>
                </a>
                <a href="tel:+918882534712" class="contact-btn">
                  <span>Call Us</span>
                </a>
              </div>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Saksham-Goel1107. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;


export { Verification_Email_Template, Welcome_Email_Template, Reseting_Verification_Email_Template, Email_password_change_Template };