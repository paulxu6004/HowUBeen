// backend/utils/messaging.js

async function sendNotification(contactInfo, message) {
  console.log(`Mock message sent to ${contactInfo}: ${message}`);
  return true;
}

module.exports = { sendNotification };
