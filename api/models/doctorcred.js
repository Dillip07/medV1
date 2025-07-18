const mongoose = require('mongoose');

const doctorCredSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    active: { type: Boolean, default: true },
});

module.exports = mongoose.model('DoctorCred', doctorCredSchema); 