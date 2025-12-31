import AutomationWorkflow from "../models/AutomationWorkflow.js";
import WorkflowConversation from "../models/WorkflowConversation.js";
import WorkflowTemplate from "../models/WorkflowTemplate.js";

/**
 * ==================== AUTOMATION WORKFLOW CRUD ====================
 */

/**
 * @route   GET /api/automation/workflows
 * @desc    Get all workflows for a tenant
 * @access  Private – Tenant
 */
export const getWorkflows = async (req, res) => {
  try {
    console.log('📌 getWorkflows called');
    console.log('📌 req.user:', req.user ? { id: req.user._id, email: req.user.email, tenantId: req.user.tenantId } : 'null');
    
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      console.warn('⚠️ No tenantId found in req.user');
      return res.status(401).json({
        success: false,
        message: "Missing tenantId - ensure user is properly authenticated with tenant context",
      });
    }

    const { status } = req.query;

    const filter = { tenantId };
    if (status) filter.status = status;

    console.log('🔍 Searching workflows with filter:', filter);
    const workflows = await AutomationWorkflow.find(filter)
      .select("-questions") // Don't fetch questions in list view
      .sort({ createdAt: -1 });

    console.log('✅ Found', workflows.length, 'workflows');
    res.json({
      success: true,
      count: workflows.length,
      workflows,
    });
  } catch (error) {
    console.error("❌ Get workflows error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workflows",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/automation/workflows/:workflowId
 * @desc    Get a specific workflow with all questions
 * @access  Private – Tenant
 */
export const getWorkflow = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { workflowId } = req.params;

    const workflow = await AutomationWorkflow.findOne({
      _id: workflowId,
      tenantId,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    res.json({
      success: true,
      workflow,
    });
  } catch (error) {
    console.error("❌ Get workflow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workflow",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/automation/workflows
 * @desc    Create a new workflow
 * @access  Private – Tenant
 */
export const createWorkflow = async (req, res) => {
  try {
    console.log('📌 createWorkflow called');
    console.log('📌 req.user:', req.user ? { id: req.user._id, email: req.user.email, tenantId: req.user.tenantId } : 'null');
    console.log('📌 req.body:', req.body);
    
    const tenantId = req.user?.tenantId;
    
    if (!tenantId) {
      console.warn('⚠️ No tenantId found in req.user');
      return res.status(401).json({
        success: false,
        message: "Missing tenantId - ensure user is properly authenticated with tenant context",
      });
    }

    const {
      name,
      description,
      type,
      questions,
      linkedPhoneNumber,
      triggerKeyword,
      initialMessage,
      completionMessage,
      status,
      isPublished,
    } = req.body;

    // Validate required fields
    if (!name || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name and at least one question are required",
      });
    }

    // Validate at least name and mobile are in questions
    const hasNameQuestion = questions.some((q) => q.isNameField);
    const hasMobileQuestion = questions.some((q) => q.isMobileField);

    if (!hasNameQuestion || !hasMobileQuestion) {
      return res.status(400).json({
        success: false,
        message: "Workflow must include questions for Name and Mobile Number",
      });
    }

    // Generate unique IDs for questions
    const questionsWithIds = questions.map((q, index) => ({
      ...q,
      id: q.id || `q_${Date.now()}_${index}`,
      order: index,
    }));

    const workflow = new AutomationWorkflow({
      tenantId,
      name,
      description,
      type: type || "custom",
      questions: questionsWithIds,
      linkedPhoneNumber,
      triggerKeyword: triggerKeyword || "hi",
      initialMessage:
        initialMessage ||
        "Thanks for reaching out! Let me ask you a few questions.",
      completionMessage:
        completionMessage || "Thanks for your responses! Our team will contact you soon.",
      status: status || "draft",
      isPublished: isPublished || false,
      publishedAt: isPublished ? new Date() : null,
    });

    await workflow.save();

    console.log(`✅ Workflow created - ID: ${workflow._id}, Tenant: ${tenantId}`);

    res.status(201).json({
      success: true,
      message: "Workflow created successfully",
      workflow,
    });
  } catch (error) {
    console.error("❌ Create workflow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create workflow",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/automation/workflows/:workflowId
 * @desc    Update a workflow
 * @access  Private – Tenant
 */
export const updateWorkflow = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { workflowId } = req.params;
    const { name, description, questions, linkedPhoneNumber, triggerKeyword, initialMessage, completionMessage, status } = req.body;

    const workflow = await AutomationWorkflow.findOne({
      _id: workflowId,
      tenantId,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    // Don't allow status changes for published workflows
    if (workflow.isPublished && status && status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot change status of published workflow",
      });
    }

    // Update fields
    if (name) workflow.name = name;
    if (description) workflow.description = description;
    if (questions) {
      const questionsWithIds = questions.map((q, index) => ({
        ...q,
        id: q.id || `q_${Date.now()}_${index}`,
        order: index,
      }));
      workflow.questions = questionsWithIds;
    }
    if (linkedPhoneNumber) workflow.linkedPhoneNumber = linkedPhoneNumber;
    if (triggerKeyword) workflow.triggerKeyword = triggerKeyword.toLowerCase();
    if (initialMessage) workflow.initialMessage = initialMessage;
    if (completionMessage) workflow.completionMessage = completionMessage;
    if (status) workflow.status = status;

    workflow.lastModifiedAt = new Date();
    await workflow.save();

    console.log(`✅ Workflow updated - ID: ${workflowId}`);

    res.json({
      success: true,
      message: "Workflow updated successfully",
      workflow,
    });
  } catch (error) {
    console.error("❌ Update workflow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update workflow",
      error: error.message,
    });
  }
};

/**
 * @route   DELETE /api/automation/workflows/:workflowId
 * @desc    Delete a workflow (soft delete - mark as inactive)
 * @access  Private – Tenant
 */
export const deleteWorkflow = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { workflowId } = req.params;

    const workflow = await AutomationWorkflow.findOne({
      _id: workflowId,
      tenantId,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    // ✅ Soft delete - mark workflow as inactive (don't permanently remove)
    workflow.status = "inactive";
    workflow.isPublished = false; // Also unpublish it
    await workflow.save();

    console.log(`✅ Workflow marked as inactive - ID: ${workflowId} - Name: ${workflow.name}`);

    res.json({
      success: true,
      message: "Workflow deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete workflow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete workflow",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/automation/workflows/:workflowId/publish
 * @desc    Publish a workflow (make it active and set trigger)
 * @access  Private – Tenant
 */
export const publishWorkflow = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { workflowId } = req.params;

    const workflow = await AutomationWorkflow.findOne({
      _id: workflowId,
      tenantId,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    if (!workflow.linkedPhoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Please link a WhatsApp phone number before publishing",
      });
    }

    workflow.status = "active";
    workflow.isPublished = true;
    workflow.publishedAt = new Date();
    await workflow.save();

    console.log(`✅ Workflow published - ID: ${workflowId}`);

    res.json({
      success: true,
      message: "Workflow published successfully",
      workflow,
    });
  } catch (error) {
    console.error("❌ Publish workflow error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to publish workflow",
      error: error.message,
    });
  }
};

/**
 * ==================== WORKFLOW TEMPLATES ====================
 */

/**
 * @route   GET /api/automation/templates
 * @desc    Get public templates (for all tenants to use)
 * @access  Private – Tenant
 */
export const getTemplates = async (req, res) => {
  try {
    const { category, type } = req.query;

    const filter = { isPublic: true, status: "active" };
    if (category) filter.category = category;
    if (type) filter.type = type;

    const templates = await WorkflowTemplate.find(filter)
      .select("-questions") // Don't fetch questions in list
      .sort({ usageCount: -1, createdAt: -1 });

    res.json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("❌ Get templates error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};

/**
 * @route   GET /api/automation/templates/:templateId
 * @desc    Get a specific template
 * @access  Private – Tenant
 */
export const getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await WorkflowTemplate.findOne({
      _id: templateId,
      isPublic: true,
      status: "active",
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("❌ Get template error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch template",
      error: error.message,
    });
  }
};

/**
 * @route   POST /api/automation/workflows/from-template/:templateId
 * @desc    Create workflow from template
 * @access  Private – Tenant
 */
export const createWorkflowFromTemplate = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { templateId } = req.params;
    const { name } = req.body;

    const template = await WorkflowTemplate.findOne({
      _id: templateId,
      isPublic: true,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }

    // Create workflow from template
    const workflow = new AutomationWorkflow({
      tenantId,
      name: name || `${template.name} - Copy`,
      description: template.description,
      type: template.type,
      questions: template.questions,
      triggerKeyword: template.triggerKeyword,
      initialMessage: template.initialMessage,
      completionMessage: template.completionMessage,
      status: "draft",
    });

    await workflow.save();

    // Increment template usage
    template.usageCount = (template.usageCount || 0) + 1;
    await template.save();

    console.log(`✅ Workflow created from template - ID: ${workflow._id}`);

    res.status(201).json({
      success: true,
      message: "Workflow created from template",
      workflow,
    });
  } catch (error) {
    console.error("❌ Create from template error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create workflow from template",
      error: error.message,
    });
  }
};

/**
 * ==================== WORKFLOW ANALYTICS ====================
 */

/**
 * @route   GET /api/automation/workflows/:workflowId/analytics
 * @desc    Get analytics for a workflow
 * @access  Private – Tenant
 */
export const getWorkflowAnalytics = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { workflowId } = req.params;

    const workflow = await AutomationWorkflow.findOne({
      _id: workflowId,
      tenantId,
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: "Workflow not found",
      });
    }

    // Get conversation stats
    const allConversations = await WorkflowConversation.countDocuments({
      workflowId,
      tenantId,
    });

    const completedConversations = await WorkflowConversation.countDocuments({
      workflowId,
      tenantId,
      status: "completed",
    });

    const abandonedConversations = await WorkflowConversation.countDocuments({
      workflowId,
      tenantId,
      status: "abandoned",
    });

    const leadsCreated = await WorkflowConversation.countDocuments({
      workflowId,
      tenantId,
      crmLeadId: { $ne: null },
    });

    const completionRate =
      allConversations > 0 ? ((completedConversations / allConversations) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      analytics: {
        totalConversations: allConversations,
        completedConversations,
        abandonedConversations,
        inProgressConversations: allConversations - completedConversations - abandonedConversations,
        leadsCreated,
        completionRate: `${completionRate}%`,
      },
    });
  } catch (error) {
    console.error("❌ Get analytics error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};
