import express from "express";
import { registerSubscriber } from "../controllers/subscriberController.js";

const router = express.Router();

router.post("/register", registerSubscriber);

export default router;
