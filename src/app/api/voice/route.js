import { NextResponse } from "next/server";
import twilio from "twilio";
const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req) {
  console.log("Received request to /api/voice");

  let requestBody;
  const contentType = req.headers.get("content-type");

  if (contentType && contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    requestBody = Object.fromEntries(formData);
  } else {
    requestBody = await req.json();
  }

  console.log("Request body:", requestBody);

  const twimlResponse = voiceResponse(requestBody);

  console.log("TwiML response:", twimlResponse);

  return new NextResponse(twimlResponse, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

function voiceResponse(requestBody) {
  console.log("Generating voice response for:", requestBody);

  const toNumberOrClientName = requestBody.To;
  const callerId = process.env.TWILIO_CALLER_ID;
  console.log("Caller ID:", callerId);

  const twiml = new VoiceResponse();

  if (toNumberOrClientName == callerId) {
    console.log("Incoming call to Twilio number");
    const dial = twiml.dial();
    dial.client(requestBody.From);
  } else if (requestBody.To) {
    console.log("Outgoing call");
    const dial = twiml.dial({ callerId });
    const attr = isAValidPhoneNumber(toNumberOrClientName) ? "number" : "client";
    dial[attr]({}, toNumberOrClientName);
  } else {
    console.log("Default response");
    twiml.say("Thanks for calling!");
  }

  const response = twiml.toString();
  console.log("Generated TwiML:", response);
  return response;
}

function isAValidPhoneNumber(number) {
  return /^[\d+\-$$$$ ]+$/.test(number);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
