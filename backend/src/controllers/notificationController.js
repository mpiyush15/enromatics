import Notification from '../models/Notification.js';
import Student from '../models/Student.js';
import { sendEmail } from '../services/emailService.js';

// Create notification (Admin/Web App)
export const createNotification = async (req, res) => {
  try {
    const { title, message, type, priority, studentIds, data, expiresAt, sendEmailNotification = true } = req.body;
    const tenantId = req.user?.tenantId || req.body.tenantId;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // If studentIds provided, create individual notifications
    // If not, create for all students in tenant
    let targetStudents = [];
    
    if (studentIds && studentIds.length > 0) {
      // Fetch full student details for email
      targetStudents = await Student.find({ 
        _id: { $in: studentIds },
        tenantId 
      }).select('_id name email');
    } else {
      // Get all students for this tenant
      targetStudents = await Student.find({ tenantId }).select('_id name email');
    }

    // Create notifications in bulk
    const notifications = targetStudents.map(student => ({
      tenantId,
      studentId: student._id,
      title,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      data: data || {},
      expiresAt: expiresAt || null,
      createdBy: req.user?._id
    }));

    const result = await Notification.insertMany(notifications);

    // Send emails to students (asynchronously, don't wait)
    if (sendEmailNotification) {
      const emailPromises = targetStudents
        .filter(student => student.email) // Only send to students with email
        .map(student => {
          const emailHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .message-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                .priority { display: inline-block; padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
                .priority-high { background: #fee; color: #c33; }
                .priority-medium { background: #ffeaa7; color: #d63031; }
                .priority-low { background: #dfe6e9; color: #2d3436; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">📢 New Notification</h1>
                </div>
                <div class="content">
                  <p>Hi ${student.name},</p>
                  <p>You have received a new notification from your institute:</p>
                  
                  <div class="message-box">
                    ${priority ? `<span class="priority priority-${priority}">${priority.toUpperCase()} PRIORITY</span>` : ''}
                    <h2 style="margin-top: 10px; color: #667eea;">${title}</h2>
                    <p style="font-size: 16px; line-height: 1.8;">${message.replace(/\n/g, '<br>')}</p>
                  </div>
                  
                  <p style="margin-top: 20px;">Please check your mobile app for more details.</p>
                </div>
                <div class="footer">
                  <p>This is an automated notification from your institute.</p>
                  <p>© ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>
          `;

          return sendEmail({
            to: student.email,
            subject: `📢 ${title}`,
            html: emailHtml,
            tenantId,
            userId: student._id,
            type: 'notification'
          }).catch(err => {
            console.error(`Failed to send email to ${student.email}:`, err.message);
            // Don't throw - continue with other emails
          });
        });

      // Send all emails in parallel (don't wait for completion)
      Promise.all(emailPromises).then(() => {
        console.log(`✅ Sent ${emailPromises.length} notification emails`);
      }).catch(err => {
        console.error('Some emails failed:', err);
      });
    }

    console.log(`✅ Created ${result.length} notifications`);
    
    res.status(201).json({
      success: true,
      message: `Notification sent to ${result.length} students${sendEmailNotification ? ' (emails queued)' : ''}`,
      count: result.length,
      emailsSent: sendEmailNotification ? targetStudents.filter(s => s.email).length : 0
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
