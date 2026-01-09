import mongoose from "mongoose";

/**
 * WhatsApp Chatbot Schema
 * Stores chatbot configurations for each tenant
 * Chatbots can respond to keywords automatically using templates
 */

const whatsappChatbotSchema = new mongoose.Schema(
  {
    // Tenant identifier
    tenantId: {
      type: String,
      required: true,
      index: true,
    },

    // Chatbot name
    botName: {
      type: String,
      required: true,
    },

    // Chatbot description
    description: {
      type: String,
      default: "",
    },

    // Whether chatbot is enabled
    isEnabled: {
      type: Boolean,
      default: true,
    },

    // Welcome message template ID
    welcomeTemplateId: {
      type: String,
      default: null,
    },

    // Keywords and their responses
    keywords: [
      {
        keyword: {
          type: String,
          required: true,
        },
        // Can be a template ID or custom response
        templateId: {
          type: String,
          default: null,
        },
        // Or a custom text response
        customResponse: {
          type: String,
          default: null,
        },
        // Whether this keyword should trigger auto-response
        isActive: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Response settings
    settings: {
      // Whether to send welcome message to new conversations
      sendWelcomeMessage: {
        type: Boolean,
        default: true,
      },
      // Typing indicator before sending response
      showTypingIndicator: {
        type: Boolean,
        default: true,
      },
      // Delay (in ms) before sending response
      responseDelay: {
        type: Number,
        default: 1000,
      },
    },

    // Statistics
    stats: {
      totalConversations: {
        type: Number,
        default: 0,
      },
      totalResponses: {
        type: Number,
        default: 0,
      },
      lastActive: {
        type: Date,
        default: null,
      },
    },

    // Sync status with WhatsApp Platform
    syncedToWhatsApp: {
      type: Boolean,
      default: false,
    },
    whatsappBotId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Create index for tenant + botName
whatsappChatbotSchema.index({ tenantId: 1, botName: 1 });

// Model creation
const WhatsAppChatbot =
  mongoose.models.WhatsAppChatbot ||
  mongoose.model("WhatsAppChatbot", whatsappChatbotSchema);

export default WhatsAppChatbot;
