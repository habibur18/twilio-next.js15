"use client";

import { Device } from "@twilio/voice-sdk";
import { useEffect, useState } from "react";

export default function TwilioDevice({ token, identity }) {
  const [device, setDevice] = useState(null);
  const [call, setCall] = useState(null);
  const [status, setStatus] = useState("Initializing...");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isIncoming, setIsIncoming] = useState(false);
  const [incomingNumber, setIncomingNumber] = useState("");

  useEffect(() => {
    const initializeDevice = async () => {
      const newDevice = new Device(token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true,
      });

      await newDevice.register();
      setDevice(newDevice);
      setStatus("Ready");

      newDevice.on("incoming", handleIncomingCall);
    };

    if (token) {
      initializeDevice();
    }

    return () => {
      if (device) {
        device.destroy();
      }
    };
  }, [token, device]); // Added device to the dependency array

  const handleIncomingCall = (incomingCall) => {
    setIsIncoming(true);
    setIncomingNumber(incomingCall.parameters.From);
    setCall(incomingCall);
  };

  const makeCall = async () => {
    if (device) {
      const params = {
        To: phoneNumber,
      };
      const newCall = await device.connect({ params });
      setCall(newCall);
      setStatus("Calling...");

      newCall.on("accept", () => setStatus("In call"));
      newCall.on("disconnect", () => {
        setStatus("Call ended");
        setCall(null);
      });
    }
  };

  const hangUp = () => {
    if (call) {
      call.disconnect();
      setCall(null);
      setStatus("Call ended");
    }
  };

  const acceptIncomingCall = () => {
    if (call) {
      call.accept();
      setIsIncoming(false);
      setStatus("In call");
    }
  };

  const rejectIncomingCall = () => {
    if (call) {
      call.reject();
      setIsIncoming(false);
      setCall(null);
      setStatus("Call rejected");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Your Device Info</h2>
      <p>Client Name: {identity}</p>
      <p>Status: {status}</p>

      {!isIncoming && !call && (
        <div className="mt-4">
          <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Enter phone number or client name" className="border p-2 mr-2" />
          <button onClick={makeCall} className="bg-blue-500 text-white p-2 rounded">
            Call
          </button>
        </div>
      )}

      {call && !isIncoming && (
        <button onClick={hangUp} className="bg-red-500 text-white p-2 rounded mt-4">
          Hang Up
        </button>
      )}

      {isIncoming && (
        <div className="mt-4">
          <p>Incoming call from {incomingNumber}</p>
          <button onClick={acceptIncomingCall} className="bg-green-500 text-white p-2 rounded mr-2">
            Accept
          </button>
          <button onClick={rejectIncomingCall} className="bg-red-500 text-white p-2 rounded">
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
