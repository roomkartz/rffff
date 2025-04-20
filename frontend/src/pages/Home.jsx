import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import { FaSearch, FaComments, FaEye, FaStar, FaQuoteLeft, FaHeart, FaBed, FaBath, FaRulerCombined } from "react-icons/fa";
import { BsHouseDoorFill, BsTelephoneFill, BsArrowLeft, BsArrowRight } from "react-icons/bs";

const Home = () => {
  const role = localStorage.getItem("role");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    document.title = "Home | Find Your Perfect Room";
    fetchProperties();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (properties.length > 0) {
      startAutoSlide();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [properties]);

  const fetchProperties = async () => {
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;      
      const res = await fetch(`${apiBaseUrl}/users/properties`);
      const data = await res.json();

      if (res.ok) {
        setProperties(data);
      } else {
        setError(data.error || "Failed to fetch properties.");
      }
    } catch (err) {
      setError("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === properties.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? properties.length - 1 : prevIndex - 1
    );
    startAutoSlide();
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === properties.length - 1 ? 0 : prevIndex + 1
    );
    startAutoSlide();
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    startAutoSlide();
  };

  return (
    <div className="relative bg-white min-h-screen text-[#2D3A45] overflow-hidden">
      {/* Background image with controlled opacity */}
      <div 
        className="fixed inset-0 z-0 opacity-90"
        style={{
          backgroundImage: "url('https://imgs.search.brave.com/0OKO6lMeixRsAPa3K7aALFqPPGy98VwT4tyIlNTp9H0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzEwLzU4LzI3LzI4/LzM2MF9GXzEwNTgy/NzI4MTNfZDlRSzNR/TnpRaXhDSjNWdHF6/VFNTdmQ5MjJxWERF/TEguanBn')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(1px)"
        }}
      />
      
      <div className="relative z-10">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative bg-[#2D3A45]/30 text-white py-32 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Find Your <span className="text-[#FFD700]">Perfect</span> Room <br /> Without the Hassle
            </h1>
            

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/properties"
                  className="flex items-center justify-center gap-2 bg-[#FFD700] text-[#2D3A45] font-semibold px-8 py-4 rounded-lg hover:bg-[#FFC000] transition shadow-lg hover:shadow-xl"
                >
                  <BsHouseDoorFill /> Explore Rooms
                </Link>
              </motion.div>

              {(role !== "User") && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/owner"
                    className="flex items-center justify-center gap-2 border-2 border-[#FFD700] text-[#FFD700] px-8 py-3.5 rounded-lg hover:bg-[#FFD700] hover:text-[#2D3A45] transition shadow-lg hover:shadow-xl"
                  >
                    <BsTelephoneFill /> List Your Property
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Featured Properties Section */}
        {properties.length > 0 && (
          <section className="py-20 bg-white/90 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2D3A45]">
                  Featured Properties
                </h2>
                <div className="w-24 h-1 bg-[#FFD700] mx-auto mb-6"></div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore our handpicked selection of premium properties
                </p>
              </motion.div>

              <div 
                className="relative overflow-hidden"
                onMouseEnter={stopAutoSlide}
                onMouseLeave={startAutoSlide}
                ref={sliderRef}
              >
                <div className="relative h-[500px]">
                  {properties.map((property, index) => (
                    <motion.div
                      key={property._id}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                        index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: index === currentIndex ? 1 : 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="w-full max-w-md mx-auto">
                        <Link 
                          key={property._id}
                          to={`/properties/${property._id}`}
                          state={{ property }}
                          className="block bg-white rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                        >
                          <div className="relative h-64 overflow-hidden">
                            {property.images && property.images.length > 0 ? (
                              <img
                                src={property.images[0]}
                                alt={property.address}
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <BsHouseDoorFill className="text-4xl text-gray-400" />
                              </div>
                            )}
                                <span
  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${
    property.status === "Closed"
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800"
  }`}
>
  {property.status === "Closed" ? "Unavailable" : "Available"}
</span>
                            <div className="absolute bottom-4 left-4 bg-[#FFD700] text-[#2D3A45] font-bold px-3 py-1 rounded-md">
                              ₹{property.rent}/mo
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-xl font-bold mb-2 text-[#2D3A45] truncate">
                              {property.near}
                            </h3>
                           
                            <p className="text-gray-700 mb-4 line-clamp-2">
                              {property.description}
                            </p>
                          
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {property.furnishing}
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {property.gender}
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {property.restriction}
                              </span>
                              <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                {property.bhk} BHK
                              </span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#2D3A45] p-2 rounded-full shadow-md z-10"
                  aria-label="Previous property"
                >
                  <BsArrowLeft className="text-xl" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#2D3A45] p-2 rounded-full shadow-md z-10"
                  aria-label="Next property"
                >
                  <BsArrowRight className="text-xl" />
                </button>

                {/* Dots indicator */}
                <div className="flex justify-center mt-8">
                  {properties.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 mx-1 rounded-full transition-all ${
                        index === currentIndex ? "bg-[#FFD700] w-6" : "bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

    

        {/* Features Section */}
        <section className="relative py-20 bg-white/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2D3A45]">
                Why Choose Us?
              </h2>
              <div className="w-24 h-1 bg-[#FFD700] mx-auto mb-6"></div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We make finding or listing a room simple, secure, and stress-free.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Verified Listings",
                  desc: "Each property goes through a thorough verification process to ensure quality and authenticity.",
                  icon: <FaSearch className="text-3xl text-[#FFD700]" />
                },
                {
                  title: "Instant Communication",
                  desc: "Connect directly with owners or tenants through WhatsApp or call instantly from the app.",
                  icon: <FaComments className="text-3xl text-[#FFD700]" />
                },
                {
                  title: "Transparent Process",
                  desc: "Everything upfront—clear details, verified listings, and no surprises.",
                  icon: <FaEye className="text-3xl text-[#FFD700]" />
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-[#2D3A45]">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-[#F8F9FA]">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#2D3A45]">
                What Our Users Say
              </h2>
              <div className="w-24 h-1 bg-[#FFD700] mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Found my dream apartment in just 2 days! The verification process gave me peace of mind.",
                  author: "Ram sharma",
                  
                  rating: 5
                },
                {
                  quote: "As a property owner, I appreciate how easy it is to list and manage my rooms.",
                  author: "Raj P.",
                  role: "Property Owner",
                  rating: 5
                },
                {
                  quote: "Found exactly what I was looking for—and the verified listings made all the difference!",
                  author: "Aryan patel",
                 
                  rating: 4
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  <FaQuoteLeft className="text-2xl text-[#FFD700] mb-4" />
                  <p className="text-gray-700 italic mb-6">{testimonial.quote}</p>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={i < testimonial.rating ? "text-[#FFD700]" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3A45]">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-[#2D3A45] text-white py-24 px-6 text-center">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: "url('https://imgs.search.brave.com/0OKO6lMeixRsAPa3K7aALFqPPGy98VwT4tyIlNTp9H0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzEwLzU4LzI3LzI4/LzM2MF9GXzEwNTgy/NzI4MTNfZDlRSzNR/TnpRaXhDSjNWdHF6/VFNTdmQ5MjJxWERF/TEguanBn')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}></div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Journey Today</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Browse verified rooms or list your own in just a few steps.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/properties"
                className="inline-flex items-center justify-center gap-2 bg-[#FFD700] text-[#2D3A45] font-semibold px-8 py-4 rounded-lg hover:bg-[#FFC000] transition shadow-lg hover:shadow-xl"
              >
                <BsHouseDoorFill /> Get Started Now
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default Home;