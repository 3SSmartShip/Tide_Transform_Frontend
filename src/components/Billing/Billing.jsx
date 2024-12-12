import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../Layout/Layout';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

export default function Billing() {
  const [activeTab, setActiveTab] = useState('overview');

  const plans = [
    {
      name: 'Pattern Detection Parsing',
      price: '$5',
      period: '/wk',
      current: true,
      features: [
        'Predefined patterns for Invoices and RFQs.',
        'User-specific customization for unique document layouts.',
      ],
      pages: 1000,
    },
    {
      name: '3S AI Parsing',
      price: '$15',
      period: '/wk',
      current: false,
      features: [
        'Predefined patterns for Invoices and RFQs.',
        'User-specific customization for unique document layouts.',
      ],
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-6">Billings</h1>
          
          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              className={`pb-4 px-6 relative ${
                activeTab === 'overview'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
              {activeTab === 'overview' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
            <button
              className={`pb-4 px-6 relative ${
                activeTab === 'plan'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('plan')}
            >
              Plan
              {activeTab === 'plan' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                />
              )}
            </button>
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#1C2632] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-400">Pattern Detection Parsing</h3>
                <span className="text-white">{plans[0].pages} pages</span>
              </div>
              <Link
                to="/billing/plan"
                className="text-blue-500 hover:text-blue-400 text-sm"
              >
                Upgrade Plan
              </Link>
            </div>
          </motion.div>
        )}

        {/* Plan Tab Content */}
        {activeTab === 'plan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl text-white mb-8">Choose a pricing plan that matches your need</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className="bg-[#1C2632] rounded-lg p-6 space-y-6"
                >
                  <div>
                    <h3 className="text-gray-400 text-lg mb-4">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {plan.current ? (
                    <button className="w-full py-2 px-4 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors">
                      Current Plan
                    </button>
                  ) : (
                    <button className="w-full py-2 px-4 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors">
                      Upgrade Plan
                    </button>
                  )}

                  <div>
                    <h4 className="text-white mb-4">Features:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-400">{feature}</span>
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
