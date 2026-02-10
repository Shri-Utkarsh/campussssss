const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Electrical', 'Plumbing', 'Cleaning', 'Furniture', 'Infrastructure', 'IT'],
    },
    priority: {
        type: String,
        enum: ['Urgent', 'High', 'Normal', 'Low'],
        default: 'Normal',
    },
    block: { type: String, required: true },
    floor: { type: String, required: true },
    location: { type: String }, // specific room or spot
    images: {
        before: { type: String },
        after: { type: String },
    },
    status: {
        type: String,
        enum: ['Reported', 'Assigned', 'In Progress', 'Completed', 'Verified', 'Closed'],
        default: 'Reported',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    supporters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    slaDeadline: {
        type: Date,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    completionProof: { type: String }, // image URL
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true,
});

module.exports = mongoose.model('Ticket', ticketSchema);
