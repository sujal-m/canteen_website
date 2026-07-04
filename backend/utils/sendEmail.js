const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
    const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length) {
        console.log("Email not sent. Missing env:", missing.join(", "));
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.SMTP_USER,
            to,
            subject,
            html
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("SMTP ERROR:", error);
        throw error;
    }
};

module.exports = sendEmail;

