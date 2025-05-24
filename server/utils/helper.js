// A simple booking ID generator. For production, consider more robust libraries or strategies.
const generateBookingId = () => {
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `AB-${timestamp}${randomPart}`;
};

module.exports = { generateBookingId };