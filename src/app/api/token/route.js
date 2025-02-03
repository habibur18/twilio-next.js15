// import { AccessToken } from "twilio";
import AccessToken from "twilio/lib/jwt/AccessToken";
import { nameGenerator } from "../../../../utils/nameGenerator";

const { VoiceGrant } = AccessToken;

export async function GET() {
  const identity = nameGenerator();

  const accessToken = new AccessToken(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_API_KEY, process.env.TWILIO_API_SECRET, { identity });

  const grant = new VoiceGrant({
    outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
    incomingAllow: true,
  });

  accessToken.addGrant(grant);

  return Response.json({
    identity: identity,
    token: accessToken.toJwt(),
  });
}
