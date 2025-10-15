const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String },
    // Inside your EmployeeSchema, you can add this after the 'department' field
    team: { 
      type: String, 
      default: 'General' 
    },
    role: { 
      type: String, 
      enum: ["employee", "hr"], 
      default: "employee" 
    },
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // hashed password
    dateOfJoining: { type: Date, default: Date.now },
    
    // Add this inside your EmployeeSchema, for example, after dateOfJoining
     lastPromotionDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", EmployeeSchema);
