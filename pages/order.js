import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { firebase } from '../Firebase/config';
import { format } from 'date-fns'; // For formatting dates
import { FiLoader } from 'react-icons/fi';
const Order = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const db = firebase.firestore();
        const bookingRef = db.collection('Orders').where('orderId', '==', orderId);
        const snapshot = await bookingRef.get();

        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }

        snapshot.forEach((doc) => {
          setData(doc.data());
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [orderId]);
console.log("data",data)
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return <div>No Order found for orderId: {orderId}</div>;
  }

  // Destructure the data object to extract necessary details
  const { cart, user, subtotal, paymentMethod, orderId: id, createdAt,qrcodeUrl } = data;
  
  // Format the order date and calculate delivery date (assuming 2 days later)
  const orderDate = new Date(createdAt.seconds * 1000); // Convert Firestore timestamp to JS Date
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(orderDate.getDate() + 2); // Add 2 days for delivery

  return (
    <div className='min-h-screen' >
      <section className="py-24 relative">
     
        <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
            <div className='flex flex-row' >
            <div>
          <h2 className="font-manrope font-bold text-xl sm:text-xl leading-10 text-black mb-11">Your Order Confirmed</h2>
          <h6 className="font-medium text-xl leading-8 text-black mb-3">Hello, {user.name}</h6>
          <p className="font-normal text-lg leading-8 text-gray-500 mb-11">Your order has been completed and will be delivered on <strong>{format(deliveryDate, 'MMM dd, yyyy')}</strong>.</p>
          </div>
          <div className="absolute top-20 right-4">
        <img src={qrcodeUrl} alt="QR Code" className="w-32 h-32" />
      </div>

      </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 py-6 border-y border-gray-100 mb-6">
            <div className="box group">
              <p className="font-normal text-base leading-7 text-gray-500 mb-3">Delivery Date</p>
              <h6 className="font-semibold font-manrope text-md leading-9 text-black">{format(deliveryDate, 'MMM dd, yyyy')}</h6>
            </div>
            <div className="box group">
              <p className="font-normal text-base leading-7 text-gray-500 mb-3">Order</p>
              <h6 className="font-semibold font-manrope text-md leading-9 text-black">#{id}</h6>
            </div>
            <div className="box group">
              <p className="font-normal text-base leading-7 text-gray-500 mb-3">Payment Method</p>
              <h6 className="font-semibold font-manrope text-md leading-9 text-black">{paymentMethod}</h6>
            </div>
            <div className="box group">
              <p className="font-normal text-base leading-7 text-gray-500 mb-3">Address</p>
              <h6 className="font-semibold font-manrope text-md leading-9 text-black">{user.address},{user.city},{user.state},{user.zipCode} </h6>
            </div>
          </div>

          {/* Cart items */}
          {cart.map((item, index) => (
            <div key={index} className="grid grid-cols-7 w-full py-6 border-b border-gray-100">
             <div className="w-32 h-28 max-lg:w-24 max-lg:h-24 flex p-3 shrink-0 bg-gray-300 rounded-md">
                          <img src={item.images[0]} className="w-full object-contain" />
                        </div>
              <div className="col-span-7 min-[500px]:col-span-5 md:col-span-6 min-[500px]:pl-5 max-sm:mt-5 flex flex-col justify-center">
                <div className="flex flex-col min-[500px]:flex-row min-[500px]:items-center justify-between">
                  <div>
                    <h5 className="font-manrope font-semibold text-2xl leading-9 text-black mb-6">{item.itemname}</h5>
                    <p className="font-normal text-xl leading-8 text-gray-500">Quantity : <span className="text-black font-semibold">{item.quantity}</span></p>
                  </div>
                  <h5 className="font-manrope font-semibold text-3xl leading-10 text-black sm:text-right mt-3">₹{item.sellingprice}</h5>
                </div>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-center sm:justify-end w-full my-6">
            <div className="w-full">
              <div className="flex items-center justify-between mb-6">
                <p className="font-normal text-xl leading-8 text-gray-500">Subtotal</p>
                <p className="font-semibold text-xl leading-8 text-gray-900">₹{data.subtotal}</p>
              </div>
              <div className="flex items-center justify-between py-6 border-y border-gray-100">
                <p className="font-manrope font-semibold text-2xl leading-9 text-gray-900">Total</p>
                <p className="font-manrope font-bold text-2xl leading-9 text-indigo-600">₹{data.subtotal}</p>
              </div>
            </div>
          </div>
          <p className="font-normal text-lg leading-8 text-gray-500 mb-11">We'll send a shipping confirmation email when the items ship successfully.</p>
          <h6 className="font-manrope font-bold text-2xl leading-9 text-black mb-3">Thank you for shopping with us!</h6>
        </div>
      </section>
    </div>
  );
};

export default Order;
