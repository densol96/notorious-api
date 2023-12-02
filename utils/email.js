const nodemailer = require(`nodemailer`);
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = 'Natours API Team..';
    }

    newTransport() {
        if (process.env.NODE_ENV.trim() === 'production') {
            // Sendgrid
            return 1;
        } else {
            const transporterParameters = {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
            };

            return nodemailer.createTransport(transporterParameters);
        }
    }

    async send(template, subject) {
        // Render HTML based on a pub template
        const html = pug.renderFile(
            `${__dirname}/../views/emails/${template}.pug`,
            {
                firstName: this.firstName,
                url: this.url,
                subject,
            }
        );

        // Email options
        const emailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html),
        };

        // Create a transport and send email
        await this.newTransport().sendMail(emailOptions);
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcoe to Natours Family!');
    }
};
