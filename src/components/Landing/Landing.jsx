import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";
import smartship from "../../assets/logos/smartship.png";
import dashboard from "../../assets/dashboard.png";
import cambrian from "../../assets/logos/cambrian.png";
import commault from "../../assets/logos/commault.png";
import crompton from "../../assets/logos/crompton.png";
import seclock from "../../assets/logos/seclock.png";
import software from "../../assets/logos/software.png";

export default function Landing() {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Handle file upload here
      console.log("File uploaded:", file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div className="w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#111111] rounded-full px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={smartship} alt="Smart Ship" className="h-[26px]" />
            </div>
            <nav className="hidden md:flex items-center gap-10">
              <Link
                to="/"
                className="text-[15px] text-white hover:text-gray-200 font-medium"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-[15px] text-white hover:text-gray-200 font-medium"
              >
                About us
              </Link>
              <Link
                to="/features"
                className="text-[15px] text-white hover:text-gray-200 font-medium"
              >
                Feature
              </Link>
              <Link
                to="/pricing"
                className="text-[15px] text-white hover:text-gray-200 font-medium"
              >
                Pricing
              </Link>
            </nav>
            <Link
              to="/signup"
              className="bg-[#0066FF] text-white px-5 py-[7px] rounded-[6px] text-[15px] font-medium hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-[#EBF3FF] to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-[40px] leading-tight font-bold mb-4">
              Smarter <span className="text-[#7FFF00]">Document</span> Parsing
              for Shipping,
              <br />
              Powered by Intelligence
            </h1>
            <p className="text-gray-600 mb-6">
              Streamline maritime document management with AI-driven precision.
              <br />
              Empowering the shipping industry for seamless operations!
            </p>
            <button className="bg-[#0066FF] text-white px-6 py-2.5 rounded-md text-sm">
              Start 14-day free trial
            </button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-12 max-w-3xl mx-auto">
            <div className="bg-black rounded-2xl p-4">
              <img
                src={dashboard}
                alt="Dashboard Preview"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="py-8 bg-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center gap-12">
            <img src={cambrian} alt="Cambrian" className="h-6" />
            <img src={commault} alt="Commault" className="h-6" />
            <img src={crompton} alt="Crompton" className="h-6" />
            <img src={seclock} alt="Seclock" className="h-6" />
            <img src={software} alt="Software" className="h-6" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12 text-white">
            Smart Features for your Efficiency
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              title="PDF Collection and Upload"
              description="Quick and efficient solution for collecting and uploading documents with ease"
              bgColor="bg-blue-50"
            />
            <FeatureCard
              title="Document Processing"
              description="Advanced AI processing capabilities with high precision"
              bgColor="bg-yellow-50"
            />
            <FeatureCard
              title="Data Security"
              description="User-effective solution for convenient document formats with protection and reliability"
              bgColor="bg-blue-50"
            />
            <FeatureCard
              title="Searchable Interface"
              description="User-effective solution for convenient document formats with protection and reliability"
              bgColor="bg-purple-50"
            />
          </div>
        </div>
      </section>

      {/* Document Upload Demo Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            Upload your first document
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Upload your document to try our free demo or bring your own data and
            we'll be glad to assist you for free.
          </p>

          <div
            {...getRootProps()}
            className="max-w-2xl mx-auto border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-yellow-400 mb-4" />
              <p className="text-gray-600">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-sm">PDF (max. 10MB)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-2">
            Our Customers Review
          </h2>
          <p className="text-center text-gray-400 text-sm mb-12">
            Experience the trusted partner behind our success. Here's what they
            have to say about us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <ReviewCard />
            <ReviewCard />
            <ReviewCard />
          </div>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
            <div className="w-2 h-2 rounded-full bg-[#0066FF]"></div>
            <div className="w-2 h-2 rounded-full bg-gray-700"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white"> {/* Increased padding */}
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-16">Choose the right plan for your team</h2> {/* Increased margin */}
          <div className="flex justify-center gap-12 mb-32"> {/* Increased gap */}
            <PricingCard
              title="Pattern Detection Parsing"
              price="5"
              features={[
                "Predefined patterns for headers and BOLs",
                "Basic system recommendations per usage"
              ]}
              highlighted={true}
            />
            <PricingCard
              title="3S AI Parsing"
              price="15"
              features={[
                "Predefined patterns for headers and BOLs",
                "Basic system recommendations per usage"
              ]}
              highlighted={true}
            />
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black text-white relative pt-40 pb-24">
        {/* Let's Start Something Great Section */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-32">
          <div className="bg-[#0066FF] rounded-2xl px-8 py-8 w-[500px] text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Let's Start Something Great
            </h2>
            <p className="text-white/80 mb-6">
              Send us a line whenever you're ready - we'll reply within 24
              hours!
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-md focus:outline-none text-gray-800"
              />
              <button className="bg-black text-white px-6 py-2.5 rounded-md hover:bg-gray-900 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div>
              <img src={smartship} alt="Smart Ship" className="h-6 mb-4" />
              <div className="flex gap-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">About us</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Who's behind
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Company
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Feature</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    PDF Collection and Upload
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Document Processing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Data Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ title, description, bgColor }) => (
  <div className="bg-[#1A1A1A] border-[#333333] border rounded-lg p-6">
    <h3 className="text-lg font-medium mb-2 text-white">{title}</h3>
    <p className="text-gray-400 text-sm mb-4">{description}</p>
    <div className="bg-[#111111] rounded-lg h-32 flex items-center justify-center">
      <Upload className="w-6 h-6 text-gray-400" />
    </div>
  </div>
);

const ReviewCard = () => (
  <div className="bg-[#111111] rounded-lg p-6">
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
    <p className="text-sm text-gray-300 mb-4">
      "With intelligent parsing capabilities, our team has reduced processing
      time by 5 hours, ensuring smoother operations."
    </p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
      <div>
        <p className="font-medium">James Cooper</p>
        <p className="text-sm text-gray-400">Marine Operator</p>
      </div>
    </div>
  </div>
);

const PricingCard = ({ title, price, features, highlighted = false }) => (
  <div
    className={`border rounded-lg p-6 ${highlighted ? "border-[#0066FF]" : "border-gray-200"
      }`}
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <span className="text-gray-500 text-sm">Monthly</span>
    </div>
    <div className="mb-6">
      <span className="text-3xl font-bold">${price}</span>
      <span className="text-gray-600">/mo</span>
    </div>
    <button
      className={`w-full py-2 rounded-lg mb-6 ${highlighted
          ? "bg-[#0066FF] text-white"
          : "border border-gray-200 text-gray-800"
        }`}
    >
      Select Plan
    </button>
    <div className="border-t pt-6">
      <p className="font-medium mb-4">Features</p>
      <ul className="space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <svg
              className="w-4 h-4 text-[#0066FF]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);
