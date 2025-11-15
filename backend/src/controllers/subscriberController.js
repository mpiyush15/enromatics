import Subscriber from "../models/subscriber.js";
import jwt from "jsonwebtoken";

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

    res.status(201).json({
      _id: subscriber._id,
      name: subscriber.name,
      email: subscriber.email,
      businessName: subscriber.businessName,
      token: generateToken(subscriber._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
