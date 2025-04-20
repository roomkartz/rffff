import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Navigation, Pagination, EffectFade, Autoplay } from "swiper/modules";
import { ArrowLeft, MapPin, Wifi, Droplet, Zap, Shield, Home } from "lucide-react";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const passedProperty = location.state?.property || null;

  const [property, setProperty] = useState(passedProperty);
  const [loading, setLoading] = useState(!passedProperty);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!passedProperty) {
      const fetchProperty = async () => {
        try {
          const apiBaseUrl = process.env.REACT_APP_API_BASE_URL; // Retrieve the API base URL from environment variables
        
          const res = await fetch(`${apiBaseUrl}/users/properties/${id}`);
          const data = await res.json();

          if (res.ok) {
            setProperty(data);
          } else {
            setError(data.error || "Failed to fetch property details.");
          }
        } catch (err) {
          setError("Error connecting to server.");
        } finally {
          setLoading(false);
        }
      };

      fetchProperty();
    }
  }, [id, passedProperty]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
        <div className="text-gray-600">Loading property details...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-xl">
        <div className="text-red-500 font-medium mb-2">Error</div>
        <div className="text-gray-700">{error}</div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
  
  if (!property) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-6 max-w-md mx-auto bg-gray-50 rounded-xl">
        <div className="text-gray-700">Property not found.</div>
        <button 
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Browse Properties
        </button>
      </div>
    </div>
  );

  // Format price with commas
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(property.rent);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to listings
        </button>

        {/* Property Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Image Carousel */}
          <Swiper
            spaceBetween={0}
            slidesPerView={1}
            navigation
            loop={true}
            effect={'fade'}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true 
            }}
            modules={[Navigation, Pagination, EffectFade, Autoplay]}
            className="w-full h-64 sm:h-96 md:h-[500px]"
          >
            {(property.images || [property.image]).map((img, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full">
                  <img
                    src={img}
                    alt={`Property view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {index + 1} / {property.images?.length || 1}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Property Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.address}</h1>
                <div className="flex items-center text-gray-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location || property.city}</span>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-lg font-semibold px-4 py-2 rounded-lg">
                  {formattedPrice} <span className="text-sm font-normal">/month</span>
                </span>
              </div>
            </div>

            {/* Property Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center bg-blue-50 text-blue-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-medium">
                {property.gender} Only
              </span>
              {property.furnishing && (
                <span className="inline-flex items-center bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-medium">
                  {property.furnishing}
                </span>
              )}
              {property.propertyType && (
                <span className="inline-flex items-center bg-purple-50 text-purple-800 text-xs px-3 py-1 rounded-full uppercase tracking-wide font-medium">
                  {property.propertyType}
                </span>
              )}
            </div>

            {/* Key Features */}
         

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description || 'No description provided.'}
              </p>
            </div>
{/* Details */}
<div className="mb-8">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Details</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
    {[
      {
        name: "BHK",
        value: property.bhk,
        icon: <Home className="w-5 h-5" />,
      },
      {
        name: "Bathrooms",
        value: property.bathroom,
        icon: <Droplet className="w-5 h-5" />,
      },
      {
        name: "Floor",
        value: property.floor,
        icon: <ArrowLeft className="w-5 h-5" />, // Consider a better icon like Building or Layers if available
      },
      {
        name: "Total Floors",
        value: property.totalFloors,
        icon: <MapPin className="w-5 h-5" />, // Can be swapped out for something more floor-relevant
      },
    ].map((detail, idx) => (
      <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
        <div className="text-blue-600">
          {detail.icon}
        </div>
        <div className="text-gray-800 font-medium">
          {detail.name}: {detail.value}
        </div>
      </div>
    ))}
  </div>
</div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "WiFi", icon: <Wifi className="w-5 h-5" />, condition: property.wifi },
                  { name: "AC", icon: <Wifi className="w-5 h-5" />, condition: property.Ac },

                  { name: "Water Supply", icon: <Droplet className="w-5 h-5" />, condition: property.waterSupply },
                  { name: "Power Backup", icon: <Zap className="w-5 h-5" />, condition: property.powerBackup },
                  { name: "Security", icon: <Shield className="w-5 h-5" />, condition: property.security },
                  { name: "Furnishing", icon: <Home className="w-5 h-5" />, condition: property.furnishing },
                  { name: "Restriction", icon: <Shield className="w-5 h-5" />, condition: property.restriction },

                  // Add more amenities as needed
                ].filter(amenity => amenity.condition).map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                    <div className="text-blue-600">
                      {amenity.icon}
                    </div>
                    <div className="text-gray-800 font-medium">
                      {amenity.name === "Furnishing" ? property.furnishing : amenity.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="border-t border-gray-200 pt-6">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact for more details</h2>
  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
      
    </div>
    <a
      href="tel:+917023368224"
      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition cursor-pointer text-center"
    >
      Call Us
    </a>
    <a
      href="https://wa.me/917023368224"
      target="_blank"
      rel="noopener noreferrer"
      className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition cursor-pointer text-center"
    >
      Send Message
    </a>
  </div>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;