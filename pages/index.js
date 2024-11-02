import HomeProduct from '@/components/HomeProduct';
import HomeSlider from '@/components/HomeSlider';
import React, { useState, useEffect } from 'react';
import { firebase } from '../Firebase/config';
import { FiLoader } from 'react-icons/fi'; // Importing the loader icon
import { toast } from 'react-toastify'; // Import toast for error messages
import 'react-toastify/dist/ReactToastify.css';

const db = firebase.firestore();
const storage = firebase.storage();

const Index = ({ addToCart, cart, updateCartQuantity }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Assuming there’s a search term

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await db.collection("Product").get();
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setFilteredProducts(
        productList.filter(product =>
          product.itemname.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } catch (error) {
      toast.error("Error fetching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className='min-h-screen bg-white'>
       {loading ? (
        <div className="flex justify-center items-center h-96">
          <FiLoader className="animate-spin text-4xl text-blue-500" /> {/* Spinner Icon */}
        </div>
      ) : (
      <>
      <HomeSlider />
      <HomeProduct product={products} addToCart={addToCart} cart={cart} updateCartQuantity={updateCartQuantity} /></>
      )}
    </div>
  );
};

export default Index;
