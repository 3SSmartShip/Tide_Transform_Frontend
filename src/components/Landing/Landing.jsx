import React, { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Link, NavLink } from "react-router-dom";
import { Upload, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../Footer/Footer";
import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_navbar.png";
import dashboard from "../../assets/dashboard.png";
import sparsepazari from "../../assets/logos/sparsepazari.png";
import tatanyk from "../../assets/logos/tatanyk.png";
import {
  feature4Image,
  workflowImage,
  documentImage,
  fileSupport,
} from "../../assets/images";

export default function Landing() {
  const [pricingPeriod, setPricingPeriod] = useState("Monthly");
  const [selectedType, setSelectedType] = useState("invoice");
  const [activeSection, setActiveSection] = useState("Home");

  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  const handleToggle = (type) => {
    setSelectedType(type);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#0A0A0A] rounded-lg px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src={TideTransformLogo}
                alt="Tide Transform"
                className="h-[30px]"
              />
            </div>

            <nav className="flex items-center justify-between space-x-12 pr-20">
              <button
                onClick={() => (window.location.href = "/")}
                className={
                  activeSection === "Home" ? "text-blue-500" : "text-white"
                }
              >
                Home
              </button>
              <button
                onClick={() => {
                  setActiveSection("Features");
                  scrollToSection(featuresRef);
                }}
                className={
                  activeSection === "Features" ? "text-blue-500" : "text-white"
                }
              >
                Features
              </button>
              <button
                onClick={() => {
                  setActiveSection("Pricing");
                  scrollToSection(pricingRef);
                }}
                className={
                  activeSection === "Pricing" ? "text-blue-500" : "text-white"
                }
              >
                Pricing
              </button>
            </nav>

            <Link
              to="/signup"
              className="bg-[#0066FF] text-white px-2 py-1 rounded-md text-sm h-8 flex items-center justify-center"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Updated with exact gradient match */}
      <section className="relative pt-32 pb-02 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0066FF]/5 via-[#0066FF]/40 to-[#0066FF]/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0066FF]/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm text-gray-600 mb-2 border border-white rounded-full px-4 py-2 shadow-md inline-block">
              Document AI Platform
            </p>
            <h1 className="text-[42px] leading-tight font-bold mb-4">
              Automate Complex Maritime
              <br />
              <span className="text-[#e8f902]">Document</span> Workflows!
            </h1>
            <p className="text-gray-600 mb-8 mx-auto max-w-2xl text-center">
              Turn invoices, RFQs, and manuals into actionable data with 3S AI –
              marine-grade precision. No more copy + paste into spreadsheets!
            </p>
            <Link
              to="/signup"
              className="bg-white text-gray-800 px-6 py-2.5 rounded-full text-sm shadow-md hover:bg-gray-50 transition-colors inline-block"
            >
              Start 14-day free trial
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-12 max-w-4xl mx-auto">
            <img
              src={dashboard}
              alt="Dashboard Preview"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">
            We are just getting started
          </p>
          <div className="flex justify-center items-center gap-16 flex-wrap">
            <img src={sparsepazari} alt="Cambrian" className="h-10" />
            <img src={tatanyk} alt="Commault" className="h-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-black" id="features">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <button className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm mb-4">
              Our Features
            </button>
            <h2 className="text-2xl font-bold text-white">
              Intelligent Tools for Maximum Efficiency
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              title="Workflow Automation"
              description="Optimised for Daily Workflows and Scalable Automation, Complete with a Dashboard for Instant Insights"
              image={feature4Image}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="Document Supported"
              description="3S AI – Marine-Grade Intelligence transforms your Invoices, RFQs, and Manuals into actionable data, ready for seamless JSON integration."
              image={documentImage}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="Supports PDF & Excel"
              description="Seamlessly Handle PDF and Excel Files with One-Click Upload via Web App!"
              image={fileSupport}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="API-Driven Parsing"
              description="Effortlessly Access Scalable Infrastructure with the Simplicity of an API Integration"
              image={workflowImage}
              bgColor="bg-[#1A1A1A]"
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
            Upload your document in the zone below, or drag and drop and after
            will you will a well structure json file.
          </p>

          {/* Toggle Button */}
          <div className="flex items-center justify-center gap-4 mt-8 mb-12">
            <button
              onClick={() => handleToggle("invoice")}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                selectedType === "invoice"
                  ? "bg-[#0066FF] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Invoice/RFQ
            </button>
            <button
              onClick={() => handleToggle("manuals")}
              className={`px-4 py-1 rounded-full text-sm transition-colors ${
                selectedType === "manuals"
                  ? "bg-[#0066FF] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Manuals
            </button>
          </div>

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

      {/* Partition Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 rounded" />

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 bg-white mb-32" id="pricing">
        <div>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">
                Flexible Pricing That Grows With You
              </h2>
              <p className="text-gray-600 text-sm max-w-3xl mx-auto">
                Smart and scalable pricing powered by 3S AI—tailored to empower
                your business, whether You're Handling Standard Document Formats
                or Need Advanced AI Solutions for Complex Parsing.
              </p>
              {/* Toggle Button */}
              <div className="flex items-center justify-center gap-4 mt-8 mb-12">
                <button
                  onClick={() => setPricingPeriod("Monthly")}
                  className={`px-4 py-1 rounded-full text-sm transition-colors ${
                    pricingPeriod === "Monthly"
                      ? "bg-[#0066FF] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingPeriod("Annually")}
                  className={`px-4 py-1 rounded-full text-sm transition-colors ${
                    pricingPeriod === "Annually"
                      ? "bg-[#0066FF] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Annually
                </button>
              </div>
              {/* Pricing Cards */}
              <div className="flex justify-center gap-8">
                <PricingCard
                  title="API Only"
                  price=""
                  period={pricingPeriod}
                  features={[
                    "PDF, docx, slides, and images 5,000 pages per month",
                    "Structured data extraction.",
                    "Up to 100 pages per document - $0.01 per page afterwards",
                  ]}
                />
                <PricingCard
                  title="Enterprise"
                  price="Contact Sales"
                  features={[
                    "Everything in Platform + Connect to custom models",
                    "Fine Tuning",
                  ]}
                  isEnterprise={true}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

const FeatureCard = ({ title, description, image, bgColor }) => (
  <div className="bg-[#1A1A1A] border-[#333333] border rounded-xl p-8">
    <h3 className="text-xl font-medium mb-3 text-white">{title}</h3>
    <p className="text-gray-400 text-sm mb-6">{description}</p>
    <div className="bg-[#111111] rounded-xl h-64 overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-contain p-4"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Upload className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </div>
  </div>
);

const PricingCard = ({
  title,
  price,
  period,
  features,
  isEnterprise = false,
}) => (
  <div className="border border-gray-200 rounded-lg p-8 w-[300px] bg-white">
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline">
        {isEnterprise ? (
          <span className="text-2xl font-bold">{price}</span>
        ) : (
          <>
                <span className="text-2xl font-bold">
                  ${period === "Monthly" ? '99' : "999"}
                </span>
                <span className="text-gray-500 ml-1">/{period}</span>
          </>
        )}
      </div>
    </div>
    <button
      className={`w-full py-2 rounded-lg mb-8 ${
        isEnterprise
          ? "bg-blue-600 text-white"
          : "bg-white text-black border border-black   hover:bg-blue-600 hover:text-white"
      }`}
    >
      {isEnterprise ? "Contact Team" : "Select Plan"}
    </button>
    <div>
      <p className="font-medium mb-4">Features:</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <svg
              className="w-5 h-5 text-[#0066FF] mt-0.5"
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
