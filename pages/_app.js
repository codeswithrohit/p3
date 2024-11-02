import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from 'react';
import { firebase } from '../Firebase/config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { useRouter } from "next/router"; // Import useRouter

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const router = useRouter(); // Initialize useRouter

  const db = getFirestore();

  // Monitor authentication state
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadCart(currentUser.uid); // Load cart if user is authenticated
      } else {
        setUser(null);
        setCart([]);
      }
    });
  }, []);

  // Load cart from Firestore
  const loadCart = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setCart(docSnap.data().cart || []);
    }
  };

  // Add item to cart
  const addToCart = async (product) => {
    if (!user) {
      // Redirect to /login if user is not authenticated
      router.push("/Signin");
      return;
    }
    
    const userCartRef = doc(db, "users", user.uid);
    
    // Check if item is already in the cart
    const itemInCart = cart.find((item) => item.id === product.id);
    
    if (itemInCart) {
      // Update quantity if item exists
      const updatedCart = cart.map((item) => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCart(updatedCart);
      await updateDoc(userCartRef, {
        cart: updatedCart
      });
    } else {
      // Add new item to cart
      const newCart = [...cart, { ...product, quantity: 1 }];
      setCart(newCart);
      await updateDoc(userCartRef, {
        cart: arrayUnion({ ...product, quantity: 1 })
      });
    }
  };

  // Update item quantity in cart
  const updateCartQuantity = async (productId, delta) => {
    const userCartRef = doc(db, "users", user.uid);
    
    const updatedCart = cart.map((item) => 
      item.id === productId ? { ...item, quantity: item.quantity + delta } : item
    ).filter(item => item.quantity > 0); // Remove item if quantity goes to 0

    setCart(updatedCart);
    await updateDoc(userCartRef, { cart: updatedCart });
  };

  const isAdminRoute = router.pathname.startsWith("/Admin");

  return (
    <>
        {!isAdminRoute && <Navbar cart={cart} updateCartQuantity={updateCartQuantity} />}
      <Component 
        {...pageProps} 
        addToCart={addToCart}
        cart={cart} 
        updateCartQuantity={updateCartQuantity} 
      />
   {!isAdminRoute && <Footer />}
    </>
  );
}
