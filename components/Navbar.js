import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaUserCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';
import { RiLoginCircleFill } from "react-icons/ri";
import { MdDarkMode, MdLightMode } from "react-icons/md"; // Dark and Light mode icons
import CartComponent from './Cart';
import UserComponent from './User';
import { firebase } from '../Firebase/config';
import { useRouter } from 'next/router';
const db = firebase.firestore();
const storage = firebase.storage();
const Navbar = ({ cart, updateCartQuantity }) => {
  const cartlength = cart.length;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isUserSidebarOpen, setIsUserSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const toggleUserSidebar = () => {
    setIsUserSidebarOpen(!isUserSidebarOpen);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode); // Toggle between dark and light modes
  };

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          setUserData(doc.data());
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);



  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await db.collection("Product").get();
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    
    } catch (error) {
      console.error("Error fetching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  const searchProducts = (query) => {
    if (!query) {
      setFilteredProducts([]);
      return;
    }
    const lowerQuery = query.toLowerCase();
    const results = products.filter(product =>
      product.itemname?.toLowerCase().includes(lowerQuery) ||
      product.authorname?.toLowerCase().includes(lowerQuery) ||
      product.publication?.toLowerCase().includes(lowerQuery)
    );
    setFilteredProducts(results);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  const handleProductClick = (product) => {
    router.push(`/Product-Details?id=${product.id}`);
  };
  

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search',
        query: { search: searchQuery }
      });
    }
  };
  return (
    <>
      <motion.nav
        className={`fixed top-0 w-full z-50 shadow-md ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Item Name */}
            <a href='/' >
            <div className="flex-shrink-0 flex items-center">
              <span className="ml-3 text-xl font-bold">Item</span>
            </div>
</a>
            {/* Search Box (Hidden on mobile) */}
            <div className="hidden md:flex w-1/2">
          

<form class="w-full mx-auto">   
    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search books, Author, Publishers, ISBN No..." class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required />
        <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
    </div>
</form>

  {filteredProducts.length > 0 && (
                <div className="absolute mt-12 w-96 bg-white shadow-lg rounded-md max-h-48 overflow-y-auto z-50">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                    >
                      {product.itemname} - {product.authorname}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              {/* <button onClick={toggleDarkMode} className="text-xl">
                {darkMode ? <MdLightMode /> : <MdDarkMode />}
              </button> */}

              {/* Cart Icon with Badge */}
              <div className="relative cursor-pointer" onClick={toggleCart}>
                <FaShoppingCart className="text-xl" />
                {cartlength > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                    {cartlength}
                  </span>
                )}
              </div>

              {/* User Icon - Show different icon based on authentication */}
              {isAuthenticated && userData ? (
                <FaUserCheck className="text-xl cursor-pointer" onClick={toggleUserSidebar} />
              ) : (
                <RiLoginCircleFill className="text-xl cursor-pointer" />
              )}

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={toggleMenu}>
                  {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center  md:hidden md:flex w-96 mb-2">
  <div className="relative w-full max-w-md">
  <form onSubmit={handleSearchSubmit} class="w-full mx-auto">   
    <label for="default-search" class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
    <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
        </div>
        <input type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search books, Author, Publishers, ISBN No..." class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"  required />
        <button type="submit" class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
    </div>
</form>
    {filteredProducts.length > 0 && (
      <div className="absolute mt-2 w-full bg-white shadow-lg rounded-md max-h-48 overflow-y-auto z-50">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => handleProductClick(product)}
            className="px-4 py-2 cursor-pointer hover:bg-gray-200"
          >
            {product.itemname} - {product.authorname}
          </div>
        ))}
      </div>
    )}
  </div>
</div>


        
          {isOpen && (
          <div>
            </div>
          )}
        </div>
      </motion.nav>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <motion.div
          className={`fixed top-0 right-0 w-96 h-full shadow-lg z-50 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <CartComponent toggleCart={toggleCart} cart={cart} updateCartQuantity={updateCartQuantity} />
        </motion.div>
      )}

      {/* User Sidebar */}
      {isUserSidebarOpen && (
        <motion.div
          className={`fixed top-0 left-0 w-80 h-full shadow-lg z-50 ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
        >
          <UserComponent userData={userData} toggleUserSidebar={toggleUserSidebar} />
        </motion.div>
      )}
    </>
  );
};

export default Navbar;
