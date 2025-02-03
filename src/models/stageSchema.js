import mongoose from "mongoose";

// Define the schema for each stage (New Leads, Contacted, Qualified)
const stageSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Stage title (e.g., "New Leads", "Contacted", etc.)
  leads: [{ type: mongoose.Schema.Types.Mixed }], // Array of dynamic leads data
});

// Create the main schema for managing all stages
const stagesSchema = new mongoose.Schema({
  stages: [
    {
      title: { type: String, required: true, enum: ["New Leads", "Contacted", "Qualified"] }, // Fixed set of titles
      leads: [{ type: mongoose.Schema.Types.Mixed }], // Dynamically store leads (from CSV or front-end)
    },
  ],
});

// Create the Mongoose model for stages

export const Stages = mongoose.models.Stages ?? mongoose.model("Stages", stagesSchema);
