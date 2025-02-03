import { Stages } from "@/models/stageSchema";
import csv from "csv-parser";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import connectMongo from "../../../../../connectMongo";

export async function POST(request, { params }) {
  try {
    // Connect to MongoDB
    await connectMongo();

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const results = [];

    // Parse CSV
    const stream = Readable.from(Buffer.from(buffer));
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => results.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Find the stage document by ID
    const stageId = (await params).id;
    const stage = await Stages.findById(stageId);
    console.log(stage);

    if (!stage) {
      return NextResponse.json({ error: "Stages document not found" }, { status: 404 });
    }

    // Find the "New Leads" stage
    const newLeadsStage = stage.stages.find((stage) => stage.title === "New Leads");
    if (!newLeadsStage) {
      return NextResponse.json({ error: "New Leads stage not found" }, { status: 404 });
    }

    // // Add the leads from CSV to the "New Leads" stage
    // newLeadsStage.leads.push(...results);
    // Add the leads from CSV to the "New Leads" stage, assigning a new _id to each
    const leadsWithIds = results.map((lead) => ({
      ...lead,
      _id: new mongoose.Types.ObjectId(),
    }));
    newLeadsStage.leads.push(...leadsWithIds);

    // Save the updated stages document
    await stage.save();

    return NextResponse.json({ message: "CSV uploaded and leads added to New Leads" }, { status: 200 });
  } catch (error) {
    console.error("Error processing the file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  // Handle GET requests
  const id = (await params).id;

  // get stages document
  const stage = await Stages.findById(id);
  if (!stage) {
    return NextResponse.json({ error: "Stages document not found" }, { status: 404 });
  }

  return NextResponse.json({ stage }, { status: 200 });
}

export async function PATCH(request, { params }) {
  try {
    // Connect to MongoDB
    await connectMongo();

    const id = (await params).id;
    const { sourceColumnId, destinationColumnId, leadId, newIndex } = await request.json();

    // Find the stage document by ID
    const stage = await Stages.findById(id);

    if (!stage) {
      return NextResponse.json({ error: "Stages document not found" }, { status: 404 });
    }

    // Find the source and destination columns
    const sourceColumn = stage.stages.find((col) => col._id.toString() === sourceColumnId);
    const destColumn = stage.stages.find((col) => col._id.toString() === destinationColumnId);

    if (!sourceColumn || !destColumn) {
      return NextResponse.json({ error: "Source or destination column not found" }, { status: 404 });
    }

    // Find and remove the lead from the source column
    const leadIndex = sourceColumn.leads.findIndex((lead) => lead._id.toString() === leadId);
    if (leadIndex === -1) {
      return NextResponse.json({ error: "Lead not found in source column" }, { status: 404 });
    }
    const [movedLead] = sourceColumn.leads.splice(leadIndex, 1);

    // Insert the lead into the destination column at the new index
    destColumn.leads.splice(newIndex, 0, movedLead);

    // Save the updated stages document
    await stage.save();

    return NextResponse.json({ message: "Lead position updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating lead position:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
