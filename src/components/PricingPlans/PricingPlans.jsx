import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

const PricingPlans = ({ selectedMethod }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = {
    pattern: {
      monthly: [
        {
          name: 'Starter',
          price: 29,
          features: [
            'Up to 100 documents/month',
            'Basic pattern recognition',
            'Standard support',
            'API access',
            'Export to JSON'
          ]
        },
        {
          name: 'Professional',
          price: 79,
          features: [
            'Up to 500 documents/month',
            'Advanced pattern recognition',
            'Priority support',
            'API access',
            'Export to multiple formats',
            'Custom templates'
          ]
        },
        {
          name: 'Enterprise',
          price: 199,
          features: [
            'Unlimited documents',
            'Custom pattern rules',
            '24/7 support',
            'Dedicated API endpoints',
            'All export formats',
            'Custom integration support'
          ]
        }
      ],
      weekly: [
        {
          name: 'Starter',
          price: 9,
          features: [
            'Up to 25 documents/week',
            'Basic pattern recognition',
            'Standard support',
            'API access',
            'Export to JSON'
          ]
        },
        {
          name: 'Professional',
          price: 24,
          features: [
            'Up to 125 documents/week',
            'Advanced pattern recognition',
            'Priority support',
            'API access',
            'Export to multiple formats',
            'Custom templates'
          ]
        },
        {
          name: 'Enterprise',
          price: 59,
          features: [
            'Unlimited documents',
            'Custom pattern rules',
            '24/7 support',
            'Dedicated API endpoints',
            'All export formats',
            'Custom integration support'
          ]
        }
      ]
    },
    ai: {
      monthly: [
        {
          name: 'Starter',
          price: 49,
          features: [
            'Up to 50 documents/month',
            'Basic AI processing',
            'Standard support',
            'API access',
            'Export to JSON'
          ]
        },
        {
          name: 'Professional',
          price: 129,
          features: [
            'Up to 250 documents/month',
            'Advanced AI processing',
            'Priority support',
            'API access',
            'Export to multiple formats',
            'Custom AI training'
          ]
        },
        {
          name: 'Enterprise',
          price: 299,
          features: [
            'Unlimited documents',
            'Custom AI models',
            '24/7 support',
            'Dedicated API endpoints',
            'All export formats',
            'Custom integration support'
          ]
        }
      ],
      weekly: [
        {
          name: 'Starter',
          price: 15,
          features: [
            'Up to 12 documents/week',
            'Basic AI processing',
            'Standard support',
            'API access',
            'Export to JSON'
          ]
        },
        {
          name: 'Professional',
          price: 39,
          features: [
            'Up to 60 documents/week',
            'Advanced AI processing',
            'Priority support',
            'API access',
            'Export to multiple formats',
            'Custom AI training'
          ]
        },
        {
          name: 'Enterprise',
          price: 89,
          features: [
            'Unlimited documents',
            'Custom AI models',
            '24/7 support',
            'Dedicated API endpoints',
            'All export formats',
            'Custom integration support'
          ]
        }
      ]
    }
  };

  const currentPlans = plans[selectedMethod === 'pattern' ? 'pattern' : 'ai'][billingCycle];

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Pricing Plans for {selectedMethod === 'pattern' ? 'Pattern Detection' : '3S AI'} Processing
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Choose the perfect plan for your needs
        </p>

        {/* Billing Cycle Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="relative bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`${
                billingCycle === 'monthly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-50'
              } relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('weekly')}
              className={`${
                billingCycle === 'weekly'
                  ? 'bg-white shadow-sm'
                  : 'hover:bg-gray-50'
              } relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        {currentPlans.map((plan) => (
          <div
            key={plan.name}
            className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 hover:border-indigo-500 transition-colors duration-200"
          >
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">
                  ${plan.price}
                </span>
                <span className="ml-1 text-xl font-semibold text-gray-500">
                  /{billingCycle === 'monthly' ? 'mo' : 'wk'}
                </span>
              </div>
              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 shrink-0" />
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans; 