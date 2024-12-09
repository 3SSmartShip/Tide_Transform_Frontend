import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { JSONTree } from "react-json-tree";
import {
  DocumentArrowUpIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import PricingPlans from "../PricingPlans/PricingPlans";

const jsonTheme = {
  scheme: "monokai",
  base00: "#272822",
  base01: "#383830",
  base02: "#49483e",
  base03: "#75715e",
  base04: "#a59f85",
  base05: "#f8f8f2",
  base06: "#f5f4f1",
  base07: "#f9f8f5",
  base08: "#f92672",
  base09: "#fd971f",
  base0A: "#f4bf75",
  base0B: "#a6e22e",
  base0C: "#a1efe4",
  base0D: "#66d9ef",
  base0E: "#ae81ff",
  base0F: "#cc6633",
};

export default function DataProcessing() {
  const [file, setFile] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  const onDrop = useCallback(acceptedFiles => {
    if (!results) { // Only allow file drop if no results are showing
      const newFile = acceptedFiles[0];
      if (newFile) {
        if (file) {
          URL.revokeObjectURL(file.preview);
        }
        setFile(Object.assign(newFile, {
          preview: URL.createObjectURL(newFile)
        }));
        setError(null);
        setShowPricing(false);
      }
    } else {
      setShowPricing(true); // Show pricing if trying to upload while results are shown
    }
  }, [file, results]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760, // 10MB
    maxFiles: 1,
    multiple: false,
    disabled: results !== null // Disable dropzone if results are showing
  });

  const removeFile = () => {
    if (file && !results) { // Only allow file removal if no results are showing
      URL.revokeObjectURL(file.preview);
      setFile(null);
      setSelectedMethod(null);
      setError(null);
      setShowPricing(false);
    }
  };

  const processFile = async () => {
    if (!file || !selectedMethod) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const processedResults = selectedMethod === 'pattern'
        ? await simulatePatternDetection(file)
        : await simulateAIAnalysis(file);

      setResults(processedResults);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMethodSelect = (method) => {
    if (!results) {
      setSelectedMethod(method);
    } else {
      setShowPricing(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* File Upload Section - Always visible but disabled after processing */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Document Processing Demo</h2>
          <div
            {...getRootProps()}
            className={classNames(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300',
              results ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-400',
            )}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            {results ? (
              <p className="mt-2 text-sm text-gray-600">
                Please check our pricing plans to process more documents
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop a PDF file here, or click to browse
                </p>
                <p className="mt-1 text-xs text-gray-500">Max file size: 10MB</p>
              </>
            )}
          </div>

          {/* File Preview */}
          {file && !results && (
            <div className="mt-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <DocumentArrowUpIcon className="h-6 w-6 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Method Selection - Only shown when file is uploaded and no results */}
        {file && !results && (
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Processing Method</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pattern Detection Card */}
              <div
                className={classNames(
                  'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  selectedMethod === 'pattern'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                )}
                onClick={() => handleMethodSelect('pattern')}
              >
                <h3 className="text-lg font-medium text-gray-900">Pattern Detection</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Efficient processing for standardized documents
                </p>
              </div>

              {/* 3S AI Card */}
              <div
                className={classNames(
                  'p-4 rounded-lg border-2 cursor-pointer transition-colors',
                  selectedMethod === 'ai'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                )}
                onClick={() => handleMethodSelect('ai')}
              >
                <h3 className="text-lg font-medium text-gray-900">3S AI Processing</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Advanced AI-powered document analysis
                </p>
              </div>
            </div>

            {selectedMethod && (
              <button
                onClick={processFile}
                disabled={isLoading}
                className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : `Process with ${selectedMethod === 'pattern' ? 'Pattern Detection' : '3S AI'}`}
              </button>
            )}
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                {selectedMethod === 'pattern' ? 'Pattern Detection' : '3S AI'} Results
              </h3>
              <div className="bg-[#272822] rounded-lg p-4 overflow-auto max-h-[600px]">
                <JSONTree
                  data={results}
                  theme={jsonTheme}
                  invertTheme={false}
                  shouldExpandNode={() => true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Show pricing when results are displayed or when trying to upload another file */}
        {(results || showPricing) && <PricingPlans selectedMethod={selectedMethod} />}
      </div>
    </div>
  );
}

// Simulated API calls
const simulatePatternDetection = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        documentType: "Invoice",
        confidence: 0.95,
        extractedData: {
          invoiceNumber: "INV-2024-001",
          date: "2024-03-15",
          total: 1250.0,
          currency: "USD",
          lineItems: [
            {
              description: "Professional Services",
              quantity: 1,
              unitPrice: 1250.0,
              total: 1250.0,
            },
          ],
        },
      });
    }, 2000);
  });
};

const simulateAIAnalysis = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        documentType: "Invoice",
        confidence: 0.98,
        extractedData: {
          invoiceNumber: "INV-2024-001",
          date: "2024-03-15",
          total: 1250.0,
          currency: "USD",
          lineItems: [
            {
              description: "Professional Services",
              quantity: 1,
              unitPrice: 1250.0,
              total: 1250.0,
            },
          ],
          additionalInsights: {
            paymentTerms: "Net 30",
            suggestedCategory: "Operating Expenses",
            complianceStatus: "Compliant",
            riskScore: "Low",
            recommendations: [
              "Consider early payment discount",
              "Archive for tax purposes",
            ],
          },
        },
      });
    }, 2500);
  });
};
