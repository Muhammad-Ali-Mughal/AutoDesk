import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSelector } from "react-redux";
import {
  FaRobot,
  FaCode,
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";

const Home = () => {
  const isDarkMode = useSelector((state) => state.darkMode.isDarkMode);
  const { scrollY } = useScroll();
  const [activeSection, setActiveSection] = useState(0);

  // Parallax effect for hero section
  const y = useTransform(scrollY, [0, 500], [0, 100]);

  // Intersection observer for section animations
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [featuresRef, featuresInView] = useInView({ threshold: 0.1 });
  const [howItWorksRef, howItWorksInView] = useInView({ threshold: 0.1 });
  const [benefitsRef, benefitsInView] = useInView({ threshold: 0.1 });
  const [pricingRef, pricingInView] = useInView({ threshold: 0.1 });
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1 });

  // Auto-scroll sections
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(Array.from(sections).indexOf(entry.target));
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
      >
        <motion.div
          style={{ y }}
          className="absolute inset-0 bg-gradient-to-br from-[#642c8f]/10 to-[#642c8f]/20 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className={isDarkMode ? "text-white" : "text-gray-900"}>
                Automate Your Workflow
              </span>
              <br />
              <span
                className={isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"}
              >
                With Intelligence
              </span>
            </h1>
            <p
              className={`text-xl mb-8 max-w-2xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Streamline your processes, boost productivity, and focus on what
              matters most with our powerful automation platform.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className={`inline-block px-8 py-4 rounded-lg cursor-pointer text-lg font-semibold ${
                  isDarkMode
                    ? "bg-[#9b6cbf] text-white hover:bg-[#9b6cbf]/90"
                    : "bg-[#642c8f] text-white hover:bg-[#642c8f]/90"
                }`}
                style={{ zIndex: 100 }}
              >
                Start Free Trial
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Everything you need to automate your workflow
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaCode className="h-12 w-12" />,
                title: "Custom Automation",
                description:
                  "Create custom automation workflows tailored to your specific needs",
              },
              {
                icon: <FaChartLine className="h-12 w-12" />,
                title: "Analytics Dashboard",
                description:
                  "Track and analyze your automation performance with detailed insights",
              },
              {
                icon: <FaShieldAlt className="h-12 w-12" />,
                title: "Secure & Reliable",
                description:
                  "Enterprise-grade security and reliability for your automation needs",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`p-8 rounded-2xl ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } shadow-lg transition-colors duration-300`}
              >
                <div
                  className={`mb-6 ${
                    isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                  }`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        className={`py-20 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Simple steps to get started with automation
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Create your account in minutes",
              },
              {
                step: "2",
                title: "Configure",
                description: "Set up your automation rules",
              },
              {
                step: "3",
                title: "Integrate",
                description: "Connect with your tools",
              },
              {
                step: "4",
                title: "Automate",
                description: "Let the magic happen",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={howItWorksInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDarkMode ? "bg-[#9b6cbf]" : "bg-[#642c8f]"
                  }`}
                >
                  <span className="text-2xl font-bold text-white">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Key Benefits</h2>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Why choose our automation platform
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: <FaClock className="h-8 w-8" />,
                title: "Save Time",
                description:
                  "Automate repetitive tasks and save hours of manual work",
              },
              {
                icon: <FaChartLine className="h-8 w-8" />,
                title: "Increase Productivity",
                description:
                  "Focus on high-value tasks while automation handles the rest",
              },
              {
                icon: <FaShieldAlt className="h-8 w-8" />,
                title: "Reduce Errors",
                description:
                  "Minimize human errors with consistent automated processes",
              },
              {
                icon: <FaUsers className="h-8 w-8" />,
                title: "Team Collaboration",
                description:
                  "Work together seamlessly with shared automation workflows",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={benefitsInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`p-6 rounded-xl ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-50"
                } shadow-lg transition-colors duration-300`}
              >
                <div
                  className={`mb-4 ${
                    isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                  }`}
                >
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        className={`py-20 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p
              className={`text-xl ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Choose the plan that's right for you
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Starter",
                price: "$9",
                features: ["Basic Automation", "5 Workflows", "Email Support"],
              },
              {
                name: "Professional",
                price: "$29",
                features: [
                  "Advanced Automation",
                  "Unlimited Workflows",
                  "Priority Support",
                  "API Access",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Custom Solutions",
                  "Dedicated Support",
                  "Advanced Security",
                  "Custom Integration",
                ],
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`p-8 rounded-2xl ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-white hover:bg-gray-50"
                } shadow-lg transition-colors duration-300`}
              >
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className="text-lg font-normal">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <span
                        className={`mr-2 ${
                          isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                        }`}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-lg font-semibold ${
                    isDarkMode
                      ? "bg-[#9b6cbf] text-white hover:bg-[#9b6cbf]/90"
                      : "bg-[#642c8f] text-white hover:bg-[#642c8f]/90"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Automate?</h2>
            <p
              className={`text-xl mb-8 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Join thousands of businesses already using our platform
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className={`inline-block px-8 py-4 rounded-lg text-lg font-semibold ${
                  isDarkMode
                    ? "bg-[#9b6cbf] text-white hover:bg-[#9b6cbf]/90"
                    : "bg-[#642c8f] text-white hover:bg-[#642c8f]/90"
                }`}
              >
                Start Free Trial
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-8 ${isDarkMode ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FaRobot
                className={`h-6 w-6 ${
                  isDarkMode ? "text-[#9b6cbf]" : "text-[#642c8f]"
                }`}
              />
              <span className="ml-2 font-bold">AutomationPro</span>
            </div>
            <div
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              © 2024 AutomationPro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
