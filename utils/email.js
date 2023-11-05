const nodemailer = require(`nodemailer`);

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For using gmail activate "less secure app" option
    // const transporter = nodemailer.createTransport({
    //     service: 'Gmail',
    //     auth: {
    //         user: process.env.EMAIL_USERNAME,
    //         password: process.env.EMAIL_PASSWORD,
    //     },
    // });

    const transporterParameters = {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    };

    const transporter = nodemailer.createTransport(transporterParameters);

    // 2) Define the email options
    const emailOptions = {
        from: 'Deniss Solovjovs <fake@email.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    };

    // 3) Actually send the email
    await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
