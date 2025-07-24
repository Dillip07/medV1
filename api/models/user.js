const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
    mpin: {
        type: String,
        required: false,
        default: "" // Default value for mpin
    },
    verified: {
        type: Boolean,
        default: false
    },
    authToken: {
        type: String,
        required: false
    },
    imageUri: {
        type: String,
        required: false
    },
    location: {
        type: Object, // Store as { lat, lng }
        required: false
    },
    favoriteDoctors: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Doctor",
        default: []
    },
    expoPushToken: {
        type: String,
        required: false
    }
});
const User = mongoose.model("User", userSchema);

module.exports = User;
