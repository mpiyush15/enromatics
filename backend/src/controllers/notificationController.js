import Notification from '../models/Notification.js';
import Student from '../models/Student.js';

// Create notification (Admin/Web App)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, studentIds, data, expiresAt } = req.body;
    const tenantId = req.user?.tenantId || req.body.tenantId;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // If studentIds provided, create individual notifications
    // If not, create for all students in tenant
    let targetStudents = [];
    
    if (studentIds && studentIds.length > 0) {
      targetStudents = studentIds;
    } else {
      // Get all students for this tenant
      const students = await Student.find({ tenantId }).select('_id');
      targetStudents = students.map(s => s._id);
    }

    // Create notifications in bulk
    const notifications = targetStudents.map(studentId => ({
      tenantId,
      studentId,
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      data: data || {},
      expiresAt: expiresAt || null,
      createdBy: req.user?._id
    }));

    const result = await Notification.insertMany(notifications);

    console.log(`✅ Created ${result.length} notifications`);
    
    res.status(201).json({
      success: true,
      message: `Notification sent to ${result.length} students`,
      count: result.length
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
};

// Get notifications for student (Mobile App)
export const getStudentNotifications = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const query = {
      tenantId: req.student.tenantId,
      studentId: req.student._id,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    const unreadCount = await Notification.countDocuments({
      tenantId: req.student.tenantId,
      studentId: req.student._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Get student notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        studentId: req.student._id,
        tenantId: req.student.tenantId
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const result = await Notification.updateMany(
      {
        studentId: req.student._id,
        tenantId: req.student.tenantId,
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    if (!req.student) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      studentId: req.student._id,
      tenantId: req.student.tenantId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};
