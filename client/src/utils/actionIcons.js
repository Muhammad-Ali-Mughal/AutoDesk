import { FaEnvelope, FaCode, FaClock, FaDatabase } from "react-icons/fa";
import { FaSlack, FaDiscord } from "react-icons/fa6";
import { SiOpenai } from "react-icons/si";

const actionIcons = {
  email: FaEnvelope,
  webhook: FaCode,
  delay: FaClock,
  condition: FaDatabase,
  ai_prompt: SiOpenai,
  slack: FaSlack,
  discord: FaDiscord,
  custom: FaCode,
};

export const getActionIcon = (type) => {
  return actionIcons[type] || FaDatabase;
};
