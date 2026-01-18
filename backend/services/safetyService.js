const Checkin = require('../models/Checkin');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const nodemailer = require('nodemailer');

// Simple mock transporter or real one if env vars set
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass'
    }
});

const SafetyService = {
    checkAllUsers: () => {
        console.log('Running Safety Check...');
        User.getAll((err, users) => {
            if (err) return console.error('Error fetching users for safety check:', err);

            users.forEach(user => {
                Checkin.getLatest(user.id, (err, checkin) => {
                    if (err) return console.error(`Error checking user ${user.id}:`, err);

                    if (!checkin) {
                        // New user or no checkins yet. Should we warn? 
                        // Maybe give them grace period. Ignoring for now.
                        return;
                    }

                    const lastCheckinTime = new Date(checkin.created_at).getTime();
                    const now = Date.now();
                    const hoursSince = (now - lastCheckinTime) / (1000 * 60 * 60);

                    if (hoursSince > 48) {
                        SafetyService.triggerEmergency(user);
                    } else if (hoursSince > 24) {
                        SafetyService.sendWarning(user);
                    }
                });
            });
        });
    },

    sendWarning: (user) => {
        // Logic to avoid spamming? Ideally store "last_warning_sent_at" in DB.
        // For MVP, just log it.
        console.log(`[WARNING] User ${user.email} has not checked in for 24+ hours.`);
        // Mock email
        // transporter.sendMail(...)
    },

    triggerEmergency: (user) => {
        console.log(`[EMERGENCY] User ${user.email} has not checked in for 48+ hours. Contacting emergency contacts.`);
        EmergencyContact.getByUserId(user.id, (err, contacts) => {
            if (err) return console.error('Error fetching contacts:', err);

            contacts.forEach(contact => {
                console.log(`Sending Alert to ${contact.name} (${contact.email}) about ${user.name}`);
                // transporter.sendMail(...)
            });
        });
    }
};

module.exports = SafetyService;
