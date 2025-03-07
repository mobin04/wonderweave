/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0]; // Extract first name from full name
    this.url = url;  // URL (e.g., for password reset, confirmation, etc.)
    this.from = `Natour <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      // 1) create a transporter.
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email.
  async send(template, subject) {
    // 1) Render HTML based on a pug template.
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName, // Pass first name to template
      url: this.url, // Pass URL to template
      subject // Pass subject to template
    });

    // 2) Define the email options
    const mailOptions = {
      from: this.from, // Sender email
      to: this.to, // Recipient email
      subject: subject, // Email subject
      html: html, // Rendered HTML content
      text: htmlToText.fromString(html) // Convert HTML to plain text
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Helper method to send a welcome email
  async sendWelcome() {
   await this.send('welcome', 'Welcome to Natours.');
  }
};

// const sendEmail = async (options) => {
//   // 2) Define the email options.

//   // 3) Actually send the email.
//   await transporter.sendMail(mailOptions);
// };
