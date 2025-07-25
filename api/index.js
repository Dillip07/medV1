require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const twilio = require("twilio");
const DoctorCred = require('./models/doctorcred');
const Doctor = require("./models/doctor");
const DoctorAvailability = require("./models/doctoravailability");
const Booking = require('./models/booking');
const Admin = require('./models/admin');
// Remove: const fetch = require('node-fetch');

app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
app.use(bodyParser.json());
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log(err);
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID; // Twilio Account SID from .env
const authToken = process.env.TWILIO_AUTH_TOKEN;   // Twilio Auth Token from .env
const client = new twilio(accountSid, authToken);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require("./models/user");

// Store OTPs in memory (for demo; use Redis or DB for production)
let otpStore = {};

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return secretKey;
};

const secretKey = generateSecretKey();

app.post("/request-otp", async (req, res) => {
    const { name, email, phone, location, expoPushToken } = req.body;
    let formattedPhone = phone;
    if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone;
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ phone: formattedPhone });
        if (!user) {
            // Create a new user with verified set to false
            user = new User({ name, email, phone: formattedPhone, verified: false, location: location || "", expoPushToken });
            await user.save();
        } else if (expoPushToken) {
            user.expoPushToken = expoPushToken;
            await user.save();
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
        otpStore[formattedPhone] = otp; // Store OTP for verification

        // Send OTP to the user's phone number
        console.log(otp);
        await client.messages.create({
            body: `Your OTP is: ${otp}`,
            from: '+15074971674', // Replace with your Twilio phone number
            to: formattedPhone,
        });

        // Respond with success
        res.status(200).json({ success: true, message: "OTP sent successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to send OTP." });
    }
});

// Add this endpoint for verification
app.post("/verify-otp", async (req, res) => {
    const { phone, otp } = req.body;
    let formattedPhone = phone;
    if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone;
    }
    if (otpStore[formattedPhone] && otpStore[formattedPhone] === otp) {
        // Mark user as verified
        const updatedUser = await User.findOneAndUpdate(
            { phone: formattedPhone },
            { verified: true },
            { new: true }
        );
        console.log('Updated user:', updatedUser);
        delete otpStore[formattedPhone]; // Remove OTP after successful verification
        return res.status(200).json({ success: true, message: "OTP verified" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
});

app.post("/set-pin", async (req, res) => {
    const { phone, pin } = req.body;
    let formattedPhone = phone;
    if (!formattedPhone.startsWith("+91")) {
        formattedPhone = "+91" + formattedPhone;
    }
    try {
        // Only update if user exists
        const user = await User.findOneAndUpdate(
            { phone: formattedPhone },
            { mpin: pin },
            { new: true }
        );
        console.log('Updated user with PIN:', user);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "PIN set successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to set PIN" });
    }
});

app.post("/login", async (req, res) => {
    try {
        const { email, phone, mpin, expoPushToken } = req.body;
        let user;
        if (phone) {
            let formattedPhone = phone;
            if (!formattedPhone.startsWith("+91")) {
                formattedPhone = "+91" + formattedPhone;
            }
            user = await User.findOne({ phone: formattedPhone });
        } else if (email) {
            user = await User.findOne({ email });
        }
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        if (user.mpin !== mpin) {
            return res.status(401).json({ message: "Invalid PIN" });
        }
        // Save expoPushToken if provided
        if (expoPushToken) {
            user.expoPushToken = expoPushToken;
            await user.save();
        }
        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone
            },
            secretKey,
            { expiresIn: '7d' }
        );
        res.status(200).json({ success: true, message: "Login successful", user, token });
    } catch (error) {
        console.log("Login failed", error);
        res.status(500).json({ message: "Login failed" });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Endpoint to register a new doctor
app.post("/doctors", async (req, res) => {
    try {
        const { name, email, phone, profession, experience, location } = req.body;
        // Check if doctor already exists
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({ success: false, message: "Doctor already exists" });
        }
        const doctor = new Doctor({
            name,
            email,
            phone,
            profession,
            experience,
            verified: false,
            status: 'pending',
            requestDate: new Date(),
            ...(location ? { location } : {})
        });
        await doctor.save();
        res.status(201).json({ success: true, message: "Doctor registered successfully", doctor });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to register doctor" });
    }
});

// Endpoint to get all doctors
app.get("/doctors", async (req, res) => {
    try {
        const doctors = await Doctor.find();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch doctors" });
    }
});

