import React, { useState, useEffect, useCallback } from "react";
import { useAppContext } from "../../context/AppContext";
import {
  User,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  MapPin,
  Home,
  Navigation,
  CheckCircle,
  AlertCircle,
  Star,
  Loader,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "../../utils/api";

const Profile = () => {
  const { user, login, userAddress, fetchUserAddress } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    locality: "",
    landmark: "",
  });

  // Loading and validation states
  const [isPinCodeLoading, setIsPinCodeLoading] = useState(false);
  const [pinCodeStatus, setPinCodeStatus] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});

  // Load user data and addresses on mount
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      loadUserAddresses();
    }
  }, [user]);

  // Load addresses from backend
  const loadUserAddresses = async () => {
    if (!user) return;
    
    try {
      setIsLoadingAddresses(true);
      console.log("Loading addresses for user:", user._id);
      
      const response = await api.get("/api/address");
      console.log("Address response:", response.data);
      
      if (response.data.success) {
        const addressList = [];
        
        // Add primary address if exists
        if (response.data.address) {
          addressList.push({
            id: 'primary',
            name: response.data.userInfo?.name || user?.name || '',
            street: response.data.address.street || '',
            city: response.data.address.city || '',
            state: response.data.address.state || '',
            pincode: response.data.address.zipCode || '',
            phone: response.data.userInfo?.phone || user?.phone || '',
            locality: '',
            landmark: '',
            isPrimary: true,
            isDefault: true
          });
        }

        // Add additional addresses
        if (response.data.addresses && response.data.addresses.length > 0) {
          response.data.addresses.forEach((addr) => {
            if (!addr.isDefault) { // Only add non-default secondary addresses
              addressList.push({
                id: addr._id,
                name: response.data.userInfo?.name || user?.name || '',
                street: addr.street || '',
                city: addr.city || '',
                state: addr.state || '',
                pincode: addr.zipCode || '',
                phone: response.data.userInfo?.phone || user?.phone || '',
                locality: '',
                landmark: '',
                isPrimary: false,
                isDefault: false
              });
            }
          });
        }

        console.log("Processed addresses:", addressList);
        setAddresses(addressList);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  // Pincode validation
  const validatePincode = useCallback(async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setPinCodeStatus("");
      return;
    }

    setIsPinCodeLoading(true);
    setPinCodeStatus("");

    try {
      // Use backend proxy to avoid SSL/CORS issues with third-party API
      const response = await api.get(`/api/delivery/pincode/${pincode}`);
      const responseData = response.data;

      if (responseData.success && responseData.data?.[0]?.Status === "Success" && responseData.data[0].PostOffice?.length > 0) {
        const primaryLocation = responseData.data[0].PostOffice[0];
        
        setNewAddress(prev => ({
          ...prev,
          city: primaryLocation.District || primaryLocation.Block || "",
          state: primaryLocation.State || primaryLocation.Circle || "",
        }));
        
        setPinCodeStatus("valid");
      } else {
        setPinCodeStatus("invalid");
        setNewAddress(prev => ({ ...prev, city: "", state: "" }));
      }
    } catch (error) {
      console.error("Error validating pincode:", error);
      setPinCodeStatus("error");
      // Don't clear city/state on network error — let user enter manually
    } finally {
      setIsPinCodeLoading(false);
    }
  }, []);


  const handleSaveProfile = async () => {
    // Validate
    if (!profileData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (profileData.phone && !/^\d{10}$/.test(profileData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await api.put("/api/auth/profile", {
        name: profileData.name.trim(),
        phone: profileData.phone.trim(),
      });

      if (response.data.user) {
        // Update context with the returned user data
        const updatedUser = {
          ...user,
          name: response.data.user.name,
          phone: response.data.user.phone,
        };
        login(updatedUser);
        toast.success("Profile updated successfully");
        setIsEditing(false);
      } else {
        toast.success(response.data.message || "Profile updated successfully");
        // Update context with local data as fallback
        const updatedUser = {
          ...user,
          name: profileData.name.trim(),
          phone: profileData.phone.trim(),
        };
        login(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field-specific error when user types
    if (addressErrors[name]) {
      setAddressErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "pincode") {
      const numericValue = value.replace(/\D/g, "").slice(0, 6);
      setNewAddress(prev => ({ ...prev, [name]: numericValue }));
      
      if (numericValue.length === 6) {
        validatePincode(numericValue);
      } else if (numericValue.length < 6) {
        setNewAddress(prev => ({ ...prev, city: "", state: "" }));
        setPinCodeStatus("");
      }
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setNewAddress(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setNewAddress(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateAddressForm = () => {
    const errors = {};
    
    if (!newAddress.name?.trim()) errors.name = "Name is required";
    if (!newAddress.street?.trim()) errors.street = "Address is required";
    if (!newAddress.pincode?.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(newAddress.pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    } else if (pinCodeStatus === "invalid") {
      errors.pincode = "Invalid pincode — not found in India Post database";
    }
    if (!newAddress.city?.trim()) errors.city = "City is required";
    if (!newAddress.state?.trim()) errors.state = "State is required";
    if (!newAddress.phone?.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10}$/.test(newAddress.phone)) {
      errors.phone = "Phone must be 10 digits";
    }
    
    setAddressErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Show the first error as a toast too
      toast.error(Object.values(errors)[0]);
      return false;
    }
    
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateAddressForm()) return;

    setIsSavingAddress(true);
    try {
      console.log("Saving address:", newAddress);
      console.log("Editing address:", editingAddress);
      console.log("Current addresses count:", addresses.length);

      if (editingAddress) {
        // Update existing address
        if (editingAddress.isPrimary) {
          // Update primary address
          const response = await api.post("/api/address/save", {
            name: newAddress.name,
            mobileNumber: newAddress.phone,
            emailAddress: user?.email || profileData.email,
            address: newAddress.street,
            locality: newAddress.locality || "",
            landmark: newAddress.landmark || "",
            pinCode: newAddress.pincode,
            city: newAddress.city,
            state: newAddress.state,
          });
          console.log("Primary address update response:", response.data);
        } else {
          // Update secondary address
          const response = await api.put(`/api/address/${editingAddress.id}`, {
            street: `${newAddress.street}${newAddress.locality ? ", " + newAddress.locality : ""}${newAddress.landmark ? ", " + newAddress.landmark : ""}`,
            city: newAddress.city,
            state: newAddress.state,
            zipCode: newAddress.pincode,
            isDefault: false
          });
          console.log("Secondary address update response:", response.data);
        }
        toast.success("Address updated successfully");
      } else {
        // Add new address
        if (addresses.length === 0) {
          // First address becomes primary
          const response = await api.post("/api/address/save", {
            name: newAddress.name,
            mobileNumber: newAddress.phone,
            emailAddress: user?.email || profileData.email,
            address: newAddress.street,
            locality: newAddress.locality || "",
            landmark: newAddress.landmark || "",
            pinCode: newAddress.pincode,
            city: newAddress.city,
            state: newAddress.state,
          });
          console.log("First address (primary) save response:", response.data);
        } else {
          // Add as secondary address
          const response = await api.post("/api/address/add", {
            street: `${newAddress.street}${newAddress.locality ? ", " + newAddress.locality : ""}${newAddress.landmark ? ", " + newAddress.landmark : ""}`,
            city: newAddress.city,
            state: newAddress.state,
            zipCode: newAddress.pincode,
            isDefault: false
          });
          console.log("Secondary address add response:", response.data);
        }
        toast.success("Address added successfully");
      }

      // Reload addresses and refresh context
      await loadUserAddresses();
      if (fetchUserAddress) {
        console.log("Refreshing user address in context");
        await fetchUserAddress();
      }
      
      // Reset form
      resetAddressForm();
      
    } catch (error) {
      console.error("Error saving address:", error);
      const errorMessage = error.response?.data?.message || "Failed to save address";
      toast.error(errorMessage);
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setNewAddress({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
      locality: address.locality || "",
      landmark: address.landmark || "",
    });
    setEditingAddress(address);
    setAddressErrors({});
    setShowAddressForm(true);

    // Re-validate the existing pincode to set correct status
    if (address.pincode && /^\d{6}$/.test(address.pincode)) {
      // Set a temporary "checking" status while we validate
      setPinCodeStatus("");
      validatePincode(address.pincode);
    } else {
      setPinCodeStatus("");
    }
  };

  const handleDeleteAddress = async (address) => {
    if (address.isPrimary) {
      toast.error("Cannot delete primary address. Add another address first and set it as primary.");
      return;
    }

    const isConfirmed = window.confirm(
      `Delete this address?\n\n${address.name}\n${address.street}\n${address.city}, ${address.state} - ${address.pincode}`
    );

    if (!isConfirmed) return;

    try {
      console.log("Deleting address:", address.id);
      await api.delete(`/api/address/${address.id}`);
      
      // Reload addresses and refresh context
      await loadUserAddresses();
      if (fetchUserAddress) {
        await fetchUserAddress();
      }
      
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete address";
      toast.error(errorMessage);
    }
  };

  const handleSetPrimary = async (address) => {
    if (address.isPrimary) return;

    try {
      console.log("Setting address as primary:", address.id);
      await api.patch(`/api/address/${address.id}/default`);
      
      // Reload addresses and refresh context
      await loadUserAddresses();
      if (fetchUserAddress) {
        await fetchUserAddress();
      }
      
      toast.success("Primary address updated");
    } catch (error) {
      console.error("Error setting primary address:", error);
      toast.error("Failed to update primary address");
    }
  };

  const resetAddressForm = () => {
    setNewAddress({
      name: user?.name || profileData.name || "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      phone: user?.phone || profileData.phone || "",
      locality: "",
      landmark: "",
    });
    setShowAddressForm(false);
    setEditingAddress(null);
    setPinCodeStatus("");
    setAddressErrors({});
  };

  const handleAddNewAddress = () => {
    resetAddressForm();
    setShowAddressForm(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          <button
            onClick={() => {
              if (isEditing) {
                // Cancel editing - reset to original values
                setProfileData({
                  name: user?.name || "",
                  email: user?.email || "",
                  phone: user?.phone || "",
                });
              }
              setIsEditing(!isEditing);
            }}
            className="flex items-center space-x-2 px-4 py-2 text-orange-600 border border-orange-500 rounded-lg hover:bg-orange-50"
          >
            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
            <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
          </button>
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-orange-600" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled={true}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              title="Email cannot be changed"
            />
            {isEditing && (
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "").slice(0, 10);
                setProfileData({ ...profileData, phone: numericValue });
              }}
              disabled={!isEditing}
              maxLength={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6">
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {isSavingProfile ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Delivery Addresses</h2>
          <button
            onClick={handleAddNewAddress}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={16} />
            <span>Add Address</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoadingAddresses ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin h-8 w-8 text-orange-600 mr-2" />
            <span className="text-gray-600">Loading addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No addresses saved yet.</p>
            <button
              onClick={handleAddNewAddress}
              className="px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="font-medium text-gray-800">{addr.name}</p>
                      {addr.isPrimary && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center">
                          <Star size={12} className="mr-1" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {addr.street}
                      {addr.locality && `, ${addr.locality}`}
                      {addr.landmark && `, ${addr.landmark}`}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!addr.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(addr)}
                        className="text-yellow-600 hover:text-yellow-700 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                        title="Set as Primary"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(addr)}
                      className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit Address"
                    >
                      <Edit3 size={16} />
                    </button>
                    {!addr.isPrimary && (
                      <button
                        onClick={() => handleDeleteAddress(addr)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete Address"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Address Form */}
        {showAddressForm && (
          <div className="mt-6 p-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={newAddress.name}
                    onChange={handleAddressInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
                      addressErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {addressErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="10-digit phone number"
                    value={newAddress.phone}
                    onChange={handleAddressInputChange}
                    maxLength={10}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
                      addressErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {addressErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Home className="w-4 h-4 inline mr-1" />
                  Complete Address *
                </label>
                <textarea
                  name="street"
                  placeholder="House/Flat No., Building Name, Street Name"
                  value={newAddress.street}
                  onChange={handleAddressInputChange}
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 resize-none ${
                    addressErrors.street ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addressErrors.street && (
                  <p className="text-red-500 text-xs mt-1">{addressErrors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locality/Area</label>
                  <input
                    type="text"
                    name="locality"
                    placeholder="Locality or Area"
                    value={newAddress.locality}
                    onChange={handleAddressInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Navigation className="w-4 h-4 inline mr-1" />
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    placeholder="Nearby landmark"
                    value={newAddress.landmark}
                    onChange={handleAddressInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Pin Code *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="pincode"
                      placeholder="6-digit PIN code"
                      value={newAddress.pincode}
                      onChange={handleAddressInputChange}
                      maxLength={6}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
                        addressErrors.pincode ? "border-red-500" :
                        pinCodeStatus === "valid" ? "border-green-500" : 
                        pinCodeStatus === "invalid" ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {isPinCodeLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader className="animate-spin h-4 w-4 text-orange-600" />
                      </div>
                    )}
                    {!isPinCodeLoading && pinCodeStatus === "valid" && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                    )}
                    {!isPinCodeLoading && pinCodeStatus === "invalid" && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                    )}
                  </div>
                  {addressErrors.pincode && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>
                  )}
                  {!addressErrors.pincode && pinCodeStatus === "invalid" && (
                    <p className="text-red-500 text-xs mt-1">Invalid pincode</p>
                  )}
                  {pinCodeStatus === "error" && (
                    <p className="text-yellow-600 text-xs mt-1">Could not verify — enter city/state manually</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={handleAddressInputChange}
                    readOnly={pinCodeStatus === "valid"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
                      addressErrors.city ? "border-red-500" : "border-gray-300"
                    } ${pinCodeStatus === "valid" ? "bg-gray-50" : ""}`}
                  />
                  {addressErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={handleAddressInputChange}
                    readOnly={pinCodeStatus === "valid"}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-200 focus:border-orange-400 ${
                      addressErrors.state ? "border-red-500" : "border-gray-300"
                    } ${pinCodeStatus === "valid" ? "bg-gray-50" : ""}`}
                  />
                  {addressErrors.state && (
                    <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSaveAddress}
                disabled={isSavingAddress || isPinCodeLoading}
                className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSavingAddress ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>{editingAddress ? "Update Address" : "Save Address"}</span>
                  </>
                )}
              </button>
              <button
                onClick={resetAddressForm}
                disabled={isSavingAddress}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;