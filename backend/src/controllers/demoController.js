import DemoRequest from "../models/DemoRequest.js";
import { sendEmail } from "../services/emailService.js";

/**
 * 🔹 1. Create Demo Request
 */
export const createDemoRequest = async (req, res) => {
  try {
    const { name, email, phone, company, message, demoDateTime, date, time } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !company || !demoDateTime) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Check if email already has a pending demo
    const existingDemo = await DemoRequest.findOne({
      email,
      status: "pending",
    });

    if (existingDemo) {
      return res.status(409).json({
        message: "You already have a pending demo request",
      });
    }

    // Create new demo request
    const demoRequest = new DemoRequest({
      name,
      email,
      phone,
      company,
      message: message || "",
      demoDateTime: new Date(demoDateTime),
      date,
      time,
      status: "pending",
    });

    await demoRequest.save();

    console.log("✅ Demo request created:", demoRequest._id);

    // Send confirmation email to requester
    await sendEmail({
      to: email,
      subject: "Demo Request Received - Enromatics",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .demo-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Demo Request Received!</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Thank you for requesting a demo of Enromatics! We've received your request and our team will contact you shortly.</p>
              
              <div class="demo-box">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Your Demo Details:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Company:</strong> ${company}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Requested Date & Time:</strong> ${new Date(demoDateTime).toLocaleString()}</p>
                ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              </div>

              <p><strong>What's Next?</strong></p>
              <ol>
                <li>Our team will review your request</li>
                <li>We'll confirm the demo schedule via email/phone</li>
                <li>You'll receive a meeting link before the demo</li>
              </ol>

              <p>We look forward to showing you how Enromatics can transform your institute! 🚀</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@enromatics.com</p>
              <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      type: 'demo-request'
    });

    // Notify super admin about new demo request
    if (process.env.SUPER_ADMIN_EMAIL) {
      await sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `🎯 New Demo Request: ${company}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #3b82f6;">New Demo Request Received</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Requested Date & Time:</strong> ${new Date(demoDateTime).toLocaleString()}</p>
              ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
              <p><strong>Status:</strong> <span style="background: #fbbf24; padding: 4px 8px; border-radius: 4px;">Pending</span></p>
            </div>
            <p><a href="${process.env.FRONTEND_URL}/dashboard/admin/demo-requests" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View & Manage</a></p>
          </div>
        `,
        type: 'admin-notification'
      });
    }

    res.status(201).json({
      message: "Demo request created successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Create Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to create demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 2. Get All Demo Requests (SuperAdmin Only)
 */
export const getAllDemoRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const demoRequests = await DemoRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await DemoRequest.countDocuments(filter);

    res.status(200).json({
      message: "Demo requests retrieved successfully",
      demoRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ Get All Demo Requests Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo requests",
      error: err.message,
    });
  }
};

/**
 * 🔹 3. Get Single Demo Request
 */
export const getDemoRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const demoRequest = await DemoRequest.findById(id);

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    res.status(200).json({
      message: "Demo request retrieved successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Get Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 4. Update Demo Request Status (SuperAdmin Only)
 */
export const updateDemoRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const demoRequest = await DemoRequest.findByIdAndUpdate(
      id,
      {
        status,
        notes: notes || demoRequest?.notes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    console.log("✅ Demo request updated:", id, "Status:", status);

    // Send email notification to requester based on status
    let emailSubject = '';
    let emailHtml = '';

    if (status === 'confirmed') {
      emailSubject = '✅ Demo Confirmed - Enromatics';
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .demo-box { background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">✅ Your Demo is Confirmed!</h1>
            </div>
            <div class="content">
              <p>Hi ${demoRequest.name},</p>
              <p>Great news! Your demo request for <strong>${demoRequest.company}</strong> has been confirmed by our team.</p>
              
              <div class="demo-box">
                <h3 style="margin-top: 0; color: #059669;">📅 Demo Schedule:</h3>
                <p><strong>Date & Time:</strong> ${new Date(demoRequest.demoDateTime).toLocaleString()}</p>
                <p><strong>Company:</strong> ${demoRequest.company}</p>
                ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
              </div>

              <p><strong>What to Expect:</strong></p>
              <ul>
                <li>Our product expert will walk you through Enromatics</li>
                <li>Live demo of key features tailored to your needs</li>
                <li>Q&A session to address your questions</li>
                <li>Discussion about pricing and next steps</li>
              </ul>

              <p>We'll send you the meeting link closer to the demo time. Looking forward to showing you Enromatics! 🚀</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@enromatics.com</p>
              <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'cancelled') {
      emailSubject = 'Demo Request Status - Enromatics';
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Demo Request Update</h1>
            </div>
            <div class="content">
              <p>Hi ${demoRequest.name},</p>
              <p>We're sorry, but we're unable to schedule the demo at the requested time.</p>
              
              ${notes ? `<div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;"><p><strong>Note:</strong> ${notes}</p></div>` : ''}

              <p>We'd still love to show you Enromatics! You can:</p>
              <ul>
                <li>Request a new demo with different dates</li>
                <li>Contact us directly at support@enromatics.com</li>
                <li>Check out our product tour on our website</li>
              </ul>

              <p style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/demo" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Request New Demo</a>
              </p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@enromatics.com</p>
              <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (status === 'completed') {
      emailSubject = '🎉 Thank You for the Demo - Enromatics';
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 Thank You!</h1>
            </div>
            <div class="content">
              <p>Hi ${demoRequest.name},</p>
              <p>Thank you for taking the time to see Enromatics in action! We hope you found the demo valuable.</p>
              
              <h3>📋 Next Steps:</h3>
              <ul>
                <li>Review the demo materials we shared</li>
                <li>Explore our pricing plans</li>
                <li>Start your free trial when you're ready</li>
                <li>Reach out with any questions</li>
              </ul>

              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/plans" style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">View Pricing</a>
                <a href="${process.env.FRONTEND_URL}/subscribe/free_trial" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 5px;">Start Free Trial</a>
              </p>

              <p>Our team is here to help you get started. Feel free to reach out anytime!</p>
            </div>
            <div class="footer">
              <p>Questions? Contact us at support@enromatics.com</p>
              <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email if status changed to confirmed, cancelled, or completed
    if (emailSubject && emailHtml) {
      await sendEmail({
        to: demoRequest.email,
        subject: emailSubject,
        html: emailHtml,
        type: 'demo-status'
      });
    }

    res.status(200).json({
      message: "Demo request updated successfully",
      demoRequest,
    });
  } catch (err) {
    console.error("❌ Update Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to update demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 5. Delete Demo Request (SuperAdmin Only)
 */
export const deleteDemoRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const demoRequest = await DemoRequest.findByIdAndDelete(id);

    if (!demoRequest) {
      return res.status(404).json({
        message: "Demo request not found",
      });
    }

    console.log("✅ Demo request deleted:", id);

    res.status(200).json({
      message: "Demo request deleted successfully",
    });
  } catch (err) {
    console.error("❌ Delete Demo Request Error:", err);
    res.status(500).json({
      message: "Failed to delete demo request",
      error: err.message,
    });
  }
};

/**
 * 🔹 6. Get Demo Stats
 */
export const getDemoStats = async (req, res) => {
  try {
    const stats = await DemoRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRequests = await DemoRequest.countDocuments();

    res.status(200).json({
      message: "Demo stats retrieved successfully",
      stats: {
        total: totalRequests,
        byStatus: stats.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    console.error("❌ Get Demo Stats Error:", err);
    res.status(500).json({
      message: "Failed to fetch demo stats",
      error: err.message,
    });
  }
};
