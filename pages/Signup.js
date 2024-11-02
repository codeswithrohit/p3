import React, { useState } from 'react';
import { firebase } from '../Firebase/config';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router'; 
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setIsRegistering(true);  // Show "Registering..." state

    try {
      // Sign up user with Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Add user data to Firestore (users collection)
      await firebase.firestore().collection('users').doc(user.uid).set({
        name: name,
        email: email,
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      toast.success('Signup successful!', );
      router.push('/');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use!');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsRegistering(false);  // Reset state after operation
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      // Check if the user already exists in Firestore
      const userRef = firebase.firestore().collection('users').doc(user.uid);
      const doc = await userRef.get();

      if (!doc.exists) {
        // Add user to Firestore if not present
        await userRef.set({
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }

      toast.success('Google Signup successful!',);
      router.push('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="font-[sans-serif] bg-white flex items-center justify-center min-h-screen p-4">
      <div className="w-full  mx-auto">
        
        <div className="bg-white w-full p-8 shadow-lg rounded-md overflow-hidden">
        <h3 className="text-gray-800 text-4xl font-bold text-center mb-4">Item</h3>
          {/* Google Sign In */}
          <div className="mb-8">
            <h3 className="text-gray-800 text-2xl font-bold text-center mb-4">Register Your Account</h3>
            <button
              onClick={handleGoogleSignup}
              type="button"
              className="w-full px-5 py-3 flex items-center justify-center rounded-md text-white text-base tracking-wider font-semibold bg-red-600 hover:bg-red-700"
            >
              <FaGoogle className="mr-4" /> Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8 flex items-center justify-center">
            <div className="w-full border-t border-gray-300"></div>
            <span className="absolute px-4 text-sm text-gray-500 bg-white">or</span>
            <div className="w-full border-t border-gray-300"></div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={handleSignup}>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 py-2.5 rounded-md outline-blue-500"
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 pr-10 py-2.5 rounded-md outline-blue-500"
                  placeholder="Enter password"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>
            <div>
              <label className="text-gray-800 text-sm mb-2 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border border-gray-300 w-full text-sm text-gray-800 pl-4 pr-10 py-2.5 rounded-md outline-blue-500"
                  placeholder="Confirm password"
                />
                <span
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3 cursor-pointer"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {/* <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
              />
              <label htmlFor="terms" className="text-gray-800 ml-3 block text-sm">
                I accept the{' '}
                <a href="#" className="text-blue-600 font-semibold hover:underline ml-1">
                  Terms and Conditions
                </a>
              </label>
            </div> */}

            <button
              type="submit"
              className="w-full px-5 py-3 rounded-md text-white text-base tracking-wider font-semibold border-none outline-none bg-blue-600 hover:bg-blue-700"
              disabled={isRegistering}
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </form>
          <p class="text-gray-800 text-sm mt-6 text-center">Already have an account? <a href="/Sigin" class="text-blue-600 font-semibold hover:underline ml-1">Signin here</a></p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
