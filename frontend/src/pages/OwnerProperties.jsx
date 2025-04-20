import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    rent: "",
    status: "Open"
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPropertyImages, setCurrentPropertyImages] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
     const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;    
      const res = await fetch(`${apiBaseUrl}/users/my-properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setProperties(data.properties);
      } else {
        setError(data.error || "Failed to fetch properties");
      }
    } catch (err) {
      setError("Server error while fetching properties");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (property) => {
    setEditingId(property._id);
    setEditForm({
      rent: property.rent,
      status: property.status
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === "rent" ? Number(value) : value
    }));
  };

  const handleUpdate = async (propertyId) => {
    const token = localStorage.getItem("token");
    try {
     const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;    
      const res = await fetch(`${apiBaseUrl}/users/update-property/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (res.ok) {
        setProperties(properties.map(prop => 
          prop._id === propertyId ? { ...prop, ...editForm } : prop
        ));
        setEditingId(null);
      } else {
        setError(data.error || "Failed to update property");
      }
    } catch (err) {
      setError("Server error while updating property");
    }
  };
  const handleDeleteClick = async (propertyId) => {
    const token = localStorage.getItem("token");
  
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
       const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;      
        const res = await fetch(`${apiBaseUrl}/users/delete-property/${propertyId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
  
        const data = await res.json();
        if (res.ok) {
          setProperties(properties.filter(prop => prop._id !== propertyId));
        } else {
          setError(data.error || "Failed to delete property");
        }
      } catch (err) {
        setError("Server error while deleting property");
      }
    }
  };
  const handleCancel = () => {
    setEditingId(null);
  };

  const openImageModal = (images, index = 0) => {
    setCurrentPropertyImages(images);
    setCurrentImageIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const goToPrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? currentPropertyImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === currentPropertyImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h2 className=" mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Your Listed Properties
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Manage and update your property listings
          </p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No properties</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first property.
            </p>
          </div>
        )}

        <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-1">
          {properties.map((property) => (
            <div
              key={property._id}
              className="bg-white overflow-hidden shadow-xl rounded-2xl transition-all duration-300 hover:shadow-2xl"
            >
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-2xl font-bold text-gray-900">{property.address}</h3>
                      <span
  className={`ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
    property.status === "Open"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800"
  }`}
>
  {property.status === "Open" ? "Available" : "Unavailable"}
</span>

                    </div>

                    {editingId === property._id ? (
                      <div className="mt-6 space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rent (₹)</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                              type="number"
                              name="rent"
                              value={editForm.rent}
                              onChange={handleEditChange}
                              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 py-3 border-gray-300 rounded-md"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                          >
                            <option value="Open">Available</option>
                            <option value="Closed">Not Available</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-3xl font-semibold text-green-600">₹{property.rent.toLocaleString()}<span className="text-lg text-gray-500">/month</span></p>
                        
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">Gender</p>
                              <p className="text-sm font-medium text-gray-900">{property.gender}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">Furnishing</p>
                              <p className="text-sm font-medium text-gray-900">{property.furnishing}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start">
                            <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <div className="ml-3">
                              <p className="text-sm text-gray-500">Restrictions</p>
                              <p className="text-sm font-medium text-gray-900">{property.restriction}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {property.images && property.images.length > 0 && (
                    <div className="mt-6 sm:mt-0 sm:ml-6 relative">
                      <div 
                        className="h-48 w-64 rounded-lg overflow-hidden relative cursor-pointer"
                        onClick={() => openImageModal(property.images, 0)}
                      >
                        <img
                          src={property.images[0]}
                          alt="Property"
                          className="w-full h-full object-cover absolute inset-0 transform hover:scale-105 transition duration-500"
                        />
                        {property.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-sm">
                            +{property.images.length - 1} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  {editingId === property._id ? (
                    <>
                      <button
                        onClick={handleCancel}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(property._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(property)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit Listing
                    </button>
                  )}
                      <button
  onClick={() => handleDeleteClick(property._id)}
  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
>
  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a1 1 0 011 1v1h-1v10h-1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1H3V5h1V4a1 1 0 011-1h1V3a1 1 0 011-1zm5 6a1 1 0 000 2H7a1 1 0 000-2h4z" clipRule="evenodd" />
  </svg>
  Delete Property
</button>
                </div>
            
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="relative">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 z-10 hover:bg-opacity-70 focus:outline-none"
                >
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="relative h-96 w-full">
                  <img
                    src={currentPropertyImages[currentImageIndex]}
                    alt={`Property ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {currentPropertyImages.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 focus:outline-none"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={goToNextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 focus:outline-none"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                
                {currentPropertyImages.length > 1 && (
                  <div className="px-4 py-3 bg-gray-50 flex justify-center space-x-2">
                    {currentPropertyImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerProperties;