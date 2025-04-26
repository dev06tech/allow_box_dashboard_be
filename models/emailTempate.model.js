const mongoose = require("mongoose");
const { create } = require("./user.model");

var emailTemplateSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      "verify-account",
      "reset-password",
      "password-changed",
      "new-super-admin",
      "new-admin",
      "new-school-admin",
      "new-teacher",
      "new-student",
      "new-parent"
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