const generateRandomString = (length = 8) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Endpoint to update doctor status and verified
app.patch("/doctors/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, verified, location } = req.body;
        // Fetch the current doctor
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }
        // Allow status change to 'approved' from 'under_review' or 'suspended'
        if (status === "approved") {
            if (doctor.status !== "under_review" && doctor.status !== "suspended") {
                return res.status(400).json({ success: false, message: "Doctor must be under review or suspended to be approved" });
            }
            doctor.status = "approved";
            doctor.verified = true;
            // Store location if provided
            if (location) {
                doctor.location = location;
            }
            // Generate credentials if not already present in DoctorCred
            let username, password;
            let cred = await DoctorCred.findOne({ doctorId: doctor._id });
            if (!cred) {
                username = doctor.email || generateRandomString(6);
                password = generateRandomString(10);
                cred = new DoctorCred({ doctorId: doctor._id, username, password, active: true });
                await cred.save();
                console.log(`Doctor credentials for ${doctor.name}: Username: ${username}, Password: ${password}`);
            } else {
                cred.active = true;
                await cred.save();
                username = cred.username;
                password = cred.password;
            }
            // Sync to doctor.doctorcred for backward compatibility
            doctor.doctorcred = { username, password, active: true };
        } else if (status === "suspended") {
            doctor.status = "suspended";
            doctor.verified = false;
            // Deactivate DoctorCred
            let cred = await DoctorCred.findOne({ doctorId: doctor._id });
            if (cred) {
                cred.active = false;
                await cred.save();
            }
            if (doctor.doctorcred) {
                doctor.doctorcred.active = false;
            }
        } else {
            // For other status changes, keep previous logic (optional: restrict as needed)
            if (status !== undefined) doctor.status = status;
            if (verified !== undefined) doctor.verified = verified;
        }
        await doctor.save();
        res.status(200).json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update doctor status" });
    }
});

app.post('/doctor-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const cred = await DoctorCred.findOne({ username, password });
    if (!cred) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    if (!cred.active) {
        return res.status(403).json({ success: false, message: 'Account is deactivated. Please contact admin for activation.' });
    }
    // Optionally, fetch doctor info
    const doctor = await Doctor.findById(cred.doctorId);
    // Generate JWT token for doctor
    const token = jwt.sign(
        {
            id: doctor._id,
            name: doctor.name,
            email: doctor.email,
            phone: doctor.phone,
            role: 'doctor'
        },
        secretKey,
        { expiresIn: '7d' }
    );
    res.status(200).json({ success: true, doctor, token });
});

// Endpoint to save/update doctor availability
app.post("/doctor-availability", async (req, res) => {
    try {
        const { doctorId, availability } = req.body; // availability: [{ date, slots: ["morning-09:00", ...] }]
        if (!doctorId || !Array.isArray(availability)) {
            return res.status(400).json({ success: false, message: "doctorId and availability are required" });
        }

        // Upsert a single document per doctor, replace the whole availability array
        await DoctorAvailability.findOneAndUpdate(
            { doctorId },
            { $set: { availability } },
            { upsert: true, new: true }
        );
        res.status(200).json({ success: true, message: "Availability saved" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to save availability" });
    }
});

// Get a doctor's availability by doctorId
app.get("/doctor-availability/:doctorId", async (req, res) => {
    try {
        const { doctorId } = req.params;
        const docAvail = await DoctorAvailability.findOne({ doctorId });
        if (!docAvail) {
            return res.status(404).json({ success: false, message: "No availability found" });
        }
        // Return slots as array of { slotKey, count }
        res.status(200).json({ success: true, availability: docAvail.availability });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch availability" });
    }
});

// PATCH endpoint to update slot count for a doctor's availability
app.patch('/doctor-availability/:doctorId/slot', async (req, res) => {
    const { doctorId } = req.params;
    const { date, slotKey, count } = req.body;
    if (!date || !slotKey || typeof count !== 'number') {
        return res.status(400).json({ success: false, message: 'date, slotKey, and count are required' });
    }
    try {
        const docAvail = await DoctorAvailability.findOne({ doctorId });
        if (!docAvail) {
            return res.status(404).json({ success: false, message: 'Doctor availability not found' });
        }
        const dateEntry = docAvail.availability.find((a) => a.date === date);
        if (!dateEntry) {
            return res.status(404).json({ success: false, message: 'Date entry not found' });
        }
        const slotObj = dateEntry.slots.find((s) => s.slotKey === slotKey);
        if (!slotObj) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }
        slotObj.count = count;
        await docAvail.save();
        res.status(200).json({ success: true, availability: docAvail });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update slot count' });
    }
});

// Reduce slot count for a doctor's availability
app.post('/doctor-availability/:doctorId/reduce-slot', async (req, res) => {
    const { doctorId } = req.params;
    const { date, slotKey } = req.body;
    if (!date || !slotKey) {
        return res.status(400).json({ success: false, message: 'date and slotKey are required' });
    }
    try {
        const docAvail = await DoctorAvailability.findOne({ doctorId });
        if (!docAvail) {
            return res.status(404).json({ success: false, message: 'Doctor availability not found' });
        }
        const dateEntry = docAvail.availability.find((a) => a.date === date);
        if (!dateEntry) {
            return res.status(404).json({ success: false, message: 'Date entry not found' });
        }
        const slotObj = dateEntry.slots.find((s) => s.slotKey === slotKey);
        if (!slotObj) {
            return res.status(404).json({ success: false, message: 'Slot not found' });
        }
        if (slotObj.count > 0) {
            slotObj.count -= 1;
            await docAvail.save();
            return res.status(200).json({ success: true, availability: docAvail });
        } else {
            return res.status(400).json({ success: false, message: 'No slots left' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to reduce slot count' });
    }
});

// Add POST endpoint to save a booking
app.post('/bookings', async (req, res) => {
    try {
        console.log('Booking request body:', req.body);
        // Ensure slot (slotKey) is present in the booking
        const booking = new Booking({
            ...req.body,
            slot: req.body.slot, // slotKey
            time: req.body.time,
            bookingId: req.body.bookingId,
        });
        await booking.save();

        // --- Push notification logic ---
        try {
            // Find the user by phone
            const user = await User.findOne({ phone: req.body.patientPhone });
            if (user && user.expoPushToken) {
                // Use dynamic import for node-fetch
                const fetch = (await import('node-fetch')).default;
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: user.expoPushToken,
                        title: 'Booking Confirmed',
                        body: `Your booking with Dr. ${req.body.doctorName} is confirmed!`,
                        data: { bookingId: booking.bookingId }
                    })
                });
            }
        } catch (err) {
            console.error('Failed to send push notification:', err);
        }
        // --- End push notification logic ---

        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to save booking' });
    }
});

