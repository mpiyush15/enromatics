import express from "express";
import Formschema from "../models/Subscriber.js";

const router = express.Router();

router.post("/submit", async (req, res) => {
  try {
    const formData = req.body;
    const savedData = await Form.create(formData);
    res.status(201).json({ message: "Form data saved successfully", data: savedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving form data" });
  }
});

export default router;
