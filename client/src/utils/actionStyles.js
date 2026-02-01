import {
  FaGoogleDrive,
  FaSlack,
  FaDiscord,
  FaEnvelope,
  FaCode,
  FaLink,
  FaClock,
  FaCodeBranch,
} from "react-icons/fa";
import { SiGooglesheets } from "react-icons/si";

export const actionStyles = {
  google_sheets: {
    label: "Google Sheets",
    color: "#34A853",
    gradient: "linear-gradient(135deg, #34A853, #2E7D32)",
    border: "2px solid #34A853",
    icon: SiGooglesheets,
  },
  slack: {
    label: "Slack",
    color: "#611f69",
    gradient: "linear-gradient(135deg, #611f69, #9a4d9c)",
    border: "2px solid #611f69",
    icon: FaSlack,
  },
  discord: {
    label: "Discord",
    color: "#5865F2",
    gradient: "linear-gradient(135deg, #5865F2, #3a45b6)",
    border: "2px solid #5865F2",
    icon: FaDiscord,
  },
  email: {
    label: "Email",
    color: "#E11CFF",
    gradient: "linear-gradient(135deg, #6c63ff, #e11cff)",
    border: "2px solid #e11cff",
    icon: FaEnvelope,
  },
  custom: {
    label: "Custom",
    color: "#444",
    gradient: "linear-gradient(135deg, #666, #222)",
    border: "2px solid #444",
    icon: FaCode,
  },
  schedule: {
    label: "Schedule",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #b45309)",
    border: "2px solid #f59e0b",
    icon: FaClock,
  },
  webhook: {
    label: "Webhook",
    color: "#0d9488",
    gradient: "linear-gradient(135deg, #0d9488, #134e4a)",
    border: "2px solid #0d9488",
    icon: FaLink,
  },
  condition: {
    label: "Condition",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    border: "2px solid #8b5cf6",
    icon: FaCodeBranch,
  },
};
