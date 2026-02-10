const express = require('express');
const router = express.Router();
const { createTicket, getTickets, getTicketById, updateTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, authorize('faculty', 'admin'), upload.array('images', 2), createTicket)
    .get(protect, getTickets);

router.route('/:id')
    .get(protect, getTicketById)
    .patch(protect, upload.single('completionProof'), updateTicket); // claim, status update, completion upload

module.exports = router;
