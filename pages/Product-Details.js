import React, { useState, useEffect } from 'react';
import { firebase } from '../Firebase/config';
import 'firebase/firestore';
import 'firebase/storage';
import { useRouter } from 'next/router';
import { FiLoader } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify'; // Import toast components
import { FaStar,FaTimes } from 'react-icons/fa'; // Star icon for rating
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const ProductDetails = ({addToCart, cart = [], updateCartQuantity, }) => {
  const router = useRouter();
  const [productdata, setProductData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [activeTab, setActiveTab] = useState('Details'); // State for active tab
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false); // Popup state
  const [rating, setRating] = useState(0); // Rating state
  const [reviewMessage, setReviewMessage] = useState(''); // Review message
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission state
  const [reviews, setReviews] = useState([]); // Store reviews
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [ratingCounts, setRatingCounts] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [theme, setTheme] = useState('light'); // Default to light mode

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Fetch user data on auth state change
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
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const db = firebase.firestore();
    const pgRef = db.collection('Product').doc(id);

    pgRef.get().then((doc) => {
      if (doc.exists) {
        const data = { ...doc.data(), id: doc.id };
        setProductData(data);
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
        if (data.reviews) {
          setReviews(data.reviews);
          calculateRatingCounts(data.reviews);
        }
      } else {
        console.log('Document not found!');
      }
      setIsLoading(false);
    });
  }, []);

  const handleReviewSubmit = async () => {
    if (!userData) {
      router.push('/signin'); // Redirect if user data is not available
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      userId: firebase.auth().currentUser.uid,
      userName: userData?.name || 'Anonymous',
      userEmail: userData?.email || 'No Email',
      rating,
      message: reviewMessage,
      date: new Date().toISOString(),
    };

    try {
      const productId = productdata.id;
      const productRef = firebase.firestore().collection('Product').doc(productId);

      await productRef.update({
        reviews: firebase.firestore.FieldValue.arrayUnion(reviewData),
      });

      setReviews([...reviews, reviewData]);
      calculateRatingCounts([...reviews, reviewData]);

      toast.success('Review submitted!', { position: 'top-right' });
      setIsSubmitting(false);
      setShowReviewPopup(false);
    } catch (error) {
      toast.error('Failed to submit review. Please try again.');
      console.log(error);
      setIsSubmitting(false);
    }
  };
const calculateRatingCounts = (reviews) => {
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((review) => {
    counts[review.rating]++;
  });
  setRatingCounts(counts);
};


  // Render star rating component
  const renderStarRating = () => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer ${star <= rating ? 'text-yellow-400 text-2xl' : 'text-gray-300 text-2xl'}`}
            onClick={() => setRating(star)}
          />
        ))}
      </div>
    );
  };

  const renderReviews = () => {
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5);
    return displayedReviews.map((review, index) => (
      <div key={index} className={`p-4 rounded-lg mb-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700'}`}>
        <div className="flex mb-2">
          <span className={`ml-2 font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{review.userName}</span>
          <div className="flex ml-4">
            {[...Array(review.rating)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400" />
            ))}
          </div>
        </div>
        <p className={theme === 'light' ? 'text-black' : 'text-white'}>{review.message}</p>
        <small className={theme === 'light' ? 'text-black' : 'text-white'}>
          {new Date(review.date).toLocaleString()}
        </small>
      </div>
    ));
  };


  const renderRatingCounts = () => {
    return [5, 4, 3, 2, 1].map((star) => (
      <div className="flex items-center mb-1" key={star}>
        <p className={`text-sm font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{star}.0</p>
        <FaStar className="text-yellow-300 ml-1" />
        <div className="bg-gray-400 rounded w-full h-2 ml-3">
          <div
            className="h-full rounded bg-yellow-300"
            style={{ width: `${(ratingCounts[star] / reviews.length) * 100}%` }}
          ></div>
        </div>
        <p className={`text-sm font-semibold ml-3 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
          {ratingCounts[star]}
        </p>
      </div>
    ));
  };


  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.itemname} added to the cart!`, { position: 'top-right' });
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded); // Toggle description view
  };

  const getDescription = () => {
    if (!productdata) return '';
    return isDescriptionExpanded
      ? productdata.description // Show full description if expanded
      : `${productdata.description.slice(0, 100)}...`; // Show truncated description otherwise
  };

  const handleCheckout = () => {
    
  };

