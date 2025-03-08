/* eslint-disable import/no-extraneous-dependencies */
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0]; // Extract first name from full name
    this.url = url; // URL (e.g., for password reset, confirmation, etc.)
    this.from = `Natour <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //Sendgrid
      return nodemailer.createTransport({
        host: 'in-v3.mailjet.com', // Mailjet SMTP server
        port: 587, // Use 587 for STARTTLS or 465 for SSL
        auth: {
          user: process.env.MJ_API_KEY_PUBLIC, // Mailjet Public API Key
          pass: process.env.MJ_API_KEY_PRIVATE, // Mailjet Private API Key
        },
      });
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
    // pug.renderFile for rendering pug file
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName, // Pass first name to template
      url: this.url, // Pass URL to template
      subject, // Pass subject to template
    });

    // 2) Define the email options
    const mailOptions = {
      from: this.from, // Sender email
      to: this.to, // Recipient email
      subject: subject, // Email subject
      html: html, // Rendered HTML content
      text: htmlToText.convert(html), // Convert HTML to plain text
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  // Helper method to send a welcome email
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours.'); // call the send method
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)',
    );
  }
};
