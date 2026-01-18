const Checkin = require('../models/Checkin');
const User = require('../models/User');
const EmergencyContact = require('../models/EmergencyContact');
const { sendEmail } = require('./emailService');

// Templates
const getWarningTemplate = (name) => `
  <h1>Check-in Reminder ⚠️</h1>
  <p>Hi ${name},</p>
  <p>We haven't heard from you in over 24 hours.</p>
  <p>Please log in and check in to let us know you're okay.</p>
  <p>Stay safe,<br>HowUBeen Team</p>
`;

const getEmergencyTemplate = (contactName, userName) => `
  <h1>Urgent: Emergency Alert 🚨</h1>
  <p>Hi ${contactName},</p>
  <p>This is an automatic alert from <b>HowUBeen</b>.</p>
  <p>Our user <b>${userName}</b> has not checked in for over 48 hours.</p>
  <p>Please try to contact them immediately to ensure they are safe.</p>
`;

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
        console.log(`[WARNING] Sending email to ${user.email} (24h+ inactive)`);
        const subject = "⚠️ HowUBeen: We missed you today";
        const html = getWarningTemplate(user.name);
        sendEmail(user.email, subject, html);
    },

    triggerEmergency: (user) => {
        console.log(`[EMERGENCY] User ${user.email} has not checked in for 48+ hours. Contacting emergency contacts.`);
        EmergencyContact.getByUserId(user.id, (err, contacts) => {
            if (err) return console.error('Error fetching contacts:', err);

            contacts.forEach(contact => {
                console.log(`[EMERGENCY] Sending alert to ${contact.name} (${contact.email}) about ${user.name}`);
                const subject = `🚨 EMERGENCY: Check on ${user.name}`;
                const html = getEmergencyTemplate(contact.name, user.name);
                sendEmail(contact.email, subject, html);
            });
        });
    }
};

module.exports = SafetyService;
