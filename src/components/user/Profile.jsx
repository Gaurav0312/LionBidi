import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "react-hot-toast";

const Profile = () => {
  const { user, login } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  // Load addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem("addresses");
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("addresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleSaveProfile = () => {
    const updatedUser = {
      ...user,
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    };
    login(updatedUser);
    toast.success("Profile updated successfully");
    setIsEditing(false);
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.phone) {
      toast.error("Please fill all address fields");
      return;
    }
    const newAddr = { ...newAddress, id: Date.now() };
    setAddresses((prev) => [...prev, newAddr]);
    setNewAddress({
      name: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });
    setShowAddressForm(false);
    toast.success("Address added successfully");
  };

  const handleDeleteAddress = (id) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    toast.success("Address deleted");
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      {/* Profile Info */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
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
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600"
            >
              <Save size={16} className="inline mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Address Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Saved Addresses</h2>
          <button
            onClick={() => setShowAddressForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={16} />
            <span>Add Address</span>
          </button>
        </div>

        {/* List of Addresses */}
        {addresses.length === 0 ? (
          <p className="text-gray-500">No addresses saved yet.</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 rounded-lg p-4 flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{addr.name}</p>
                  <p className="text-sm text-gray-600">
                    {addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Address Form */}
        {showAddressForm && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <input type="text" placeholder="Address Name" value={newAddress.name} onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Street" value={newAddress.street} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
              <input type="text" placeholder="PIN" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <input type="text" placeholder="Phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            <div className="flex space-x-3">
              <button onClick={handleAddAddress} className="px-6 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-orange-600">Save Address</button>
              <button onClick={() => setShowAddressForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
