const brandName = "SPIT Pvt. Ltd.";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
}).format(new Date(value));

const escapeHtml = (value = "") => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const layout = ({ title, intro, rows = [], footerNote }) => {
    const rowHtml = rows.map(([label, value]) => `
        <tr>
            <td style="padding:10px 0;color:#5c6d7c;font-weight:700;">${escapeHtml(label)}</td>
            <td style="padding:10px 0;color:#17202a;text-align:right;font-weight:800;">${escapeHtml(value)}</td>
        </tr>
    `).join("");

    return `
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${escapeHtml(title)}</title>
        </head>
        <body style="margin:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#17202a;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f8;padding:24px 12px;">
                <tr>
                    <td align="center">
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e0e6ed;border-radius:8px;overflow:hidden;">
                            <tr>
                                <td style="background:#0f6b5f;color:#ffffff;padding:22px 24px;">
                                    <p style="margin:0 0 6px;font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;">${brandName}</p>
                                    <h1 style="margin:0;font-size:24px;line-height:1.2;">${escapeHtml(title)}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">
                                    <p style="margin:0 0 18px;line-height:1.6;color:#334756;">${intro}</p>
                                    ${rows.length ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e6edf3;border-bottom:1px solid #e6edf3;margin:18px 0;">${rowHtml}</table>` : ""}
                                    ${footerNote ? `<p style="margin:18px 0 0;line-height:1.6;color:#334756;">${footerNote}</p>` : ""}
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f8fafb;padding:16px 24px;color:#6a7a88;font-size:13px;line-height:1.5;">
                                    This is an automated update from ${brandName}. Please do not reply to this email.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

const orderCreatedEmail = (order) => ({
    subject: `Order received: ${order.orderNumber}`,
    html: layout({
        title: "Order Received",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your canteen order has been received successfully.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Order Date", formatDate(order.createdAt)],
            ["Total Amount", formatCurrency(order.totalAmount)],
            ["Payment Method", order.paymentMethod],
            ["Current Status", order.status]
        ]
    })
});

const orderPreparingEmail = (order) => ({
    subject: `Order preparing: ${order.orderNumber}`,
    html: layout({
        title: "Order Preparing",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your order is now being prepared.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Current Status", order.status]
        ]
    })
});

const orderReadyEmail = (order) => ({
    subject: `Order ready for pickup: ${order.orderNumber}`,
    html: layout({
        title: "Order Ready To Pick Up",
        intro: `Hello ${escapeHtml(order.user.fullName)}, your order is ready.`,
        rows: [
            ["Order Number", order.orderNumber],
            ["Current Status", order.status]
        ],
        footerNote: "Please collect your order from the canteen pickup counter and keep your order number handy."
    })
});

module.exports = { orderCreatedEmail, orderPreparingEmail, orderReadyEmail };
