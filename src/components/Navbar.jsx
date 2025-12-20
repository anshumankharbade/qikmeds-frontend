import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { cart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle menu open and close animation
  const closeMenu = () => {
    setIsClosing(true);

    // Clear any existing timeout
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // Wait for animation to complete before removing from DOM
    closeTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
    }, 300); // Match this with CSS animation duration
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !e.target.closest(".menu-toggle")
      ) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isMenuOpen]);

  // Handle link clicks in mobile menu
  const handleMobileLinkClick = () => {
    closeMenu();
  };

  const cartTotalItems = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <>
      <nav className="w-full bg-white shadow-md py-3 md:py-4 px-4 md:px-6 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          {/* left - logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-1"
          >
            <img src="/logo.png" alt="QikMeds Logo" className="w-9 h-10 pt-1" />
            <span>QikMeds</span>
          </Link>

          {/* Center — navigation (Desktop) */}
          <div className="hidden md:flex gap-8 text-lg font-medium">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 group"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">
                Home
              </span>
            </Link>

            <Link
              to="/medicines"
              className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 group"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">
                Medicines
              </span>
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 group"
                >
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Orders
                  </span>
                </Link>

                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-blue-600 transition flex items-center gap-2 group"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      Admin
                    </span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right — Auth and cart */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Cart Icon - Always visible if logged in */}
            {user && (
              <Link
                to="/cart"
                className="relative p-2 hover:bg-blue-50 rounded-full transition group"
                aria-label="Shopping Cart"
              >
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-gray-700 group-hover:text-blue-600 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

                {cartTotalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-pulse">
                    {cartTotalItems > 9 ? "9+" : cartTotalItems}
                  </span>
                )}
              </Link>
            )}

            {/* User greeting (Desktop) */}
            {user ? (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-700 hidden lg:inline">
                    Hi, {user.name.split(" ")[0]}
                  </span>
                </div>

                <button
                  onClick={() => {
                    logout();
                    toast.success("Logged out successfully");
                  }}
                  className="text-gray-600 hover:text-red-600 font-medium transition flex items-center gap-2 group"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Logout
                  </span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-2 group"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    Login
                  </span>
                </Link>

                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm hover:shadow"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="menu-toggle md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => {
                if (isMenuOpen) {
                  closeMenu();
                } else {
                  setIsMenuOpen(true);
                }
              }}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {(isMenuOpen || isClosing) && isMobile && (
        <div className="mobile-menu fixed inset-0 z-50 md:hidden">
          {/* Backdrop with fade animation */}
          <div
            className={`absolute inset-0 bg-black transition-opacity duration-300 ${
              isClosing ? "opacity-0" : "opacity-50"
            }`}
            onClick={closeMenu}
          />

          {/* Side menu with slide animation */}
          <div
            ref={menuRef}
            className={`absolute right-0 top-0 h-full w-64 sm:w-72 bg-white shadow-xl transform transition-transform duration-300 ${
              isClosing ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              {/* Mobile menu header*/}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  {user && (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {user ? user.name.split(" ")[0] : "Welcome"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {user ? user.email : "Guest User"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeMenu}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile navigation links */}
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <Link
                    to="/"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-gray-700"
                    onClick={handleMobileLinkClick}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    to="/medicines"
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-gray-700"
                    onClick={handleMobileLinkClick}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                      />
                    </svg>
                    <span className="font-medium">Medicines</span>
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/cart"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-gray-700"
                        onClick={handleMobileLinkClick}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="font-medium">Cart</span>
                        {cartTotalItems > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-6 text-center">
                            {cartTotalItems}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-gray-700"
                        onClick={handleMobileLinkClick}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <span className="font-medium">Orders</span>
                      </Link>

                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition text-gray-700"
                          onClick={handleMobileLinkClick}
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                      )}
                    </>
                  )}
                </div>

                {/* Auth buttons for mobile */}
                <div className="mt-auto pt-8">
                  {user ? (
                    <button
                      onClick={() => {
                        logout();
                        handleMobileLinkClick();
                      }}
                      className="flex items-center justify-center gap-3 p-3 rounded-lg hover:bg-red-50 transition text-red-600 w-full border border-red-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        to="/login"
                        className="block text-center py-3 px-4 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition"
                        onClick={handleMobileLinkClick}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block text-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        onClick={handleMobileLinkClick}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* mobile menu footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  © {new Date().getFullYear()} QikMeds. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
