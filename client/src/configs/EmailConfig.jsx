// Tentative File, Work in progress
import React, { useState } from "react";

function EmailConfig({ node }) {
  const [to, setTo] = useState(node?.data?.config?.to || "");
  const [subject, setSubject] = useState(node?.data?.config?.subject || "");
  const [body, setBody] = useState(node?.data?.config?.body || "");

  return (
    <div className="space-y-4">
      <input
        type="email"
        placeholder="Recipient Email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <textarea
        placeholder="Message Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
    </div>
  );
}

export default EmailConfig;
