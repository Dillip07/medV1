const admin = require('firebase-admin');

// TODO: Replace with the path to your downloaded service account key JSON file
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin; 