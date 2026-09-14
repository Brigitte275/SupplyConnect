const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All message routes are protected
router.use(auth);

router.get('/', messageController.getMessages);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/:id', messageController.getMessage);
router.post('/', messageController.sendMessage);
router.put('/:id/read', messageController.markAsRead);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;