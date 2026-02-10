const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const createNotification = async (recipientId, message, type = 'info', relatedId = null) => {
    try {
        await Notification.create({
            recipient: recipientId,
            message,
            type,
            relatedId
        });
    } catch (error) {
        console.error('Notification creation failed:', error);
    }
};

const createAuditLog = async (action, userId, ticketId = null, details = '') => {
    try {
        await AuditLog.create({
            action,
            userId,
            ticketId,
            details
        });
    } catch (error) {
        console.error('AuditLog creation failed:', error);
    }
};

module.exports = { createNotification, createAuditLog };
