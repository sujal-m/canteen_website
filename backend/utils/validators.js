const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const studentClassOptions = {
    CSE: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMCA", "SYMCA", "FYMTech", "SYMTech"],
    EXTC: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMTech", "SYMTech"],
    COMS: ["1st Year BTech", "2nd Year BTech", "3rd Year BTech", "4th Year BTech", "FYMTech", "SYMTech"]
};

const genders = ["Male", "Female", "Prefer not to say"];
const branches = ["CSE", "EXTC", "COMS"];
const divisions = ["A", "B", "C", "D"];

const isValidEmail = (email) => emailRegex.test(String(email || "").trim());
const isStrongPassword = (password) => passwordRegex.test(String(password || ""));

const validatePasswordMatch = (password, confirmPassword, errors) => {
    if (!isStrongPassword(password)) {
        errors.push("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
    }

    if (password !== confirmPassword) {
        errors.push("Passwords do not match.");
    }
};

const validateStudentRegistration = (body) => {
    const errors = [];
    const required = ["fullName", "ucid", "email", "gender", "branch", "className", "division", "password", "confirmPassword"];

    required.forEach((field) => {
        if (!String(body[field] || "").trim()) errors.push(`${field} is required.`);
    });

    if (!/^\d{10}$/.test(String(body.ucid || ""))) errors.push("UCID must be exactly 10 digits.");
    if (!isValidEmail(body.email)) errors.push("Enter a valid email address.");
    if (!genders.includes(body.gender)) errors.push("Select a valid gender.");
    if (!branches.includes(body.branch)) errors.push("Select a valid branch.");
    if (!studentClassOptions[body.branch]?.includes(body.className)) errors.push("Select a valid class for the selected branch.");
    if (!divisions.includes(body.division)) errors.push("Select a valid division.");

    validatePasswordMatch(body.password, body.confirmPassword, errors);

    return errors;
};

const validateFacultyRegistration = (body) => {
    const errors = [];
    const required = ["fullName", "email", "gender", "branch", "designation", "password", "confirmPassword"];

    required.forEach((field) => {
        if (!String(body[field] || "").trim()) errors.push(`${field} is required.`);
    });

    if (!isValidEmail(body.email)) errors.push("Enter a valid email address.");
    if (!genders.includes(body.gender)) errors.push("Select a valid gender.");
    if (!branches.includes(body.branch)) errors.push("Select a valid branch.");

    validatePasswordMatch(body.password, body.confirmPassword, errors);

    return errors;
};

module.exports = {
    isValidEmail,
    isStrongPassword,
    validateStudentRegistration,
    validateFacultyRegistration,
    studentClassOptions
};
