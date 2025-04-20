import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setRole(localStorage.getItem("role"));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAutoLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
        await fetch(`${apiBaseUrl}/users/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Auto logout error:", err);
    } finally {
      localStorage.clear();
      setIsLoggedIn(false);
      navigate("/login");
      setIsMenuOpen(false);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (Date.now() >= decoded.exp * 1000) {
          handleAutoLogout();
        }
      } catch (err) {
        console.error("Token check error:", err);
        handleAutoLogout();
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    await handleAutoLogout();
  };

  const navLinks = [
    { path: "/", label: "Home" },
    ...(isLoggedIn && role === "User"
      ? [{ path: "/userdashboard", label: "Dashboard" }]
      : []),
    ...(isLoggedIn && role === "Broker"
      ? [{ path: "/owner", label: "Dashboard" }]
      : []),
    { path: "/properties", label: "Properties" },
    ...(isLoggedIn
      ? [{ path: null, label: "Logout", action: handleLogout }]
      : [{ path: "/login", label: "Login" }]),
  ];

  return (
    <nav
      className={`fixed w-full z-50 bg-[#2D3A45] transition-all duration-300 ease-in-out ${
        isScrolled ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center flex-shrink-0 text-white hover:text-[#FFD700] transition-colors duration-300 ease-in-out"
          >
            <span className="text-2xl font-bold">
              Room<span className="text-[#FFD700]">Kartz</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative group transition-all duration-300"
              >
                {link.path ? (
                  <Link
                    to={link.path}
                    className={`text-white text-lg font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? "text-[#FFD700]"
                        : "hover:text-[#FFD700]"
                    }`}
                  >
                    {link.label}
                    <div
                      className={`absolute bottom-0 left-0 w-full h-1 bg-[#FFD700] transform transition-all duration-300 ${
                        location.pathname === link.path
                          ? "opacity-100"
                          : "group-hover:opacity-100 opacity-0"
                      }`}
                    />
                  </Link>
                ) : (
                  <button
                    onClick={link.action}
                    className="text-white text-lg font-medium hover:text-[#FFD700] transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#FFD700] transition-colors duration-300"
            >
              <svg
                className="h-6 w-6 transform transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                    className="transform transition-transform duration-300"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        style={{ height: isMenuOpen ? "auto" : 0 }}
        className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="px-2 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="px-3 py-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              {link.path ? (
                <Link
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block text-white text-lg transition-colors duration-300 ${
                    location.pathname === link.path
                      ? "text-[#FFD700]"
                      : "hover:text-[#FFD700]"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    link.action();
                    setIsMenuOpen(false);
                  }}
                  className="block text-white text-lg w-full text-left hover:text-[#FFD700] transition-colors duration-300"
                >
                  {link.label}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;