// PATCH endpoint to update checked status
app.patch('/bookings/:id/checked', async (req, res) => {
    try {
        const { checked } = req.body;
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { checked },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.status(200).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update booking' });
    }
});

// Add GET endpoint to fetch all bookings
app.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// Endpoint to get bookings for a user by phone
app.get('/bookings/user/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const bookings = await Booking.find({ patientPhone: phone }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch user bookings' });
    }
});

// Endpoint to update doctor profile image
app.post('/doctor/:doctorId/profile-image', async (req, res) => {
    const { doctorId } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'imageUrl is required' });
    }
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            doctorId,
            { imageUri: imageUrl },
            { new: true }
        );
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.status(200).json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update doctor profile image' });
    }
});

// Endpoint to update user profile image
app.post('/user/:userId/profile-image', async (req, res) => {
    const { userId } = req.params;
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'imageUrl is required' });
    }
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { imageUri: imageUrl },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user profile image' });
    }
});

// PATCH endpoint to update doctor profile image as base64
app.patch('/doctors/:id/image', async (req, res) => {
    const { id } = req.params;
    const { imageBase64 } = req.body;
    if (!imageBase64) {
        return res.status(400).json({ success: false, message: 'imageBase64 is required' });
    }
    try {
        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { imageUri: imageBase64 },
            { new: true }
        );
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }
        res.status(200).json({ success: true, doctor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update doctor image' });
    }
});

// PATCH endpoint to update user info (name, email, phone)
app.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, location } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            id,
            { name, email, phone, ...(location !== undefined ? { location } : {}) },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// Toggle favorite doctor for a user
app.post('/users/:id/favorite', async (req, res) => {
    const { id } = req.params;
    const { doctorId } = req.body;
    if (!doctorId) {
        return res.status(400).json({ success: false, message: 'doctorId is required' });
    }
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const index = user.favoriteDoctors.findIndex(d => d.toString() === doctorId);
        let action;
        if (index > -1) {
            // Remove from favorites
            user.favoriteDoctors.splice(index, 1);
            action = 'removed';
        } else {
            // Add to favorites
            user.favoriteDoctors.push(doctorId);
            action = 'added';
        }
        await user.save();
        res.status(200).json({ success: true, action, favoriteDoctors: user.favoriteDoctors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update favorites' });
    }
});

// Admin login endpoint
app.post('/admin-login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password required' });
    }
    const admin = await Admin.findOne({ username, password });
    if (!admin) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
    // Generate JWT token for admin
    const token = jwt.sign(
        {
            id: admin._id,
            username: admin.username,
            role: admin.role
        },
        secretKey,
        { expiresIn: '7d' }
    );
    // Add name and adminId for frontend compatibility
    res.status(200).json({
        success: true,
        admin: {
            adminId: admin._id,
            name: admin.username, // or admin.name if you add a name field
            role: admin.role
        },
        token
    });
});