import React from 'react';
import { signOut } from 'firebase/auth'; // Firebase auth sign-out function
import { firebase } from '../Firebase/config'; // Firebase config where your auth instance is exported
import { FaTimes, FaSignOutAlt } from 'react-icons/fa'; // Importing cross and logout icons from react-icons/fa
import { useRouter } from 'next/router'; // Import useRouter from next/router

const User = ({ toggleUserSidebar, userData }) => {
    const router = useRouter(); // For navigation after logout

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await signOut(firebase.auth());
            console.log("User logged out successfully");
            router.push('/Signin'); // Redirecting to login page after logout
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 flex flex-col">
            {/* Cross Icon for closing sidebar */}
            <div className="flex justify-end">
                <FaTimes 
                    onClick={toggleUserSidebar} 
                    className="text-red-600 cursor-pointer text-2xl" 
                />
            </div>

            <div className="flex items-center justify-center flex-col mt-8">
                {/* Circle Logo with First Letter */}
                <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center text-3xl font-semibold">
                    {userData.name.charAt(0)}
                </div>

                <h2 className="mt-4 text-xl font-semibold text-gray-800">Hello, {userData.name}</h2>
                <p className="text-sm text-gray-600">{userData.email}</p>
            </div>

            {/* Orders and Profile Section */}
            <div className="mt-6">
                <button className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md">
                    <a href='/orders' >
                    View Orders
                    </a>
                </button>

                <button className="w-full py-2 mt-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md">
                    Edit Profile
                </button>
            </div>

            {/* Logout Button with Icon */}
            <div className="mt-8 flex-grow">
                <button
                    onClick={handleLogout}
                    className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md flex items-center justify-center"
                >
                    <FaSignOutAlt className="mr-2 text-lg" /> {/* Logout icon */}
                    Logout
                </button>
            </div>
        </div>
    );
};

export default User;
