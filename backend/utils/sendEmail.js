const { BrevoClient } = require("@getbrevo/brevo");

let brevoClient;

const getBrevoClient = () => {
    if (!brevoClient) {
        brevoClient = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
    }

    return brevoClient;
};

const parseSender = (value) => {
    const fallbackName = "Campus Canteen";

    if (!value) {
        throw new Error("EMAIL_FROM is required for Brevo email delivery.");
    }

    const match = value.match(/^(.*)<([^>]+)>$/);

    if (!match) {
        return { name: fallbackName, email: value.trim() };
    }

    const name = match[1].trim().replace(/^"|"$/g, "") || fallbackName;
    const email = match[2].trim();

    return { name, email };
};

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is required for Brevo email delivery.");
    }

    const sender = parseSender(process.env.EMAIL_FROM);

    try {
        await getBrevoClient().transactionalEmails.sendTransacEmail({
            sender,
            to: Array.isArray(to) ? to : [{ email: to }],
            subject,
            htmlContent: html
        });

        console.log("Email sent successfully");
    } catch (error) {
        console.error("BREVO EMAIL ERROR:", error);

        const message = error?.body?.message || error?.message || "Brevo email delivery failed.";
        const wrappedError = new Error(message);
        wrappedError.cause = error;
        throw wrappedError;
    }
};

module.exports = sendEmail;

