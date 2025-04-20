import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { FiUser, FiPhone, FiMail, FiMessageSquare, FiChevronRight } from 'react-icons/fi';
import { BiLogOut, BiTrash, BiBuilding, BiPlus } from 'react-icons/bi';

const OwnerDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.removeItem('token');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? All data will be lost.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/users/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-700">Failed to load user data.</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 rounded-full bg-[#2D3A45] flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-white/20 rounded-full" />
                    <div className="relative z-10 text-gray-100 text-3xl">
                      {user.name?.[0]}
                    </div>
                  </div>
                </div>
                <div className="flex-grow">
                  <h2 className="text-3xl font-bold text-gray-900 text-center md:text-left">
                    {user.name}
                  </h2>
                  <p className="text-gray-600 text-center md:text-left">Roomkartz Owner</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FiUser className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-gray-900">{user.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FiMail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-gray-900 break-all">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-start mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <FiPhone className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-gray-900">+91 {user.mobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Management Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Property Management</h3>
                <div className="space-y-4">
                  <Link 
                    to="/owner/properties" 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <BiBuilding className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">My Properties</p>
                        <p className="text-gray-900">View and manage all your listed properties</p>
                      </div>
                    </div>
                    <FiChevronRight className="h-5 w-5 text-blue-600" />
                  </Link>
                  
                  <Link 
                    to="/owner/add-property" 
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <BiPlus className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Add New Property</p>
                        <p className="text-gray-900">Quickly list a new property with all details</p>
                      </div>
                    </div>
                    <FiChevronRight className="h-5 w-5 text-blue-600" />
                  </Link>
                </div>
              </div>

              {/* Support Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Support</h3>
                <div className="space-y-4">
                <div className="flex items-start">
  <div className="bg-blue-100 p-3 rounded-lg mr-4">
    <FiMessageSquare className="h-6 w-6 text-blue-600" />
  </div>
  <div>
    <p className="text-sm font-medium text-gray-500">Support Email</p>
    <a href="mailto:roomkartz@gmail.com" className="text-gray-900 hover:underline">
      roomkartz@gmail.com
    </a>
  </div>
</div>

<div className="flex items-start mt-4">
  <div className="bg-blue-100 p-3 rounded-lg mr-4">
    <FiPhone className="h-6 w-6 text-blue-600" />
  </div>
  <div>
    <p className="text-sm font-medium text-gray-500">Support Phone</p>
    <a href="tel:+919876543210" className="text-gray-900 hover:underline">
      +91 98765 43210
    </a>
  </div>
</div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
  <motion.button
    onClick={handleLogout}
    disabled={isLoggingOut}
    className={`w-32 py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm ${
      isLoggingOut 
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
        : 'bg-blue-600 text-white hover:bg-blue-700'
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {isLoggingOut ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs">Signing Out...</span>
      </>
    ) : (
      <>
        <BiLogOut className="h-4 w-4 mr-2" />
        <span className="text-xs">Sign Out</span>
      </>
    )}
  </motion.button>

  <motion.button
    onClick={handleDeleteAccount}
    disabled={isDeleting}
    className={`w-32 py-2 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center text-sm ${
      isDeleting 
        ? 'bg-red-100 text-red-600 cursor-not-allowed' 
        : 'bg-red-600 text-white hover:bg-red-700'
    }`}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {isDeleting ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs">Deleting...</span>
      </>
    ) : (
      <>
        <BiTrash className="h-4 w-4 mr-2" />
        <span className="text-xs">Delete Account</span>
      </>
    )}
  </motion.button>
</div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OwnerDashboard;