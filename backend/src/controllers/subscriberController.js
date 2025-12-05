import Subscriber from "../models/Subscriber.js";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail, sendEmail } from "../services/emailService.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @desc Register new subscriber (business)
export const registerSubscriber = async (req, res) => {
  try {
    const { name, email, password, businessName } = req.body;

    const existing = await Subscriber.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Subscriber already exists" });

    const subscriber = await Subscriber.create({
      name,
      email,
      password,
      businessName,
    });

    // Send welcome email to new subscriber (non-blocking)
    sendWelcomeEmail({
      to: email,
      name,
      tenantId: subscriber._id,
      userId: subscriber._id
    }).catch(err => console.error('❌ Failed to send welcome email:', err.message));

    // Notify super admin about new subscriber (non-blocking)
    if (process.env.SUPER_ADMIN_EMAIL) {
      sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `🎉 New Subscriber: ${businessName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
            <h2 style="color: #3b82f6;">New Subscriber Registered</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Business:</strong> ${businessName}</p>
              <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p><a href="${process.env.FRONTEND_URL}/dashboard/admin/subscribers" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View in Dashboard</a></p>
          </div>
        `,
        type: 'admin-notification'
      }).catch(err => console.error('❌ Failed to send admin notification:', err.message));
    }

    res.status(201).json({
      _id: subscriber._id,
      name: subscriber.name,
      email: subscriber.email,
      businessName: subscriber.businessName,
      token: generateToken(subscriber._id),
    });
  } catch (err) {
    console.error('Subscriber registration error:', err);
    res.status(500).json({ message: err.message });
  }
};

