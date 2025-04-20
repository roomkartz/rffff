import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    role: "User",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [passwordError, setPasswordError] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
  };

  const sendOtp = async () => {
    if (!formData.mobile) {
      toast.warning("Please enter your mobile number.");
      return;
    }
    
    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.warning("Please enter a valid 10-digit mobile number");
      return;
    }
  
    setLoadingOtp(true);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
  
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
  
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        "+91" + formData.mobile, 
        appVerifier
      );
  
      setConfirmation(confirmationResult);
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (formData.password.length < 8) {
      setPasswordError(true);
      return;
    } else {
      setPasswordError(false);
    }

    if (!otpSent) {
      await sendOtp();
      return;
    }

    if (!otp) {
      toast.warning("Please enter the OTP");
      return;
    }
    
    if (!/^\d{6}$/.test(otp)) {
      setOtpError(true);
      return;
    } else {
      setOtpError(false);
    }

    setLoadingRegister(true);
  
    try {
      await confirmation.confirm(otp);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${apiBaseUrl}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success(`Registration successful! Welcome ${formData.name}`);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      if (error.code === "auth/invalid-verification-code") {
        setOtpError(true);
      }
      console.error("Registration error:", error);
      toast.error("Network error or server unavailable. Please try again.");
    } finally {
      setLoadingRegister(false);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, mobile: value });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className=" my-10 bg-white p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">Join us to get started</p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">+91</span>
                </div>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile no."
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  required
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200"
                  maxLength="10"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength="6"
                className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 ${
                  passwordError ? "border-red-500" : ""
                }`}
              />
              {passwordError && (
                <div className="text-red-500 text-sm mt-1">Password must be at least 8 characters</div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Register as
              </label>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => handleRoleChange("User")}
                  className={`py-3 px-4 rounded-lg border transition-all duration-200 ${formData.role === "User" 
                    ? "bg-yellow-100 border-yellow-400 text-yellow-800 font-medium shadow-inner" 
                    : "border-gray-300 hover:border-yellow-300"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span>User</span>
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => handleRoleChange("Broker")}
                  className={`py-3 px-4 rounded-lg border transition-all duration-200 ${formData.role === "Broker" 
                    ? "bg-yellow-100 border-yellow-400 text-yellow-800 font-medium shadow-inner" 
                    : "border-gray-300 hover:border-yellow-300"}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 01-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <span>Owner</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>

            {otpSent && (
              <motion.div 
                variants={itemVariants}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter 6-digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-200 mb-4 ${
                    otpError ? "border-red-500 animate-shake" : ""
                  }`}
                  maxLength="6"
                />
                {otpError && (
                  <div className="text-red-500 text-sm">Invalid OTP. Please try again.</div>
                )}
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loadingOtp || loadingRegister}
                className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 flex items-center justify-center ${
                  loadingOtp || loadingRegister
                    ? "bg-yellow-600 text-white cursor-wait"
                    : "bg-yellow-500 text-white hover:bg-yellow-600"
                }`}
                whileHover={{ scale: loadingOtp || loadingRegister ? 1 : 1.02 }}
                whileTap={{ scale: loadingOtp || loadingRegister ? 1 : 0.98 }}
              >
                {loadingOtp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </>
                ) : loadingRegister ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : otpSent ? (
                  "Verify OTP & Register"
                ) : (
                  "Send OTP & Register"
                )}
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="text-center mt-6 text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-yellow-600 hover:text-yellow-700 focus:outline-none transition duration-150"
            >
              Sign in here
            </button>
          </motion.div>

          <div id="recaptcha-container" className="hidden"></div>
        </motion.div>

        <style jsx global>{`
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(3px); }
            50% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
          }
          #recaptcha-container {
            display: none !important;
          }
        `}</style>
      </div>
    </>
  );
};

export default Register;