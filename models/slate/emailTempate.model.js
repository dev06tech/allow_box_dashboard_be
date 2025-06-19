const mongoose = require("mongoose");

var emailTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "verify-email",
      "re-verify-email", 
      "reset-password",
      "password-changed",
      "new-super-admin",
      "new-teacher",
      "new-student",
      "new-parent",
      "new-support",
      "school-payment-reminder"
    ],
  },
  email: {
    type: String,
    required: true,
    default: "support@allowbox.com",
  },
  emailContent: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  }
});

emailTemplateSchema.set("timestamps", true);

const EmailTemplate = mongoose.model("email-templates", emailTemplateSchema);

module.exports = EmailTemplate;