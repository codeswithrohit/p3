import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { MdRemove, MdAdd } from 'react-icons/md';
import { useRouter } from 'next/router';
const Cart = ({ toggleCart, cart, updateCartQuantity }) => {
  const router = useRouter();
  const handleCheckout = () => {
    // Navigate to checkout page with cart details and subtotal
    router.push({
      pathname: '/checkout',
      query: { cart: JSON.stringify(cart), subtotal: subtotal.toFixed(2) }
    });
  };


  // Calculate the subtotal
  const subtotal = cart.reduce((acc, item) => acc + (item.sellingprice * item.quantity), 0);

  return (
    <div className="fixed inset-0 w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)] font-sans">
      <div className="w-full  bg-white shadow-lg relative ml-auto h-screen rounded-lg overflow-hidden">
        <div className="overflow-auto p-6 h-[calc(100vh-135px)]">
          {/* Cart Header */}
          <div className="flex items-center justify-between gap-4 text-gray-800 border-b pb-4">
            <h3 className="text-2xl font-bold flex-1">Shopping Cart</h3>
            <FaTimes
              className="w-6 h-6 cursor-pointer text-gray-600 hover:text-red-500 transition-transform transform hover:scale-125"
              onClick={toggleCart}
            />
          </div>

          {/* Cart Items */}
          {cart.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-center text-gray-500 text-lg">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4 mt-12">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-3 items-start gap-4 border-b pb-4">
                  {/* Item Image */}
                  <div className="col-span-2 flex items-start gap-4">
                    <div className="w-28 h-28 max-sm:w-24 max-sm:h-24 shrink-0 bg-gray-100 p-2 rounded-md">
                      <img  src={item.images[0]} alt={item.itemname} className="w-full h-full object-contain" />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-col">
                      <h3 className="text-xs max-sm:text-sm font-bold text-gray-800">{item.itemname}</h3>
                    </div>
                  </div>

                  {/* Item Price & Quantity Controls */}
                  <div className="ml-auto flex flex-col items-end">
                  <h4 className="text-lg max-sm:text-base font-bold text-gray-800">
  ₹{Number(item.sellingprice || 0).toFixed(2)}
</h4>


                    <div className="mt-6 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="px-3 py-1 border border-gray-300 text-gray-800 text-xs outline-none bg-transparent rounded-full hover:bg-gray-100 transition ease-in-out duration-150"
                      >
                        <MdRemove className="w-4 h-4" />
                      </button>
                      <span className="mx-3 font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="px-3 py-1 border border-gray-300 text-gray-800 text-xs outline-none bg-transparent rounded-full hover:bg-gray-100 transition ease-in-out duration-150"
                      >
                        <MdAdd className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Cart Summary */}
              <div className="absolute bottom-0 w-full border-t bg-white px-12 py-4">
                <ul className="text-gray-800 divide-y">
                  <li className="flex justify-between text-lg font-bold">Subtotal <span className="ml-auto">₹{subtotal.toFixed(2)}</span></li>
                </ul>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="mt-6 text-sm font-semibold px-6 py-3 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg tracking-wide transition ease-in-out duration-150 transform hover:scale-105"
                >
                  Make Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
