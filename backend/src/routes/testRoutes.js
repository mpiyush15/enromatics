import express from "express";
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ message: "✅ Backend connected successfully!" });
});

export default router;
