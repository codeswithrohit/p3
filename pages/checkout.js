import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { firebase } from '../Firebase/config';
import { toast, ToastContainer } from 'react-toastify';
import QRCode from 'qrcode';
const Checkout = () => {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('online'); // Default to online payment
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  
  const loadScript = async (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => reject(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    if (router.query.cart && router.query.subtotal) {
      setCart(JSON.parse(router.query.cart));
      setSubtotal(router.query.subtotal);
    }
  }, [router.query]);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = firebase.firestore().collection('users').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
          setUserData(doc.data());
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNameChange = (e) => {
    setUserData({ ...userData, name: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleCompletePurchase = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month is 0-based
      const day = String(currentDate.getDate()).padStart(2, '0');
      const randomNumbers = Math.floor(10000 + Math.random() * 90000); // Generates a random 5-digit number
      const orderId = `ITEM${year}${month}${day}${randomNumbers}`;

      // Validate required fields
      if (!userData.name || !userData.mobileNumber || !userData.address || !userData.city || !userData.state || !userData.zipCode) {
        toast.error('Please fill in all required fields.');
        return;
      }
      const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3000/order?orderId=${orderId}`);
   // Upload QR code image to Firebase Storage
   const storageRef = firebase.storage().ref();
   const qrCodeRef = storageRef.child(`qrcodes/${orderId}.png`);

   const response = await fetch(qrCodeDataUrl);
   const blob = await response.blob();

   const snapshot = await qrCodeRef.put(blob);
   const qrcodeUrl = await snapshot.ref.getDownloadURL();

      if (paymentMethod === 'online') {
        // Load Razorpay SDK
        const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        if (!res) {
          toast.error('Failed to load Razorpay SDK. Please try again later.');
          return;
        }

        // Create Razorpay payment options
        const options = {
          key: 'rzp_test_td8CxckGpxFssp', // Replace with your Razorpay key
          amount: subtotal * 100, // Amount in paise
          currency: 'INR',
          name: 'Your Store Name',
          description: 'Purchase Description',
          handler: async (response) => {
            // Payment successful
            const orderData = {
              cart,
              subtotal,
              paymentMethod: 'Online Payment',
              paymentStatus: 'Done',
              user: { ...userData },
              qrcodeUrl,
              orderId: orderId,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            // Submit order to Firestore
            await firebase.firestore().collection('Orders').add(orderData);
            toast.success(`Order placed successfully! Order ID: ${orderId}`);
            router.push(`/order?orderId=${orderId}`);
          },
          prefill: {
            name: userData.name,
            email: userData.email,
            contact: userData.mobileNumber,
          },
          theme: {
            color: '#F37254',
          },
        };

        // Create and open Razorpay payment object
        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        paymentObject.on('payment.failed', (response) => {
          toast.error(`Payment failed: ${response.error.description}`);
        });
      } else if (paymentMethod === 'cod' || paymentMethod === 'pfs') {
        // Common order data for both Cash on Delivery and Pickup from Shop
        const orderData = {
          cart,
          subtotal,
          paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pickup from shop',
          paymentStatus: 'Pending',
          orderId: orderId,
          qrcodeUrl,
          user: { ...userData },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };

        // Submit order to Firestore
        await firebase.firestore().collection('Orders').add(orderData);
        toast.success(`Order placed successfully! Order ID: ${orderId}`);
        router.push(`/order?orderId=${orderId}`);
      }
    } catch (error) {
      console.error("Error placing order: ", error);
      toast.error("An error occurred while placing the order.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen px-8 py-16 bg-gray-100">
      <div className="font-[sans-serif] bg-white">
        <div className="flex max-sm:flex-col gap-12 max-lg:gap-4 h-full">
          <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 sm:h-screen sm:sticky sm:top-0 lg:min-w-[370px] sm:min-w-[300px]">
            {cart.length === 0 ? (
              <p className="text-gray-500">No items in the cart.</p>
            ) : (
              <div className="relative h-full">
                <div className="px-4 py-8 sm:overflow-auto sm:h-[calc(100vh-60px)]">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-start gap-4">
                        <div className="w-32 h-28 max-lg:w-24 max-lg:h-24 flex p-3 shrink-0 bg-gray-300 rounded-md">
                          <img src={item.images[0]} className="w-full object-contain" />
                        </div>
                        <div className="w-full">
                          <h3 className="text-base text-white">{item.itemname}</h3>
                          <ul className="text-xs text-gray-300 space-y-2 mt-2">
                            <li className="flex flex-wrap gap-4">
                              Price <span className="ml-auto">₹{item.sellingprice}</span>
                            </li>
                            <li className="flex flex-wrap gap-4">
                              Quantity <span className="ml-auto">{item.quantity}</span>
                            </li>
                            <li className="flex flex-wrap gap-4">
                              Total Price <span className="ml-auto">₹{(item.sellingprice * item.quantity).toFixed(2)}</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="md:absolute md:left-0 md:bottom-0 bg-gray-800 w-full p-4">
                  <h4 className="flex flex-wrap gap-4 text-base text-white">
                    Total <span className="ml-auto">₹{subtotal}</span>
                  </h4>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-4xl w-full h-max rounded-md px-4 py-8 sticky top-0">
            <h2 className="text-2xl font-bold text-gray-800">Complete your order</h2>
            <form className="mt-8">
              <div>
                <h3 className="text-base text-gray-800 mb-4">Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={userData.name}
                      onChange={handleNameChange}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={userData.email}
                      readOnly
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Phone No."
                      value={userData.mobileNumber}
                      onChange={(e) => setUserData({ ...userData, mobileNumber: e.target.value })}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-base text-gray-800 mb-4">Shipping Address</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Address Line"
                      value={userData.address}
                      onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="City"
                      value={userData.city}
                      onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="State"
                      value={userData.state}
                      onChange={(e) => setUserData({ ...userData, state: e.target.value })}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={userData.zipCode}
                      onChange={(e) => setUserData({ ...userData, zipCode: e.target.value })}
                      className="px-4 py-3 bg-gray-100 focus:bg-transparent text-gray-800 w-full text-sm rounded-md focus:outline-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-base text-gray-800 mb-4">Payment Method</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={handlePaymentChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-gray-800">Online Payment</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={handlePaymentChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-gray-800">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="pfs"
                      checked={paymentMethod === 'pfs'}
                      onChange={handlePaymentChange}
                      className="form-radio text-blue-600"
                    />
                    <span className="ml-2 text-gray-800">Pickup from Shop</span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompletePurchase}
                className={`mt-8 w-full py-3 text-white bg-blue-600 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default Checkout;
