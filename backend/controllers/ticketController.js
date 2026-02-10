const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { createNotification, createAuditLog } = require('../utils/activityLogger');

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (Faculty)
const createTicket = async (req, res) => {
    const { title, description, category, priority, block, floor, location } = req.body;

    // Handle images from multer
    let images = { before: '', after: '' };
    if (req.files && req.files.length > 0) {
        // Assuming first image is 'before'
        images.before = req.files[0].path;
        if (req.files.length > 1) images.after = req.files[1].path;
    }

    if (!title || !description || !category || !block || !floor) {
        return res.status(400).json({ message: 'Please add all required fields' });
    }

    try {
        // Duplicate detection logic could go here (simple check)
        const duplicate = await Ticket.findOne({
            block,
            floor,
            category,
            status: { $in: ['Reported', 'Assigned', 'In Progress'] },
            // Check if created recently or same location
        });

        if (duplicate) {
            // Add as supporter
            if (!duplicate.supporters.includes(req.user.id)) {
                duplicate.supporters.push(req.user.id);
                await duplicate.save();
            }
            return res.status(200).json({ message: 'Duplicate ticket detected. You have been added as a supporter.', ticket: duplicate });
        }

        // Set SLA based on priority
        let slaHours = 24;
        if (priority === 'Urgent') slaHours = 1;
        else if (priority === 'High') slaHours = 4;
        else if (priority === 'Low') slaHours = 72;

        const slaDeadline = new Date();
        slaDeadline.setHours(slaDeadline.getHours() + slaHours);
        // ...
        const ticket = await Ticket.create({
            title,
            description,
            category,
            priority,
            block,
            floor,
            location,
            images,
            createdBy: req.user.id,
            slaDeadline,
            history: [{ status: 'Reported', updatedBy: req.user.id }]
        });

        // Audit Log
        await createAuditLog('TICKET_CREATED', req.user.id, ticket._id, `Ticket created: ${title}`);

        // Notify Admins (logic to find admins) - Simplification: maybe just log for now or notify specific admin ID?
        // We can query all admins
        // const admins = await User.find({ role: 'admin' });
        // admins.forEach(admin => createNotification(admin._id, `New Ticket: ${title}`, 'alert', ticket._id));

        // Notify Workers if Urgent
        if (priority === 'Urgent') {
            const workers = await User.find({ role: 'worker' });
            workers.forEach(worker => createNotification(worker._id, `URGENT Job: ${title}`, 'alert', ticket._id));
        }

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
    try {
        let query = {};

        // Faculty sees only their tickets (or all? Usually their own or public ones. Let's show all for transparency or filtered)
        // Spec says: Faculty can "Track live status".
        // Worker sees open jobs.
        // Admin sees all.

        if (req.user.role === 'faculty') {
            query = { createdBy: req.user.id };
        } else if (req.user.role === 'worker') {
            // Workers see assigned to them OR unassigned (Reported)
            query = {
                $or: [
                    { status: 'Reported' },
                    { assignedTo: req.user.id }
                ]
            };
        }

        // Allow filtering by query params
        if (req.query.status) query.status = req.query.status;
        if (req.query.category) query.category = req.query.category;
        if (req.query.priority) query.priority = req.query.priority;

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update ticket status (Claim, Complete, Verify)
// @route   PATCH /api/tickets/:id
// @access  Private
const updateTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const { status } = req.body;

        // Handle completion proof image
        let completionProofUrl = null;
        if (req.file) {
            completionProofUrl = req.file.path;
        }

        // Worker claiming logic
        if (status === 'Assigned' && req.user.role === 'worker') {
            if (ticket.status !== 'Reported') {
                return res.status(400).json({ message: 'Ticket already assigned or closed' });
            }
            ticket.assignedTo = req.user.id;
            ticket.status = 'Assigned';

            await createAuditLog('JOB_CLAIMED', req.user.id, ticket._id);
            // Notify Faculty
            await createNotification(ticket.createdBy, `Your ticket "${ticket.title}" has been assigned to ${req.user.name}`, 'info', ticket._id);
        }
        // Worker completing logic
        else if (status === 'Completed' && req.user.role === 'worker') {
            if (ticket.assignedTo?.toString() !== req.user.id) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            ticket.status = 'Completed';
            if (completionProofUrl) ticket.completionProof = completionProofUrl;

            await createAuditLog('JOB_COMPLETED', req.user.id, ticket._id);
            // Notify Faculty
            await createNotification(ticket.createdBy, `Your ticket "${ticket.title}" is completed! Please rate.`, 'success', ticket._id);

            // Award points
            // Calculate points based on priority and timeliness
            // This logic can be extracted
            const user = await User.findById(req.user.id);
            let pointsToAdd = 10;
            if (ticket.priority === 'Urgent') pointsToAdd = 50;
            else if (ticket.priority === 'High') pointsToAdd = 30;

            user.points += pointsToAdd;
            user.totalJobs += 1;
            await user.save();
        }
        else {
            // Admin or general update
            if (req.body.status) ticket.status = req.body.status;
            if (req.body.assignedTo) ticket.assignedTo = req.body.assignedTo;
        }

        ticket.history.push({ status: ticket.status, updatedBy: req.user.id });
        const updatedTicket = await ticket.save();

        res.status(200).json(updatedTicket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    updateTicket,
};
