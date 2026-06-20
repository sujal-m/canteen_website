const PDFDocument = require("pdfkit");

const brandName = "SPIT Pvt. Ltd.";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const formatDate = (value) => new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
}).format(new Date(value));

const drawRow = (doc, y, values, widths, options = {}) => {
    let x = doc.page.margins.left;
    values.forEach((value, index) => {
        doc.font(options.bold ? "Helvetica-Bold" : "Helvetica")
            .fontSize(options.fontSize || 10)
            .fillColor(options.color || "#17202a")
            .text(String(value), x, y, { width: widths[index], align: index === 0 ? "left" : "right" });
        x += widths[index];
    });
};

const drawLabelValue = (doc, label, value, x, y, width) => {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#5c6d7c").text(label, x, y, { width });
    doc.font("Helvetica").fontSize(10).fillColor("#17202a").text(value || "-", x, y + 14, { width });
};

const generateInvoicePdf = (order, stream) => {
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    doc.pipe(stream);

    const user = order.user || {};
    const left = doc.page.margins.left;
    const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    doc.rect(0, 0, doc.page.width, 96).fill("#0f6b5f");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(22).text(brandName, left, 30);
    doc.font("Helvetica").fontSize(12).text("Campus Canteen Invoice", left, 58);

    doc.fillColor("#17202a").font("Helvetica-Bold").fontSize(20).text("Invoice", left, 128);
    doc.font("Helvetica").fontSize(10).fillColor("#5c6d7c").text(`Generated on ${formatDate(new Date())}`, left, 154);

    const boxY = 188;
    doc.roundedRect(left, boxY, contentWidth, 126, 8).strokeColor("#d9e2ea").lineWidth(1).stroke();
    drawLabelValue(doc, "Order Number", order.orderNumber, left + 18, boxY + 18, 150);
    drawLabelValue(doc, "Order Date", formatDate(order.createdAt), left + 190, boxY + 18, 160);
    drawLabelValue(doc, "Payment Method", order.paymentMethod, left + 370, boxY + 18, 130);
    drawLabelValue(doc, "User Name", user.fullName, left + 18, boxY + 68, 150);
    drawLabelValue(doc, "Email", user.email, left + 190, boxY + 68, 160);
    drawLabelValue(doc, "Role / UCID", `${user.role || "-"}${user.ucid ? ` / ${user.ucid}` : ""}`, left + 370, boxY + 68, 130);

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#17202a").text("Items", left, 350);
    const tableY = 378;
    const widths = [230, 70, 100, 100];
    doc.rect(left, tableY - 8, contentWidth, 30).fill("#f3f6f8");
    drawRow(doc, tableY, ["Item Name", "Quantity", "Unit Price", "Subtotal"], widths, { bold: true, color: "#334756" });

    let y = tableY + 36;
    order.items.forEach((item) => {
        if (y > 710) {
            doc.addPage();
            y = 64;
            doc.rect(left, y - 8, contentWidth, 30).fill("#f3f6f8");
            drawRow(doc, y, ["Item Name", "Quantity", "Unit Price", "Subtotal"], widths, { bold: true, color: "#334756" });
            y += 36;
        }
        doc.moveTo(left, y - 10).lineTo(left + contentWidth, y - 10).strokeColor("#e6edf3").stroke();
        drawRow(doc, y, [item.name, item.quantity, formatCurrency(item.price), formatCurrency(item.subtotal)], widths);
        y += 34;
    });

    doc.moveTo(left, y - 6).lineTo(left + contentWidth, y - 6).strokeColor("#cbd6df").stroke();
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#17202a").text("Total Amount", left + 300, y + 12, { width: 100, align: "right" });
    doc.font("Helvetica-Bold").fontSize(14).fillColor("#0f6b5f").text(formatCurrency(order.totalAmount), left + 400, y + 10, { width: 100, align: "right" });

    const footerY = doc.page.height - 86;
    doc.moveTo(left, footerY - 14).lineTo(left + contentWidth, footerY - 14).strokeColor("#e6edf3").stroke();
    doc.font("Helvetica").fontSize(9).fillColor("#6a7a88")
        .text(`Order Status: ${order.status}`, left, footerY)
        .text("Thank you for ordering from the campus canteen.", left, footerY + 16)
        .text(`${brandName} | This invoice was generated digitally.`, left, footerY + 32);

    doc.end();
};

module.exports = { generateInvoicePdf };
