const nodemailer = require('nodemailer');

// Create a transporter using environment variables or fallback to Ethereal (testing)
const createTransporter = async () => {
    // If we have explicit host/user/pass, use them
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Fallback: Generate Ethereal test account (only if no config provided)
    console.log('No SMTP config found. Creating Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    console.log(`[EmailService] Using Ethereal Mock Account: ${testAccount.user}`);
    return transporter;
};

let transporterPromise = createTransporter();

const sendEmail = async (to, subject, htmlContent) => {
    try {
        const transporter = await transporterPromise;

        const info = await transporter.sendMail({
            from: '"HowUBeen Safety" <safety@howubeen.app>', // Sender address
            to: to, // List of receivers
            subject: subject, // Subject line
            html: htmlContent, // HTML body
        });

        console.log(`[EmailService] Message sent: ${info.messageId}`);
        // Preview only available when sending through an Ethereal account
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
            console.log(`[EmailService] Preview URL: ${previewUrl}`);
        }

        return true;
    } catch (error) {
        console.error('[EmailService] Error sending email:', error);
        return false;
    }
};

module.exports = { sendEmail };
