import express from "express";
import { getSidebar } from "../controllers/uiController.js";
import { protectAny } from "../middleware/protectAny.js";

const router = express.Router();

router.get("/sidebar", protectAny, getSidebar);

export default router;