console.log("productdata",productdata)
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  const handleImageClick = (image) => {
    setMainImage(image);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Description':
        return            <p className={`mt-2 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
        {getDescription()}
        <button
          onClick={toggleDescription}
          className={`text-blue-500 ml-2 underline ${theme === 'light' ? 'text-blue-500' : 'text-blue-300'}`}
        >
          {isDescriptionExpanded ? 'View Less' : 'View More'}
        </button>
      </p>
;
      case 'Details':
        return    <div className={`grid grid-cols-2 gap-6 text-sm mt-4 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
        <div><strong>Author:</strong> {productdata.authorname}</div>
        <div><strong>Binding:</strong> {productdata.binding}</div>
        <div><strong>Code:</strong> {productdata.code}</div>
        <div><strong>Height:</strong> {productdata.height}</div>
        <div><strong>HSN:</strong> {productdata.hsn}</div>
        <div><strong>ISBN:</strong> {productdata.isbn}</div>
        <div><strong>Weight:</strong> {productdata.itemweight}</div>
        <div><strong>Language:</strong> {productdata.language}</div>
        <div><strong>Length:</strong> {productdata.length}</div>
        <div><strong>Pages:</strong> {productdata.pages}</div>
        <div><strong>Publication:</strong> {productdata.publication}</div>
        <div><strong>Width:</strong> {productdata.width}</div>
      </div>;
      case 'Reviews':
        return <div className='max-h-96 overflow-y-auto' >
          <div class="mt-2 ">
<h3 class="text-xl font-semibold text-white">Reviews({reviews.length})</h3>
<button  onClick={() => setShowReviewPopup(true)} type="button" class="w-full mt-2 px-4 py-2.5 bg-transparent border border-yellow-300 text-yellow-300 font-semibold rounded">Submit reviews</button>
{showReviewPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl mb-4">Submit Review</h2>
        
            <div>
              <label className="block mb-2">Select Rating</label>
              {renderStarRating()}
            </div>
            <div className="mt-4">
              <label className="block mb-2">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded"
                value={userData?.name || ''}
                readOnly
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded"
                value={userData?.email || ''}
                readOnly
              />
            </div>
            <div className="mt-4">
              <label className="block mb-2">Message</label>
              <textarea
                className="w-full px-4 py-2 border rounded"
                value={reviewMessage}
                onChange={(e) => setReviewMessage(e.target.value)}
              />
            </div>
            <div className='flex flex-row gap-4' >
            <button
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded"
              onClick={handleReviewSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => setShowReviewPopup(false)}
            >
             Close
            </button>
            </div>
          </div>
        </div>
      )}

{renderRatingCounts()}
</div>

{renderReviews()}
        {!showAllReviews && reviews.length > 5 && (
          <button
            onClick={() => setShowAllReviews(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Read All Reviews
          </button>
        )}
        </div>
        
        ;
      default:
        return null;
    }
  };

  return (
    <div className={`${theme === 'light' ? 'bg-white text-black' : 'bg-gray-900 text-white'} min-h-screen`}>
    <div className="font-sans tracking-wide max-w-7xl mx-auto py-16">
      <div className="bg-white md:min-h-[600px] grid items-start grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Image Section */}
        <div className="h-96">
          <div className="relative h-full flex items-center justify-center">
            <img
              src={mainImage}
              alt={productdata.itemname}
              className="w-96 h-64 rounded-xl object-contain"
            />
          </div>
          {/* Image Thumbnails */}
          <div className="flex justify-center py-8 space-x-4">
            {productdata.images && productdata.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`w-36 h-36 object-contain rounded cursor-pointer ${image === mainImage ? 'border-2 border-blue-500' : ''}`}
                onClick={() => handleImageClick(image)}
              />
            ))}
          </div>
        </div>

        {/* Product Information Section */}
        <div className="bg-gradient-to-r from-gray-600 via-gray-600 to-gray-700 py-6 px-8 h-full">
          <div>
            <h2 className="text-3xl font-semibold text-white">{productdata.itemname}</h2>
            <p className="text-sm text-gray-400 mt-2">{productdata.publication}</p>
          </div>

          <div className="flex flex-wrap gap-4 justify-between mt-8">
            <h3 className="text-white text-4xl">₹{productdata.sellingprice}</h3>
          </div>
          <div className="flex flex-wrap gap-4 mt-8">
            {/* <button     onClick={handleBuyNow} type="button" className="min-w-[200px] px-4 py-3.5 bg-gray-800 hover:bg-gray-900 text-white text-base rounded">
              Buy now
            </button> */}
            {cart.some(item => item.id === productdata.id) ? (
  <div className="">

  <div className="flex min-w-[200px] px-4 py-3.5 border border-gray-800 bg-transparent text-white text-base rounded">
    <button  onClick={() => updateCartQuantity(productdata.id, -1)} type="button" className="bg-transparent w-full text-white font-semibold flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-current inline" viewBox="0 0 124 124">
        <path d="M112 50H12C5.4 50 0 55.4 0 62s5.4 12 12 12h100c6.6 0 12-5.4 12-12s-5.4-12-12-12z" />
      </svg>
    </button>
    <span className="bg-transparent w-full px-4 font-semibold flex items-center justify-center text-white text-base">{
                          cart.find(item => item.id === productdata.id)?.quantity || 0
                        }</span>
    <button  onClick={() => updateCartQuantity(productdata.id, 1)} type="button" className="bg-transparent w-full text-white font-semibold flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 fill-current inline" viewBox="0 0 42 42">
        <path d="M37.059 16H26V4.941C26 2.224 23.718 0 21 0s-5 2.224-5 4.941V16H4.941C2.224 16 0 18.282 0 21s2.224 5 4.941 5H16v11.059C16 39.776 18.282 42 21 42s5-2.224 5-4.941V26h11.059C39.776 26 42 23.718 42 21s-2.224-5-4.941-5z" />
      </svg>
    </button>
  </div>
</div>

) : (
            <button  onClick={() => handleAddToCart(productdata)} type="button" className="min-w-[200px] px-4 py-3.5 border border-gray-800 bg-transparent text-white text-base rounded">
              Add to cart
            </button>
               )}
          </div>

          {/* Tabs */}
          <div>
            <ul className="grid grid-cols-3 mt-8">
            <li
                onClick={() => setActiveTab('Details')}
                className={`text-base w-full py-3.5 px-2 text-center cursor-pointer border-b-2 ${activeTab === 'Details' ? 'text-white border-white' : 'text-gray-300 border-gray-400'}`}
              >
                Details
              </li>
              <li
                onClick={() => setActiveTab('Description')}
                className={`text-base w-full py-3.5 px-2 text-center cursor-pointer border-b-2 ${activeTab === 'Description' ? 'text-white border-white' : 'text-gray-300 border-gray-400'}`}
              >
                Description
              </li>
             
              <li
                onClick={() => setActiveTab('Reviews')}
                className={`text-base w-full py-3.5 px-2 text-center cursor-pointer border-b-2 ${activeTab === 'Reviews' ? 'text-white border-white' : 'text-gray-300 border-gray-400'}`}
              >
                Reviews
              </li>
            </ul>
            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Quantity and Buy Buttons */}
        

          {/* Buy/Add to Cart Buttons */}
       
        </div>
      </div>
      <ToastContainer/>
    </div>
    </div>
  );
};

export default ProductDetails;
