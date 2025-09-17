import { useState, useEffect } from "react";

export default function EmailConfig({ node, onChange }) {
  const [to, setTo] = useState(node.data?.to || "");
  const [subject, setSubject] = useState(node.data?.subject || "");
  const [body, setBody] = useState(node.data?.body || "");

  // Update parent node when fields change
  useEffect(() => {
    onChange?.({
      ...node,
      data: { ...node.data, to, subject, body },
    });
  }, [to, subject, body]);

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col text-sm">
        Recipient Email:
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="example@mail.com"
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col text-sm">
        Subject:
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject line"
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col text-sm">
        Message:
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type your email message here..."
          rows={5}
          className="border rounded p-2"
        />
      </label>
    </div>
  );
}
