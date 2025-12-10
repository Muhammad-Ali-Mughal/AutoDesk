import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    tagline: "Free forever",
    highlighted: true,
    features: [
      "No-code workflow builder",
      "3000+ standard apps",
      "Unlimited users",
      "2 active scenarios",
      "5min scenario execution time",
      "5 MB file size",
      "15min interval between scheduled scenario executions",
      "Real-time execution monitoring",
      "Custom apps",
    ],
  },
  {
    name: "Core",
    price: "$10.59",
    period: "/mo",
    tagline: "Billed monthly",
    credits: "10,000 credits/mo",
    features: [
      "Unlimited number of active scenarios",
      "40min scenario execution time",
      "100 MB file size",
      "1min interval between scheduled scenario executions",
      "Access to 300+ Make API endpoints",
    ],
  },
  {
    name: "Pro",
    price: "$18.82",
    period: "/mo",
    tagline: "Billed monthly",
    credits: "10,000 credits/mo",
    features: [
      "Full-text execution log search",
      "Credit usage flexibility",
      "250 MB file size",
      "Priority scenario execution",
    ],
  },
  {
    name: "Teams",
    price: "$34.12",
    period: "/mo",
    tagline: "Billed monthly",
    credits: "10,000 credits/mo",
    features: [
      "Teams and team roles",
      "Create & share scenario templates",
      "500 MB file size",
      "High priority scenario execution",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "Talk to sales",
    gradient: "from-[#642c8f] to-[#a76ee4]",
    features: [
      "Access to enterprise apps",
      "Information security compliance support (ISO 27001)",
      "1000 MB file size",
      "Company single sign-on (SSO) access control",
      "Credit overage protection",
      "Custom functions",
      "Access to Technical Account Manager",
      "Highest priority customer support",
      "Execution Log Storage for 60 days",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto text-center"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Choose your plan
        </h1>
        <p className="text-gray-500 mb-12">
          Flexible pricing for teams of all sizes — upgrade as you grow.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rounded-2xl shadow-lg p-6 flex flex-col justify-between ${
                plan.highlighted
                  ? "border-2 border-[#642c8f] bg-white"
                  : plan.name === "Enterprise"
                  ? "bg-gradient-to-b text-white"
                  : "bg-white"
              } ${plan.gradient ? plan.gradient : ""}`}
            >
              {/* Plan Header */}
              <div>
                <h2
                  className={`text-xl font-semibold mb-1 ${
                    plan.name === "Enterprise" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-sm mb-3 ${
                    plan.name === "Enterprise"
                      ? "text-gray-200"
                      : "text-gray-500"
                  }`}
                >
                  {plan.tagline}
                </p>

                {/* Price */}
                <div className="mb-4">
                  <span
                    className={`text-3xl font-bold ${
                      plan.name === "Enterprise"
                        ? "text-white"
                        : "text-gray-800"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-gray-500 ml-1 ${
                        plan.name === "Enterprise" ? "text-gray-200" : ""
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Credits Dropdown */}
                {plan.credits && (
                  <select
                    className="border border-gray-300 rounded-md px-3 py-1 w-full text-sm focus:ring-2 focus:ring-[#642c8f] focus:outline-none mb-4"
                    defaultValue={plan.credits}
                  >
                    <option>{plan.credits}</option>
                    <option>20,000 credits/mo</option>
                    <option>50,000 credits/mo</option>
                  </select>
                )}

                {/* Features */}
                <ul className="text-left space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-sm text-gray-700"
                    >
                      <FaCheck
                        className={`mt-1 mr-2 text-[#642c8f] ${
                          plan.name === "Enterprise" ? "text-white" : ""
                        }`}
                      />
                      <span
                        className={`${
                          plan.name === "Enterprise" ? "text-gray-100" : ""
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full py-2.5 rounded-lg font-medium shadow transition ${
                  plan.name === "Free"
                    ? "bg-[#642c8f] text-white hover:bg-[#7a3bb3]"
                    : plan.name === "Enterprise"
                    ? "bg-white text-[#642c8f] hover:bg-gray-100"
                    : "border border-[#642c8f] text-[#642c8f] hover:bg-[#642c8f] hover:text-white"
                }`}
              >
                {plan.name === "Enterprise" ? "Talk to sales" : "Buy plan"}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
