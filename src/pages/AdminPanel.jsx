import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [stockUpdateMode, setStockUpdateMode] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("medicines");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    dosage: "",
    manufacturer: "",
    description: "",
    category: "",
    image: "",
    stock: 100,
  });

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch medicines
  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await api.get("/medicines");
      setMedicines(response.data);
    } catch (error) {
      console.error("Full error:", {
        config: error.config,
        status: error.response?.status,
        data: error.response?.data,
      });
      toast.error(`Failed to fetch medicines: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch low stock medicines
  const fetchLowStockMedicines = async () => {
    try {
      const response = await api.get("/medicines/admin/low-stock");
      setLowStockMedicines(response.data);
    } catch (error) {
      toast.error("Failed to fetch low stock medicines");
    }
  };

  // Fetch all orders
  const fetchAllOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await api.get("/orders/admin/all");
      setOrders(response.data);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    fetchMedicines();
    fetchLowStockMedicines();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchAllOrders();
    }
  }, [activeTab]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      dosage: "",
      manufacturer: "",
      description: "",
      category: "",
      image: "",
      stock: 100,
    });
    setEditingId(null);
  };

  // Handle form submit (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const medicineData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
      };

      if (editingId) {
        // Update existing medicine
        await api.put(`/medicines/${editingId}`, medicineData);
        toast.success("Medicine updated successfully");
      } else {
        // Create new medicine
        await api.post("/medicines", medicineData);
        toast.success("Medicine added successfully");
      }

      resetForm();
      fetchMedicines();
      fetchLowStockMedicines();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit medicine
  const handleEdit = (medicine) => {
    setFormData({
      name: medicine.name || "",
      price: medicine.price || "",
      dosage: medicine.dosage || "",
      manufacturer: medicine.manufacturer || "",
      description: medicine.description || "",
      category: medicine.category || "",
      image: medicine.image || "",
      stock: medicine.stock || 100,
    });
    setEditingId(medicine._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete medicine
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this medicine?"))
      return;

    try {
      await api.delete(`/medicines/${id}`);
      toast.success("Medicine deleted");
      fetchMedicines();
      fetchLowStockMedicines();
    } catch (error) {
      toast.error("Failed to delete medicine");
    }
  };

  // Update stock
  const handleUpdateStock = async (medicineId, newStock) => {
    try {
      await api.patch(`/medicines/${medicineId}/stock`, { stock: newStock });
      toast.success("Stock updated successfully");
      fetchMedicines();
      fetchLowStockMedicines();
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      await api.patch(`/orders/admin/${orderId}/status`, { status: newStatus });
      toast.success("Order status updated");
      fetchAllOrders(); // Refresh orders
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Predefined categories
  const categories = [
    "Pain Relief",
    "Antibiotic",
    "Vitamin",
    "Anti-inflammatory",
    "Anti-allergy",
    "Heart Care",
    "General",
  ];

  // Access control
  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2">Admin privileges required</p>
        </div>
      </div>
    );
  }

  // Orders Management Component
  const OrdersManagementSection = () => {
    const getStatusColor = (status) => {
      switch (status) {
        case "Pending":
          return "bg-yellow-100 text-yellow-800";
        case "Processing":
          return "bg-blue-100 text-blue-800";
        case "Shipped":
          return "bg-purple-100 text-purple-800";
        case "Delivered":
          return "bg-green-100 text-green-800";
        case "Cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    if (ordersLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            Manage Orders ({orders.length})
          </h2>
          <button
            onClick={fetchAllOrders}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border-b font-medium">
                    Order ID
                  </th>
                  <th className="text-left p-3 border-b font-medium">
                    Customer
                  </th>
                  <th className="text-left p-3 border-b font-medium">Date</th>
                  <th className="text-left p-3 border-b font-medium">Items</th>
                  <th className="text-left p-3 border-b font-medium">Total</th>
                  <th className="text-left p-3 border-b font-medium">Status</th>
                  <th className="text-left p-3 border-b font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">
                      <div className="font-mono text-sm">
                        #{order._id.slice(-8).toUpperCase()}
                      </div>
                    </td>
                    <td className="p-3 border-b">
                      {order.user ? (
                        <div>
                          <p className="font-medium">{order.user.name}</p>
                          <p className="text-sm text-gray-600">
                            {order.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-500">User not found</span>
                      )}
                    </td>
                    <td className="p-3 border-b text-sm">
                      {formatDate(order.date)}
                    </td>
                    <td className="p-3 border-b">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                        {order.items?.length || 0} items
                      </span>
                    </td>
                    <td className="p-3 border-b font-medium">
                      ₹{order.total?.toLocaleString()}
                    </td>
                    <td className="p-3 border-b">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 border-b">
                      <div className="flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          disabled={updatingStatus === order._id}
                          className="border rounded px-2 py-1 text-sm disabled:opacity-50"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        {updatingStatus === order._id && (
                          <span className="text-xs text-gray-500">
                            Updating...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  // Low Stock Section Component
  const LowStockSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Low Stock Alerts ({lowStockMedicines.length})
        </h2>
        <button
          onClick={() => setStockUpdateMode(!stockUpdateMode)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {stockUpdateMode ? "Exit Update Mode" : "Quick Stock Update"}
        </button>
      </div>

      {lowStockMedicines.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          ✅ All medicines have sufficient stock
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border-b font-medium">Medicine</th>
                <th className="text-left p-3 border-b font-medium">
                  Current Stock
                </th>
                <th className="text-left p-3 border-b font-medium">Status</th>
                <th className="text-left p-3 border-b font-medium">
                  Update Stock
                </th>
              </tr>
            </thead>
            <tbody>
              {lowStockMedicines.map((medicine) => (
                <tr key={medicine._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    <div className="flex items-center">
                      <img
                        src={medicine.image || ""}
                        alt={medicine.name}
                        className="w-10 h-10 rounded mr-3 object-cover"
                      />
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          {medicine.manufacturer}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-3 py-1 rounded-full font-semibold ${
                        medicine.stock < 5
                          ? "bg-red-100 text-red-800"
                          : medicine.stock < 20
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {medicine.stock} units
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    {medicine.stock < 5 ? (
                      <span className="text-red-600 font-semibold">
                        ⚠️ Critical
                      </span>
                    ) : medicine.stock < 20 ? (
                      <span className="text-yellow-600 font-semibold">
                        ⚠️ Low
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        ⚠️ Warning
                      </span>
                    )}
                  </td>
                  <td className="p-3 border-b"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // Medicines List Section Component
  const MedicinesListSection = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Medicines</h2>
        <span className="text-gray-600">{medicines.length} medicines</span>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading medicines...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No medicines found. Add your first medicine above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 border-b font-medium">Medicine</th>
                <th className="text-left p-3 border-b font-medium">Price</th>
                <th className="text-left p-3 border-b font-medium">Category</th>
                <th className="text-left p-3 border-b font-medium">Stock</th>
                <th className="text-left p-3 border-b font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((medicine) => (
                <tr key={medicine._id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    <div className="flex items-center">
                      <img
                        src={
                          medicine.image ||
                          `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%23e5e7eb"/></svg>`
                        }
                        alt={medicine.name}
                        className="w-10 h-10 rounded mr-3 object-cover"
                      />
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-gray-600">
                          {medicine.manufacturer}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b">₹{medicine.price}</td>
                  <td className="p-3 border-b">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {medicine.category || "General"}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        medicine.stock > 50
                          ? "bg-green-100 text-green-800"
                          : medicine.stock > 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {medicine.stock} units
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(medicine)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium hover:bg-blue-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(medicine._id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-red-200 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
      <p className="text-gray-600 mb-8">Manage medicines and orders</p>

      {/* Tabs Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "medicines"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("medicines")}
        >
          Medicines
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "orders"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "low-stock"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
          onClick={() => setActiveTab("low-stock")}
        >
          Low Stock
        </button>
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === "medicines" && (
        <>
          {/* Add/Edit Medicine Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? "Edit Medicine" : "Add New Medicine"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Medicine name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    name="dosage"
                    value={formData.dosage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 500mg Tablet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Manufacturer *
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Quantity"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Medicine description..."
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editingId ? "Updating..." : "Adding..."}
                    </span>
                  ) : editingId ? (
                    "Update Medicine"
                  ) : (
                    "Add Medicine"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <MedicinesListSection />
        </>
      )}

      {activeTab === "orders" && <OrdersManagementSection />}

      {activeTab === "low-stock" && <LowStockSection />}
    </div>
  );
};

export default AdminPanel;
