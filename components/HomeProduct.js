import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiMinus, FiEye, FiX } from 'react-icons/fi';
import 'tailwindcss/tailwind.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomeProduct = ({ addToCart, cart = [], updateCartQuantity, product }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.itemname} added to the cart!`, { position: 'top-right' });
  };

  const handleQuickView = (product) => {
    setSelectedProduct(product);
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
  };

  const handleImageClick = (image) => {
    setSelectedProduct({ ...selectedProduct, selectedImage: image });
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const getDescription = () => {
    if (!selectedProduct) return '';
    return isDescriptionExpanded
      ? selectedProduct.description
      : `${selectedProduct.description.slice(0, 100)}...`;
  };

  return (
    <div className={`container mx-auto p-4 ${isDarkMode ? 'dark' : ''}`}>
      <ToastContainer />

      {/* Quick View Modal */}
      {showQuickView && selectedProduct && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white dark:bg-gray-800 p-4 overflow-y-auto rounded-lg shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-3xl text-red-500"
              onClick={closeQuickView}
            >
              <FiX />
            </button>
            <div className="flex flex-col items-center">
              <img
                src={selectedProduct.selectedImage || selectedProduct.images[0]}
                alt={selectedProduct.itemname}
                className="rounded-lg object-contain w-full h-64"
              />
              <div className="flex space-x-2 mt-4">
                {selectedProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`product image ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                    onClick={() => handleImageClick(image)}
                  />
                ))}
              </div>
              <div className="mt-4 max-h-96 overflow-y-auto">
                <h2 className="text-xl font-semibold dark:text-white">{selectedProduct.itemname}</h2>
                <p className="text-lg text-gray-700 dark:text-gray-300">₹{selectedProduct.sellingprice}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through">₹{selectedProduct.mrp}</p>
                <p className="mt-2 dark:text-gray-200">
                  {getDescription()}
                  <button
                    onClick={toggleDescription}
                    className="text-blue-500 ml-2 underline"
                  >
                    {isDescriptionExpanded ? 'View Less' : 'View More'}
                  </button>
                </p>
                <p className="mt-2 dark:text-gray-300"><strong>Author:</strong> {selectedProduct.authorname}</p>
                <p className="dark:text-gray-300"><strong>Publication:</strong> {selectedProduct.publication}</p>

                <div className="flex flex-row gap-16 mt-4">
                  <div className="flex items-center">
                    {cart.some(item => item.id === selectedProduct.id) ? (
                      <div className="flex items-center">
                        <motion.button
                          className="text-white bg-red-500 p-2 rounded-full shadow-lg hover:bg-red-600"
                          onClick={() => updateCartQuantity(selectedProduct.id, -1)}
                        >
                          <FiMinus className="text-2xl" />
                        </motion.button>
                        <span className="mx-2 dark:text-gray-200">
                          {cart.find(item => item.id === selectedProduct.id)?.quantity || 0}
                        </span>
                        <motion.button
                          className="text-white bg-blue-500 p-2 rounded-full shadow-lg hover:bg-blue-600"
                          onClick={() => updateCartQuantity(selectedProduct.id, 1)}
                        >
                          <FiPlus className="text-2xl" />
                        </motion.button>
                      </div>
                    ) : (
                      <button onClick={() => handleAddToCart(selectedProduct)} className="flex items-center font-medium text-white bg-gradient-to-b from-green-600 to-green-400 px-4 py-2 rounded-full shadow-[0_0.7em_1.5em_-0.5em_rgba(20,167,62,0.6)] transition-shadow hover:shadow-[0_0.5em_1.5em_-0.5em_rgba(20,167,62,0.6)] active:shadow-[0_0.3em_1em_-0.5em_rgba(20,167,62,0.6)]">
                      <svg
                        height="24"
                        width="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="currentColor"></path>
                      </svg>
                      <span>Add To Cart </span>
                    </button>
                    )}
                  </div>
                  <a
                    className="flex items-center font-medium text-white bg-gradient-to-b from-green-600 to-green-400 px-4 py-2 rounded-full shadow-[0_0.7em_1.5em_-0.5em_rgba(20,167,62,0.6)] transition-shadow hover:shadow-[0_0.5em_1.5em_-0.5em_rgba(20,167,62,0.6)] active:shadow-[0_0.3em_1em_-0.5em_rgba(20,167,62,0.6)]"
                    href={`/Product-Details?id=${selectedProduct.id}`}
                  >
                    View Product Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {product.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id);

          return (
            <motion.div
              key={product.id}
              className={`${
                isDarkMode ? 'bg-gray-800  text-white' : 'bg-white text-black'
              } flex flex-row border-2 w-48 rounded-lg shadow-lg hover:shadow-xl transition-transform transform hover:scale-105`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col  items-center p-4 relative">
                {/* Image Section */}
                <div className="w-36 h-36 flex items-center justify-center overflow-hidden rounded-lg relative">
                  <img
                    src={product.images[0]}
                    alt={product.itemname}
                    className="rounded-lg object-contain w-full h-full transition-all transform hover:scale-110"
                  />
                </div>
                <a href={`/Product-Details?id=${product.id}`}>
                  <div>
                    <h2 className="text-sm font-bold text-center text-gray-800 dark:text-gray-200">{product.itemname}</h2>
                    <div className="flex items-center justify-center space-x-3 mt-2">
  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">₹{product.sellingprice}</p>
  <p className="text-md text-red-500 font-bold line-through">₹{product.mrp}</p>
</div>

                  </div>
                </a>
                {/* Quick View button */}
            

                <div className="flex justify-between ">
                  {cartItem ? (
                    <div className="flex items-center">
                      <motion.button
                        className="text-white bg-red-500 p-2 rounded-full shadow-lg hover:bg-red-600"
                        onClick={() => updateCartQuantity(product.id, -1)}
                      >
                        <FiMinus className="text-2xl" />
                      </motion.button>
                      <span className="mx-2">{cartItem.quantity}</span>
                      <motion.button
                        className="text-white bg-blue-500 p-2 rounded-full shadow-lg hover:bg-blue-600"
                        onClick={() => updateCartQuantity(product.id, 1)}
                      >
                        <FiPlus className="text-2xl" />
                      </motion.button>
                    </div>
                  ) : (
                  
                      <button onClick={() => handleAddToCart(product)} className="flex w-40 items-center font-medium text-white bg-gradient-to-b from-green-600 to-green-400 px-4 py-2 rounded-full shadow-[0_0.7em_1.5em_-0.5em_rgba(20,167,62,0.6)] transition-shadow hover:shadow-[0_0.5em_1.5em_-0.5em_rgba(20,167,62,0.6)] active:shadow-[0_0.3em_1em_-0.5em_rgba(20,167,62,0.6)]">
                      <svg
                        height="24"
                        width="24"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mr-2"
                      >
                        <path d="M0 0h24v24H0z" fill="none"></path>
                        <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" fill="currentColor"></path>
                      </svg>
                      <span className='font-bold' >Add To Cart </span>
                    </button>
                  )}
                  {/* <a
                    className="bg-green-500 text-white py-3 px-6 hover:bg-green-600 text-lg"
                    href={`/Product-Details?id=${product.id}`}
                  >
                    View Details
                  </a> */}
                </div>
                <motion.button
  className="flex items-center mt-2 justify-center font-bold w-40 text-center text-white bg-gradient-to-b from-green-600 to-green-400 px-4 py-2 rounded-full shadow-[0_0.7em_1.5em_-0.5em_rgba(20,167,62,0.6)] transition-shadow hover:shadow-[0_0.5em_1.5em_-0.5em_rgba(20,167,62,0.6)] active:shadow-[0_0.3em_1em_-0.5em_rgba(20,167,62,0.6)]"
  onClick={() => handleQuickView(product)}
>
  Quick View
</motion.button>
              </div>

             
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeProduct;
