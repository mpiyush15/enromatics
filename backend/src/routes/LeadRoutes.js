import express from "express";
import Lead from "../models/Lead.js";

const router = express.Router();

// 🟢 POST: Add a new lead
router.post("/add", async (req, res) => {
  try {
    const { name, mobile } = req.body;

    if (!name || !mobile) {
      return res
        .status(400)
        .json({ message: "Name and Mobile fields are required" });
    }

    const lead = await Lead.create({ name, mobile });

    res.status(201).json({
      message: "Lead created successfully ✅",
      lead,
    });

    console.log("📥 New Lead Added:", lead);
  } catch (err) {
    console.error("❌ Lead Creation Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟣 GET: Fetch all leads
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.status(200).json(leads);
  } catch (err) {
    console.error("❌ Error fetching leads:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🟠 DELETE: Remove a lead (optional)
router.delete("/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead)
      return res.status(404).json({ message: "Lead not found" });

    res.status(200).json({ message: "Lead deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
