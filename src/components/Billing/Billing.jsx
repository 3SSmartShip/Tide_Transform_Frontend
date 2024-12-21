import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "../Layout/Layout";
import { useLocation } from 'react-router-dom';

export default function Billing() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'plan');
  const [billingInterval, setBillingInterval] = useState("monthly");

  const plans = {
    monthly: [
      {
        name: "API Only",
        price: "99",
        period: "/monthly",
        features: [
          "PDF, docx, slides, and images 5,000 pages per month",
          "Structured data extraction",
          "Up to 100 pages per document $0.01 per page afterwards",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact Sales",
        period: "/wk",
        features: [
          "Everything in Platform, + Connect to custom models",
          "Fine Tuning",
        ],
      },
    ],
    annually: [
      {
        name: "API Only",
        price: "999",
        period: "/annually",
        features: [
          "PDF, docx, slides, and images 5,000 pages per month",
          "Structured data extraction",
          "Up to 100 pages per document $0.01 per page afterwards",
        ],
      },
      {
        name: "Enterprise",
        price: "Contact Sales",
        period: "/wk",
        features: [
          "Everything in Platform, + Connect to custom models",
          "Fine Tuning",
        ],
      },
    ],
  };

  return (
    <Layout>
      <div className="h-full p-32px py-32px">
        <h1 className="text-xl font-medium text-white mb-4">Billings</h1>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-8 border-b border-gray-800">
            <button
              className={`pb-3 relative ${
                activeTab === "overview" ? "text-[#0066FF]" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
              {activeTab === "overview" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066FF]"
                />
              )}
            </button>
            <button
              className={`pb-3 relative ${
                activeTab === "plan" ? "text-[#0066FF]" : "text-gray-400"
              }`}
              onClick={() => setActiveTab("plan")}
            >
              Plan
              {activeTab === "plan" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066FF]"
                />
              )}
            </button>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-[#1C2632] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400 text-sm">
                  Pattern Detection Parsing
                </h3>
                <span className="text-white text-sm">1000 pages</span>
              </div>
              <button
                onClick={() => setActiveTab("plan")}
                className="text-[#0066FF] hover:text-blue-400 text-sm"
              >
                Upgrade Plan
              </button>
            </div>
          </motion.div>
        )}

        {/* Plan Tab Content */}
        {activeTab === "plan" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h2 className="text-xl font-medium text-white mb-6">
              Choose a pricing plan that matches your need
            </h2>

            {/* Billing Interval Toggle */}
            <div className="inline-flex items-center rounded-lg bg-[#1A1A1A] p-1 mb-6">
              <button
                onClick={() => setBillingInterval("monthly")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  billingInterval === "monthly"
                    ? "bg-[#0066FF] text-white"
                    : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("annually")}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  billingInterval === "annually"
                    ? "bg-[#0066FF] text-white"
                    : "text-gray-400"
                }`}
              >
                Annually
              </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-2 gap-4 max-w-5xl">
              {plans[billingInterval].map((plan) => (
                <div key={plan.name} className="bg-[#1C2632] rounded-lg p-6">
                  <div className="mb-6">
                    <h3 className="text-gray-400 text-base mb-3">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      {plan.price === "Contact Sales" ? (
                        <span className="text-2xl font-medium text-white">
                          Contact Sales
                        </span>
                      ) : (
                        <>
                          <span className="text-2xl font-medium text-white">
                            ${plan.price}
                          </span>
                          <span className="text-gray-400 ml-1">
                            {plan.period}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    className={`w-full py-2.5 px-4 rounded-md transition-colors mb-6 ${
                      plan.name === "Enterprise"
                        ? "bg-[#0066FF] hover:bg-blue-600 text-white"
                        : "border border-gray-600 text-gray-300 hover:bg-[#0066FF] hover:border-transparent"
                    }`}
                  >
                    {plan.name === "Enterprise"
                      ? "Contact Sales"
                      : "Choose Plan"}
                  </button>

                  <div>
                    <h4 className="text-white text-sm mb-4">Features:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex gap-3 items-start">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] mt-2 flex-shrink-0" />
                          <span className="text-gray-400 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
