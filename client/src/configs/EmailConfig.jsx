import { useEffect, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

export default function EmailConfig({ node, workflowId, onChange }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!workflowId || !node?.id) return;

      setLoading(true);
      try {
        const res = await api.get(`/email/${workflowId}/node/${node.id}`);
        const emailAction = res.data?.emailAction;
        if (!mounted) return;

        if (emailAction) {
          setTo(emailAction.to || "");
          setSubject(emailAction.subject || "");
          setBody(emailAction.body || "");
        } else {
          setTo(node.data?.to || node.data?.config?.to || "");
          setSubject(node.data?.subject || node.data?.config?.subject || "");
          setBody(node.data?.body || node.data?.config?.body || "");
        }
      } catch (err) {
        console.error("Failed to load email config:", err);
        toast.error("Failed to load email config");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [workflowId, node?.id]);

  const handleDrop = (setter, value) => (e) => {
    e.preventDefault();
    const variable = e.dataTransfer.getData("application/variable");
    if (!variable) return;

    setter(value + variable);
  };

  const allowDrop = (e) => e.preventDefault();

  useEffect(() => {
    onChange?.({
      ...node,
      id: node?.id,
      data: {
        ...(node?.data || {}),
        nodeId: node?.id,
        to,
        subject,
        body,
      },
    });
  }, [to, subject, body]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col text-sm">
        Recipient Email:
        <input
          type="email"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onDrop={handleDrop(setTo, to)}
          onDragOver={allowDrop}
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
          onDrop={handleDrop(setSubject, subject)}
          onDragOver={allowDrop}
          placeholder="Subject line"
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col text-sm">
        Message:
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onDrop={handleDrop(setBody, body)}
          onDragOver={allowDrop}
          placeholder="Type your email message here..."
          rows={5}
          className="border rounded p-2"
        />
      </label>
    </div>
  );
}
