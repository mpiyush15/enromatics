import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    courseIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
    tenantId: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      default: "General",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "0 mins",
    },
    content: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
