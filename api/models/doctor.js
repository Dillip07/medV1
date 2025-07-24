const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'pending'
    },
    imageUri: {
        type: String,
        required: false
    },
    location: {
        type: Object, // Store as { lat, lng }
        required: false
    }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor; 