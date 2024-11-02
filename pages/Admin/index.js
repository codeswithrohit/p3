import React, { useState, useEffect } from 'react';
import { firebase } from '../../Firebase/config';
import AdminNavbar from '../../components/AdminNavbar'
import { FiLoader } from 'react-icons/fi';
const Index = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);  // Pagination state
  const [ordersPerPage] = useState(5);  // Orders per page

  useEffect(() => {
      const fetchBookingDetails = async () => {
          try {
              const db = firebase.firestore();
              const bookingRef = db.collection('Orders').orderBy('createdAt', 'desc'); // Sort by createdAt (latest first)

              const snapshot = await bookingRef.get();

              if (snapshot.empty) {
                  console.log('No matching orders.');
                  setLoading(false);
                  return;
              }

              const orders = [];
              snapshot.forEach((doc) => {
                  const orderData = doc.data();
                  orders.push(orderData);
              });

              setData(orders); // Store all matching orders in state
              setLoading(false);
          } catch (error) {
              console.error('Error fetching booking details:', error);
              setLoading(false);
          }
      };

      fetchBookingDetails();
  }, []);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = data.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
      return (
          <div className="flex justify-center items-center min-h-screen">
              <FiLoader className="animate-spin text-4xl text-blue-500" />
          </div>
      );
  }

  console.log("orders", data); 
  return (
    
    <div className='min-h-screen' >
       <AdminNavbar/>
<div className='lg:ml-64' >
<section>
            <div id="main" class="main-content flex-1 bg-white mt-12 md:mt-2 pb-24 md:pb-5">

                <div class="bg-gray-800 ">
                    <div class=" bg-gradient-to-r from-blue-900 to-gray-800 p-4 shadow text-2xl text-white">
                        <h1 class="font-bold pl-2">Dashboard</h1>
                    </div>
                </div>

                <div class="flex flex-wrap">
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                 
                        <div class="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-green-600"><i class="fa fa-wallet fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">Total Revenue</h2>
                                   <p class="font-bold text-3xl">$3249 <span class="text-green-500"><i class="fas fa-caret-up"></i></span></p>
                                </div>
                            </div>
                        </div>
                
                    </div>
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                  
                        <div class="bg-gradient-to-b from-pink-200 to-pink-100 border-b-4 border-pink-500 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-pink-600"><i class="fas fa-users fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">Total Users</h2>
                                    <p class="font-bold text-3xl">249 <span class="text-pink-500"><i class="fas fa-exchange-alt"></i></span></p>
                                </div>
                            </div>
                        </div>
                   
                    </div>
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                 
                        <div class="bg-gradient-to-b from-yellow-200 to-yellow-100 border-b-4 border-yellow-600 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-yellow-600"><i class="fas fa-user-plus fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">New Users</h2>
                                    <p class="font-bold text-3xl">2 <span class="text-yellow-600"><i class="fas fa-caret-up"></i></span></p>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                        
                        <div class="bg-gradient-to-b from-blue-200 to-blue-100 border-b-4 border-blue-500 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-blue-600"><i class="fas fa-server fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">Server Uptime</h2>
                                    <p class="font-bold text-3xl">152 days</p>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                        
                        <div class="bg-gradient-to-b from-indigo-200 to-indigo-100 border-b-4 border-indigo-500 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-indigo-600"><i class="fas fa-tasks fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">To Do List</h2>
                                    <p class="font-bold text-3xl">7 tasks</p>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                    <div class="w-full md:w-1/2 xl:w-1/3 p-6">
                        
                        <div class="bg-gradient-to-b from-red-200 to-red-100 border-b-4 border-red-500 rounded-lg shadow-xl p-5">
                            <div class="flex flex-row items-center">
                                <div class="flex-shrink pr-4">
                                    <div class="rounded-full p-5 bg-red-600"><i class="fas fa-inbox fa-2x fa-inverse"></i></div>
                                </div>
                                <div class="flex-1 text-right md:text-center">
                                    <h2 class="font-bold uppercase text-gray-600">Issues</h2>
                                    <p class="font-bold text-3xl">3 <span class="text-red-500"><i class="fas fa-caret-up"></i></span></p>
                                </div>
                            </div>
                        </div>
                       
                    </div>
                </div>


              
            </div>
        </section>
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                    <div className="mx-auto max-w-5xl">
                        <div className="gap-4 sm:flex sm:items-center sm:justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">Today orders</h2>
                        </div>
                        {currentOrders.map((order, index) => (
                            <div key={order.orderId} className="mt-6 flow-root sm:mt-8">
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    <div className="flex flex-wrap items-center gap-y-4 py-6">
                                        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Order ID:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                                                <a href="#" className="hover:underline">{order.orderId}</a>
                                            </dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Date:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">{order.createdAt.toDate().toLocaleDateString()}</dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">Price:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">₹{order.subtotal}</dd>
                                        </dl>

                                        <dl className="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
                                            <dt className="text-base font-medium text-gray-500 dark:text-gray-400">User:</dt>
                                            <dd className="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">{order.user?.name}</dd>
                                            <dd className="text-base font-medium text-gray-500 dark:text-gray-400">Mobile: {order.user?.mobileNumber}</dd>
                                        </dl>

                                        {/* <dl class="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
              <dt class="text-base font-medium text-gray-500 dark:text-gray-400">Status:</dt>
              <dd class="me-2 mt-1.5 inline-flex items-center rounded bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                <svg class="me-1 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.5 4h-13m13 16h-13M8 20v-3.333a2 2 0 0 1 .4-1.2L10 12.6a1 1 0 0 0 0-1.2L8.4 8.533a2 2 0 0 1-.4-1.2V4h8v3.333a2 2 0 0 1-.4 1.2L13.957 11.4a1 1 0 0 0 0 1.2l1.643 2.867a2 2 0 0 1 .4 1.2V20H8Z" />
                </svg>
                Pre-order
              </dd>
            </dl> */}

                                        <div className="w-full grid sm:grid-cols-2 lg:flex lg:w-64 lg:items-center lg:justify-end gap-4">
                                            <a href={`/order?orderId=${order.orderId}`} className="w-full inline-flex justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700 lg:w-auto">View details</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <nav className="mt-6 flex items-center justify-center sm:mt-8" aria-label="Page navigation example">
                            <ul className="flex h-8 items-center -space-x-px text-sm">
                                <li>
                                    <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-4 w-4 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 19-7-7 7-7" />
                                        </svg>
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(data.length / ordersPerPage)} className="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                        <span>Next</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
</div>

    </div>
  )
}

export default Index