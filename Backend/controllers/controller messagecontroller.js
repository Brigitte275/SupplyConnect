const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');

// Get user's messages
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20, folder = 'inbox' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (folder === 'inbox') {
      query.recipient = req.userId;
    } else if (folder === 'sent') {
      query.sender = req.userId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('product', 'name images price')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Message.countDocuments(query);
    
    // Get unread count
    const unreadCount = await Message.countDocuments({
      recipient: req.userId,
      read: false
    });

    res.json({
      messages,
      total,
      unreadCount,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single message
exports.getMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email role')
      .populate('recipient', 'name email role')
      .populate('product');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.sender._id.toString() !== req.userId && 
        message.recipient._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Mark as read if recipient is viewing
    if (message.recipient._id.toString() === req.userId && !message.read) {
      message.read = true;
      message.readAt = Date.now();
      await message.save();
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { recipient, product, subject, content } = req.body;

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if product exists (if provided)
    if (product) {
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).json({ message: 'Product not found' });
      }
    }

    const message = new Message({
      sender: req.userId,
      recipient,
      product,
      subject,
      content,
      read: false
    });

    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'name email');
    await message.populate('recipient', 'name email');

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark message as read
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the recipient
    if (message.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    message.read = true;
    message.readAt = Date.now();
    await message.save();

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is sender or recipient
    if (message.sender.toString() !== req.userId && 
        message.recipient.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await message.remove();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
      .populate('sender', 'name email')
      .populate('recipient', 'name email')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        recipient: req.userId,
        read: false
      },
      {
        read: true,
        readAt: Date.now()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};