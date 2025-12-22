import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Tenant"
  },
  type: {
    type: String,
    required: true,
    enum: ['receipt', 'refund', 'invoice']
  },
  prefix: {
    type: String,
    required: true
  },
  sequence: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Compound unique index to prevent duplicates
counterSchema.index({ tenantId: 1, type: 1, prefix: 1 }, { unique: true });

/**
 * Get next sequence number atomically
 * @param {ObjectId} tenantId - Tenant ID
 * @param {String} type - Counter type (receipt/refund/invoice)
 * @param {String} prefix - Prefix like RCP/2512/
 * @returns {Number} Next sequence number
 */
counterSchema.statics.getNextSequence = async function(tenantId, type, prefix) {
  const counter = await this.findOneAndUpdate(
    { tenantId, type, prefix },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );
  
  return counter.sequence;
};

export default mongoose.model("Counter", counterSchema);
