const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    slotKey: {
        type: String, // e.g., 'morning-09:00'
        required: true,
    },
    count: {
        type: Number,
        required: true,
        default: 1,
        min: 0,
    },
});

const AvailabilitySchema = new mongoose.Schema({
    date: {
        type: String, // e.g., '2024-06-09'
        required: true,
    },
    slots: [SlotSchema],
});

const DoctorAvailabilitySchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
        unique: true,
    },
    availability: [AvailabilitySchema],
}, { timestamps: true });

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema); 