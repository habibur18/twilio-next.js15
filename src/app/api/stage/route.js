import { Stages } from "@/models/stageSchema";
import connectMongo from "../../../../connectMongo";

// POST handler for the API endpoint
export async function POST(req) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Parse the incoming JSON request body
    const params = await req.json();

    // Check if a stages document exists
    let stages = await Stages.findOne();

    // If no stages document exists, create the initial stages
    if (!stages) {
      stages = new Stages({
        stages: [
          {
            title: "New Leads",
            leads: [], // CSV data will go here later
          },
          {
            title: "Contacted",
            leads: [], // Leads can be moved here later
          },
          {
            title: "Qualified",
            leads: [], // Leads can be moved here later
          },
        ],
      });

      await stages.save();
      console.log("Initial stages created");
    }

    // Here, you can handle any incoming updates or other logic
    // If you receive parameters to update stages, you can modify and save the data here
    // For example:
    // if (params.updateStage) {
    //     // Update logic here based on params
    // }

    // Send a response indicating success
    return new Response(JSON.stringify({ message: "Stages created or updated successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
