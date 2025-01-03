import React, { useCallback, useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Link, NavLink } from "react-router-dom";
import {
  Upload,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import demoService from "../../api/services/demoService";
import ReactJson from "@microlink/react-json-view";

export default function Landing() {
  const [pricingPeriod, setPricingPeriod] = useState("Monthly");
  const [selectedType, setSelectedType] = useState("invoice");
  const [activeSection, setActiveSection] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasInvoiceParsed, setHasInvoiceParsed] = useState(false);
  const [hasManualParsed, setHasManualParsed] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [hasDemoUsed, setHasDemoUsed] = useState(() => {
    const invoiceUsed = localStorage.getItem("invoiceDemoUsed") === "true";
    const manualUsed = localStorage.getItem("manualDemoUsed") === "true";
    return { invoice: invoiceUsed, manual: manualUsed };
  });
  const apiUrl = "YOUR_API_ENDPOINT";

  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  useEffect(() => {
    const manualParsedStatus = localStorage.getItem("manualParsed");
    if (manualParsedStatus === "true") {
      setHasManualParsed(true);
    }
  }, []);

  useEffect(() => {
    let intervalId;

    if (jobId) {
      intervalId = setInterval(async () => {
        try {
          const status = await demoService.getDemoStatus(jobId);
          setProcessingStatus(status.status);
          console.log("Processing status:", status);

          if (status.status === "completed") {
            setParsedData(status.result);
            setSuccessMessage(
              `${
                selectedType.charAt(0).toUpperCase() + selectedType.slice(1)
              } processed successfully!`
            );
            clearInterval(intervalId);
            setLoading(false);

            if (selectedType === "manuals") {
              setHasManualParsed(true);
              localStorage.setItem("manualParsed", "true");
            } else {
              setHasInvoiceParsed(true);
            }
          } else if (status.status === "failed") {
            setError("Processing failed. Please try again.");
            clearInterval(intervalId);
            setLoading(false);
          }
        } catch (error) {
          console.error("Status check failed:", error);
          setError(
            error.response?.data?.message || "Failed to check processing status"
          );
          clearInterval(intervalId);
          setLoading(false);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [jobId, selectedType]);

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      setConsoleOutput(args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  useEffect(() => {
    const demoUsed = localStorage.getItem("demoUsed");
    if (demoUsed === "true") {
      setHasDemoUsed(true);
    }
  }, []);

  useEffect(() => {
    if (hasDemoUsed) {
      localStorage.setItem("demoUsed", "true");
    }
  }, [hasDemoUsed]);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (
        (selectedType === "manuals" && hasManualParsed) ||
        (selectedType === "invoice" && hasInvoiceParsed)
      ) {
        setError(
          `You have already parsed a ${selectedType}. Please refresh the page to start over.`
        );
        return;
      }

      const file = acceptedFiles[0];
      if (file) {
        console.log("File uploaded:", file);
        setSelectedFile(file);
        setDocumentUploaded(true);
        setSuccessMessage("");
        setParsedData(null);
        setError(null);
      }
    },
    [selectedType, hasManualParsed, hasInvoiceParsed]
  );

  const handleToggle = (type) => {
    setSelectedType(type);
    setDocumentUploaded(false);
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setSuccessMessage("");
    setResponseData(null);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
    if (section === "Features") {
      scrollToSection(featuresRef);
    } else if (section === "Pricing") {
      scrollToSection(pricingRef);
    } else {
      window.location.href = "/";
    }
  };

  const handleTransformDocument = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);
      setJobId(null);
      setParsedData(null);
      setError(null);
      setProcessingStatus(null);
      setConsoleOutput(null);

      let response;
      response = await demoService.transformDocument(formData, selectedType);

      if (response.jobId) {
        setJobId(response.jobId);
        setSelectedFile(null);
        setDocumentUploaded(false);
        setProcessingStatus("processing");
      }
    } catch (error) {
      if (error.response?.status === 429) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError(error.response?.data?.message || "Failed to process document");
      }
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(responseData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (file) => {
    try {
      if (hasDemoUsed[selectedType === "invoice" ? "invoice" : "manual"]) {
        setError(
          "You have reached the limit of demo trial. Please upgrade your plan"
        );
        return;
      }

      setLoading(true);
      setError(null);
      setResponseData(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResponse = await demoService.transformDocument(
          formData,
          selectedType
        );
        const newJobId = uploadResponse.jobId;
        setJobId(newJobId);

        const checkStatus = async () => {
          try {
            const statusResponse = await demoService.getDemoStatus(newJobId);
            setProcessingStatus(statusResponse.status);

            if (statusResponse.status === "completed") {
              setResponseData(statusResponse.result);
              const newDemoUsed = { ...hasDemoUsed };
              newDemoUsed[
                selectedType === "invoice" ? "invoice" : "manual"
              ] = true;
              setHasDemoUsed(newDemoUsed);
              localStorage.setItem(
                selectedType === "invoice"
                  ? "invoiceDemoUsed"
                  : "manualDemoUsed",
                "true"
              );
              setLoading(false);
              return true;
            } else if (statusResponse.status === "failed") {
              setError(statusResponse.message || "Processing failed");
              setLoading(false);
              return true;
            }
            return false;
          } catch (error) {
            setError(
              error?.response?.data?.message ||
                error?.message ||
                "Error checking status"
            );
            setLoading(false);
            return true;
          }
        };

        const pollInterval = setInterval(async () => {
          const isDone = await checkStatus();
          if (isDone) {
            clearInterval(pollInterval);
          }
        }, 2000);
      } catch (error) {
        setError(
          error?.response?.data?.message || "Failed to process document"
        );
        setLoading(false);
      }
    } catch (error) {
      setError("Upload failed");
      setLoading(false);
    }
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
            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center justify-center space-x-8 ">
              <button
                onClick={() => handleNavigation("Home")}
                className={`px-4 py-2 rounded-md ${
                  activeSection === "Home" ? " text-blue-500" : "text-white "
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("Features")}
                className={`px-4 py-2 rounded-md ${
                  activeSection === "Features"
                    ? " text-blue-500"
                    : "text-white  "
                }`}
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("Pricing")}
                className={`px-4 py-2  rounded-md ${
                  activeSection === "Pricing"
                    ? " text-blue-500"
                    : "text-white  "
                }`}
              >
                Pricing
              </button>
              <Link
                to="/docs"
                className={`px-4 py-2 pr-40 rounded-md ${
                  activeSection === "Docs"
                    ? " text-blue-500"
                    : "text-white pr-52"
                }`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </Link>
              <Link
                to="/login"
                className="bg-black text-white border border-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-[#5583F7] text-white px-4 py-2 rounded-md text-sm flex items-center justify-center"
              >
                Get Access
              </Link>
            </nav>
            {/* Mobile Navigation */}
            <div className="sm:hidden">
              <button
                className="text-white p-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="sm:hidden mt-2 bg-[#0A0A0A] rounded-lg overflow-hidden">
              <button
                onClick={() => handleNavigation("Home")}
                className={`w-full text-left px-4 py-2 ${
                  activeSection === "Home"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-gray-700"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation("Features")}
                className={`w-full text-left px-4 py-2 ${
                  activeSection === "Features"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-gray-700"
                }`}
              >
                Features
              </button>
              <button
                onClick={() => handleNavigation("Pricing")}
                className={`w-full text-left px-4 py-2 ${
                  activeSection === "Pricing"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-gray-700"
                }`}
              >
                Pricing
              </button>
              <Link
                to="/docs"
                className={`w-full text-left px-4 py-2 ${
                  activeSection === "Docs"
                    ? "bg-blue-500 text-white"
                    : "text-white hover:bg-gray-700"
                }`}
                onClick={() => setIsMenuOpen(false)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Docs
              </Link>
              <Link
                to="/login"
                className="bg-black text-white px-6 py-2 rounded-md border border-gray-500 text-sm w-full block text-center mb-4 hover:bg-[#0052cc] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-[#0066FF] text-white px-6 py-2 rounded-md text-sm w-full block text-center hover:bg-[#0052cc] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Access
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Updated with exact gradient match */}
      <section className="relative pt-32 pb-02 overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0066FF]/5 via-[#0066FF]/40 to-[#0066FF]/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0066FF]/30 to-transparent" />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm text-gray-600 mb-2 border border-white rounded-full px-4 py-2 shadow-md inline-block">
              Document AI Platform
            </p>
            <h1 className="text-[32px] md:text-[42px] leading-tight font-bold mb-4">
              Automate Complex Maritime
              <br />
              <span className="text-[#5583F7]">Document</span> Workflows!
            </h1>
            <p className="text-gray-600 mb-8 mx-auto max-w-2xl text-center text-sm md:text-base">
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
      <section className="py-14 bg-white px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 mb-8">
            We are just getting started
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            <img src={sparsepazari} alt="Cambrian" className="h-8 md:h-10" />
            <img src={tatanyk} alt="Commault" className="h-8 md:h-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-16 bg-black px-4" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <button className="bg-[#5583F7] text-white px-4 py-1 rounded-full text-sm mb-4">
              Our Features
            </button>
            <h2 className="text-2xl font-bold text-white">
              Intelligent Tools for Maximum Efficiency
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FeatureCard
              title="Workflow Automation"
              description="Optimised for Daily Workflows and Scalable Automation, Complete with a Dashboard for Instant Insights"
              image={feature4Image}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="Document Supported"
              description="3S AI – Marine-Grade Intelligence transforms your Invoices, RFQs, and Manuals into actionable data, ready for seamless JSON integration."
              image={workflowImage}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="Supports PDF & Excel"
              description="Seamlessly Handle PDF and Excel Files with One-Click Upload via Web App!"
              image={documentImage}
              bgColor="bg-[#1A1A1A]"
            />
            <FeatureCard
              title="API-Driven Parsing"
              description="Effortlessly Access Scalable Infrastructure with the Simplicity of an API Integration"
              image={fileSupport}
              bgColor="bg-[#1A1A1A]"
            />
          </div>
        </div>
      </section>

      {/* Document Upload Demo Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">
            Upload Your First Document
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Upload your document in the zone below, or drag and drop. Afterward,
            you will receive a well-structured JSON file.
          </p>

          {/* Document Type Toggle */}
          <div className="flex justify-center gap-2 mb-8">
            <button
              onClick={() => handleToggle("invoice")}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                selectedType === "invoice"
                  ? "bg-[#5583F7] text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              Invoice/RFQ
            </button>
            <button
              onClick={() => handleToggle("manuals")}
              className={`px-4 py-2 rounded-md text-sm transition-all ${
                selectedType === "manuals"
                  ? "bg-[#5583F7] text-white"
                  : "bg-white border border-gray-200"
              }`}
            >
              Manuals
            </button>
          </div>

          <div className="bg-white rounded-xl p-8">
            <h2 className="text-xl font-semibold mb-6">
              Document Processing Demo
            </h2>

            {(selectedType === "invoice" && hasDemoUsed.invoice) ||
            (selectedType === "manuals" && hasDemoUsed.manual) ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 text-center"
              >
                <motion.p
                  className="text-[#5583F7] text-sm font-medium"
                  animate={{
                    scale: [1, 1.02, 1],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  You have reached the limit of demo trial for {selectedType}.
                  Please upgrade your plan
                </motion.p>
              </motion.div>
            ) : (
              /* Upload Zone */
              <div
                {...getRootProps()}
                className="border-2 border-blue-200 border-dashed rounded-lg p-12 cursor-pointer hover:border-blue-400 transition-all"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-gray-900 font-medium">Click to upload</p>
                  <p className="text-gray-500 text-sm">or drag and drop</p>
                  <p className="text-gray-400 text-sm">
                    Maximum file size 50 MB
                  </p>
                </div>
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="mt-6 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                  <Upload className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {selectedFile.name.split("\\").pop().split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}

            {/* Transform/Upload Button */}
            {selectedFile && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                onClick={handleTransformDocument}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : `Transform ${
                      selectedType.charAt(0).toUpperCase() +
                      selectedType.slice(1)
                    }`}
              </motion.button>
            )}

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  },
                }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-4 text-center"
              >
                <motion.p
                  className="text-Black text-m font-medium"
                  animate={{
                    scale: [1, 1.02, 1],
                    transition: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  You have reached the limit of demo trial. Please upgrade your
                  plan
                </motion.p>
              </motion.div>
            )}

            {/* JSON Result */}
            {responseData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-lg overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#272822] p-4 rounded-t-lg flex items-center justify-between"
                >
                  <h3 className="text-white font-medium">Response Data</h3>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </motion.div>
                <div className="max-h-[500px] overflow-auto">
                  <ReactJson
                    src={responseData}
                    theme="monokai"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={false}
                    style={{
                      background: "#272822",
                      padding: "1rem",
                      borderRadius: "0 0 0.5rem 0.5rem",
                    }}
                    iconStyle="square"
                    collapsed={false}
                    name={false}
                    shouldCollapse={false}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Partition Divider */}
      <div className="w-full h-1 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 rounded" />

      {/* Pricing Section */}
      <section
        ref={pricingRef}
        className="py-20 bg-white mb-32 px-4"
        id="pricing"
      >
        <div>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2">
                Flexible Pricing That Grows With You
              </h2>
              <p className="text-gray-600 text-sm max-w-3xl mx-auto">
                Smart and scalable pricing powered by 3S AI—tailored to empower
                your business, whether You're Handling Standard Document Formats
                or Need Advanced AI Solutions for Complex Parsing.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8 mb-12">
                <button
                  onClick={() => setPricingPeriod("Monthly")}
                  className={`px-4 py-1 rounded-full text-sm transition-colors ${
                    pricingPeriod === "Monthly"
                      ? "bg-[#5583F7] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPricingPeriod("Annually")}
                  className={`px-4 py-1 rounded-full text-sm transition-colors ${
                    pricingPeriod === "Annually"
                      ? "bg-[#5583F7] text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Annually
                </button>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-8 ">
                <div>
                  <PricingCard
                    className="pr-20"
                    title="API Only"
                    price=""
                    period={pricingPeriod}
                    features={[
                      "PDF, docx, slides, and images 5,000 pages per month",
                      "Structured data extraction.",
                      "Up to 100 pages per document - $0.01 per page afterwards",
                    ]}
                  />
                </div>
                <div>
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
        </div>
      </section>

      {/* Footer Component */}
      <Footer />

      {/* Loading Message */}
      {loading && (
        <div className="mt-4 text-center">
          <p>Processing... {processingStatus && `(${processingStatus})`}</p>
        </div>
      )}

      {/* Add a section to show processing status */}
      {loading && processingStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-gray-100 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full animate-pulse bg-blue-500"></div>
            <p className="text-gray-700">
              Status: <span className="font-medium">{processingStatus}</span>
            </p>
          </div>
          {jobId && (
            <p className="text-sm text-gray-500 mt-2">Job ID: {jobId}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}

const FeatureCard = ({ title, description, image, bgColor }) => (
  <div
    className={`${bgColor} border-[#333333] border rounded-xl p-6 h-full flex flex-col`}
  >
    <h3 className="text-xl font-medium mb-3 text-white">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 flex-grow">{description}</p>
    <div className="bg-[#111111] rounded-xl h-48 sm:h-64 overflow-hidden mt-auto">
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
  <div className="border border-gray-200 rounded-lg p-6 w-full sm:w-[300px] bg-white h-full flex flex-col text-left">
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="flex items-baseline">
        {isEnterprise ? (
          <span className="text-2xl font-bold">{price}</span>
        ) : (
          <>
            <span className="text-2xl font-bold">
              ${period === "Monthly" ? "99" : "999"}
            </span>
            <span className="text-gray-500 ml-1">/{period}</span>
          </>
        )}
      </div>
    </div>
    <button
      className={`w-full py-2 rounded-lg mb-8 ${
        isEnterprise
          ? "bg-blue-500 text-white"
          : "bg-white text-black border border-black hover:bg-blue-500 hover:text-white"
      }`}
    >
      {isEnterprise ? "Contact Sales" : "Select Plan"}
    </button>
    <div className="flex-grow">
      <p className="font-medium mb-4">Features:</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-left">
            <svg
              className="w-5 h-5 text-[#0066FF] mt-0.5 flex-shrink-0"
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
