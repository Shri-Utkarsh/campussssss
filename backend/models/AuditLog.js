const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    details: String,
}, {
    timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
