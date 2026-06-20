const crypto = require("crypto");

const createTokenPair = () => {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    return { token, hashedToken };
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

module.exports = { createTokenPair, hashToken };

