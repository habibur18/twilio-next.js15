"use client";

import TwilioDevice from "@/components/TwilioDevice";
import { useEffect, useState } from "react";

export default function Home() {
  const [token, setToken] = useState(null);
  const [identity, setIdentity] = useState("");

  useEffect(() => {
    fetch("/api/token")
      .then((res) => res.json())
      .then((data) => {
        setToken(data.token);
        setIdentity(data.identity);
      });
  }, []);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold my-4">Twilio Voice JavaScript SDK Quickstart</h1>
      {token ? <TwilioDevice token={token} identity={identity} /> : <p>Loading...</p>}
    </div>
  );
}
