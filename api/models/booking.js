const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
    patientName: String,
    patientPhone: String,
    doctorId: String,
    doctorName: String,
    date: String,
    slot: String,
    time: String,
    checked: { type: Boolean, default: false },
    bookingId: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Booking', bookingSchema); 