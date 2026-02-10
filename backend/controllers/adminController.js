const User = require('../models/User');
const Ticket = require('../models/Ticket');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
    try {
        const totalTickets = await Ticket.countDocuments();
        const pendingTickets = await Ticket.countDocuments({ status: { $ne: 'Closed' } });
        const urgentTickets = await Ticket.countDocuments({ priority: 'Urgent' });

        // Calculate average completion time (rough estimate based on Completed tickets)
        // improved logic: aggregate duration
        const completedTickets = await Ticket.find({ status: 'Completed' });
        let totalDuration = 0;
        let completedCount = 0;

        completedTickets.forEach(ticket => {
            const created = new Date(ticket.createdAt);
            const actions = ticket.history.find(h => h.status === 'Completed');
            if (actions) {
                const completed = new Date(actions.timestamp);
                totalDuration += (completed - created); // ms
                completedCount++;
            }
        });

        const avgCompletionTimeHours = completedCount > 0 ? (totalDuration / completedCount / (1000 * 60 * 60)).toFixed(1) : 0;

        res.status(200).json({
            totalTickets,
            pendingTickets,
            urgentTickets,
            avgCompletionTimeHours,
            completedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
};
