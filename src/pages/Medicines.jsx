import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import MedicineCard from "../components/MedicineCard";
import api from "../services/api";

const Medicines = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [medLoading, setMedLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef(null);

  // Define categories
  const categories = [
    "All",
    "Pain Relief",
    "Antibiotic",
    "Vitamin",
    "Anti-inflammatory",
    "Anti-allergy",
    "Heart Care",
    "General",
  ];

  // Redirect if not authenticated after loading
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Fetch medicines from API
  const fetchMedicines = useCallback(
    async (searchTerm = "", category = "All") => {
      try {
        setMedLoading(true);
        setError("");

        // Build query parameters
        const params = {};
        if (searchTerm && searchTerm.trim() !== "") {
          params.q = searchTerm.trim();
        }
        if (category && category !== "All") {
          params.category = category;
        }

        const res = await api.get("/medicines", {
          params,
        });

        if (res.data && Array.isArray(res.data)) {
          // Transform data
          const medicinesWithDefaults = res.data.map((medicine) => ({
            _id: medicine._id,
            id: medicine._id,
            name: medicine.name,
            price: medicine.price,
            dosage: medicine.dosage || "Not specified",
            manufacturer: medicine.manufacturer || "Generic",
            description: medicine.description || "",
            image: medicine.image || "",
            category: medicine.category || "General",
            expiryDate: medicine.expiryDate,
            stock: medicine.stock || 100,
          }));

          setMedicines(medicinesWithDefaults);
          setFilteredMedicines(medicinesWithDefaults);
        } else {
          console.error("API response is not an array:", res.data);
          setError("Invalid data received from server");
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setError("Failed to load medicines. Please try again.");
      } finally {
        setMedLoading(false);
      }
    },
    []
  );

  // Fetch all medicines
  useEffect(() => {
    if (user) {
      fetchMedicines("", "All");
    } else {
      setMedicines([]);
      setFilteredMedicines([]);
      setMedLoading(false);
    }
  }, [user]); // Only run when user changes

  // Debounced search handler
  const handleSearchChange = (value) => {
    setSearchInput(value); // Update the input field immediately

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debouncing (500ms delay)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value); // Update the actual search state after delay
    }, 500); // 500ms delay
  };

  // Fetch when search or category changes
  useEffect(() => {
    if (user) {
      fetchMedicines(search, selectedCategory);
    }
  }, [search, selectedCategory, user]); // Run when search or category changes

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center md:text-left">
        Available Medicines ({medicines.length} available)
      </h1>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-lg">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search medicines by name, description, or manufacturer..."
              className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={searchInput} // Use separate input state
              onChange={(e) => {
                const value = e.target.value;
                handleSearchChange(value); // Use debounced handler
              }}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch(""); // Clear both states
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {search && (
              <p>
                Showing results for: "
                <span className="font-semibold">{search}</span>"
              </p>
            )}
            {medLoading && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                <span>Searching...</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Filter by Category:
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Active filters info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing{" "}
            <span className="font-bold">{filteredMedicines.length}</span> of{" "}
            <span className="font-bold">{medicines.length}</span> medicines
            {selectedCategory !== "All" && (
              <span className="ml-2">
                in{" "}
                <span className="font-semibold text-blue-600">
                  {selectedCategory}
                </span>
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setSelectedCategory("All");
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
            }}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {/* Loading state */}
      {medLoading && filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medicines...</p>
        </div>
      )}

      {/* Error state */}
      {error && !medLoading && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => fetchMedicines(search, selectedCategory)}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Medicines grid */}
      {!medLoading && filteredMedicines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedicines.map((med) => (
            <MedicineCard key={med._id} medicine={med} />
          ))}
        </div>
      ) : !medLoading && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {search || selectedCategory !== "All"
              ? "No medicines match your search"
              : "No medicines available"}
          </h3>
          <p className="text-gray-500 mb-6">
            {search || selectedCategory !== "All"
              ? `No results for "${search}"${
                  selectedCategory !== "All" ? ` in ${selectedCategory}` : ""
                }`
              : "Check back later or contact support"}
          </p>
          <div className="flex gap-4 justify-center">
            {(search || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setSelectedCategory("All");
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Clear filters
              </button>
            )}
            {!search && selectedCategory === "All" && (
              <button
                onClick={() => fetchMedicines("", "All")}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Reload Medicines
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Medicines;
