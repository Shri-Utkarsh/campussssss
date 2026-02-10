const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['info', 'alert', 'success'],
        default: 'info',
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // e.g. ticket ID
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
