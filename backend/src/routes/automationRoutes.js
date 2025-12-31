import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  publishWorkflow,
  getTemplates,
  getTemplate,
  createWorkflowFromTemplate,
  getWorkflowAnalytics,
} from "../controllers/automationController.js";

const router = express.Router();

// Health check - no auth needed
router.get('/health', (req, res) => {
  res.json({ status: 'Automation routes are working' });
});

// All routes require authentication
router.use(protect);

/**
 * ==================== WORKFLOWS ====================
 */

// Create workflow from template (MUST BE BEFORE :workflowId routes)
router.post("/workflows/from-template/:templateId", createWorkflowFromTemplate);

// Get all workflows for tenant
router.get("/workflows", getWorkflows);

// Create new workflow
router.post("/workflows", createWorkflow);

// Get specific workflow
router.get("/workflows/:workflowId", getWorkflow);

// Update workflow
router.put("/workflows/:workflowId", updateWorkflow);

// Delete workflow (soft delete)
router.delete("/workflows/:workflowId", deleteWorkflow);

// Publish workflow
router.post("/workflows/:workflowId/publish", publishWorkflow);

// Get workflow analytics
router.get("/workflows/:workflowId/analytics", getWorkflowAnalytics);

/**
 * ==================== TEMPLATES ====================
 */

// Get public templates
router.get("/templates", getTemplates);

// Get specific template
router.get("/templates/:templateId", getTemplate);

export default router;
