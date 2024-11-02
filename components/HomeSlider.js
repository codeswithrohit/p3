import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const images = [
  'https://www.bookswagon.com/bannerimages/70_inr.jpg?v=1.9', // Replace with actual URLs
  'https://www.bookswagon.com/bannerimages/79_inr.jpg?v=1.8',
  'https://www.bookswagon.com/bannerimages/83_inr.jpg?v=1.8'
];

const HomeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [currentSlide]);

  // Handle next slide
  const handleNext = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === images.length - 1 ? 0 : prevSlide + 1
    );
  };

  // Handle previous slide
  const handlePrev = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? images.length - 1 : prevSlide - 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden h-[375px] py-16 ">
      {/* Slider Wrapper */}
      <div className="flex items-center justify-center relative">
        {/* Previous Arrow */}
        <button
          className="absolute left-4 z-10 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={handlePrev}
        >
          <FaArrowLeft className="text-xl" />
        </button>

        {/* Image Slide */}
        <motion.div
          key={currentSlide}
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={images[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-[375px] object-cover"
          />
        </motion.div>

        {/* Next Arrow */}
        <button
          className="absolute right-4 z-10 text-white bg-black bg-opacity-50 p-2 rounded-full"
          onClick={handleNext}
        >
          <FaArrowRight className="text-xl" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full mx-1 ${
              currentSlide === index ? 'bg-white' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSlider;
