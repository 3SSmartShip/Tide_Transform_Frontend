import React from "react";
import { Link } from "react-router-dom";
import TideTransformLogo from "../../assets/logos/Tide_Transform_logo_navbar.png";

export default function Footer() {
  return (
    <>
      <footer className="bg-black text-white relative pt-40 pb-8 ">   
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-32 w-full px-4 sm:px-6 md:w-[700px]">
              <div className="bg-[#0066FF] rounded-2xl px-6 py-6 sm:px-8 sm:py-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  Ready to try "Tide Transform"?
                </h2>
                <p className="text-white/80 mb-6 text-sm sm:text-base">
                  Take the first step towards transforming your maritime
                  operations; together, we create solutions for a seamless future.
                </p>
                <div className="flex justify-center">
                  <Link
                    to="/signup"
                    className="bg-white text-black px-4 sm:px-6 py-2 rounded-md hover:bg-white transition-colors text-sm sm:text-base font-medium"
                  >
                    Sign Up 
                  </Link>
                </div>
              </div>
            </div>

        <div className="max-w-7xl mx-auto px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
            <div>
              <div>
                <img 
                  src={TideTransformLogo}
                  alt="Tide Transform" 
                  className="h-10 mb-2"
                />
                <p className="text-gray-400 text-sm">3S Smart Ship Solution</p>
              </div>
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
            <div className="md:col-start-5">
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
          
          {/* Add copyright text with reduced spacing */}
          <div className="text-center mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © 2025 3S Smart Ship Solution Pte Ltd.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
