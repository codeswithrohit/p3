import React, { useState, useEffect } from "react";
import { firebase } from "../../Firebase/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/router';
import AdminNavbar from '../../components/AdminNavbar'
import Category from '../../components/AdminCategory';
const db = firebase.firestore();
const storage = firebase.storage();

const Products = () => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // State for Category modal
  const [categories, setCategories] = useState([]);
  // Add other state variables...

  const handleAddCategoryClick = () => {
    setIsCategoryModalOpen(true); // Open Category modal
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false); // Close Category modal
  };
  const [productData, setProductData] = useState({
    id: "",
    itemname: "",
    authorname: "",
    publication: "",
    isbn: "",
    code: "",
    edition: "",
    language: "",
    hsn: "",
    binding: "",
    length: "",
    width:"",
    height:"",
    pages:"",
    description:"",
    gst:"",
    itemweight:"",
    category:"",
    sellingprice:"",
    mrp:"",
    maximumpurchase:"",
    purchaseprice:"",
    stock:"",
    images: [],
    imagesUrls: [], // Added this to manage existing images
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProductData((prev) => ({
      ...prev,
      images: Array.from(e.target.files),
    }));
  };
  const [isAdmin, setIsAdmin] = useState(false);

//   // Check if the user is an admin when the component mounts
//   useEffect(() => {
//     const isAdminInLocalStorage = localStorage.getItem("isAdmin") === "true";
//     setIsAdmin(isAdminInLocalStorage);
//     if (!isAdminInLocalStorage) {
//       // If the user is not an admin, show a loading message or redirect them to the login page
//       router.push("/adminlogin");
//     } else {
//     }
//   }, [router]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadProgress(0);
    toast.info("Submitting...");

    const imageUrls = [];
    let totalBytes = 0;
    let loadedBytes = 0;

    const uploadTasks = productData.images.map((file) => {
      const fileRef = storage.ref().child(`Product/${file.name}`);
      totalBytes += file.size;

      return new Promise((resolve, reject) => {
        const uploadTask = fileRef.put(file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round((loadedBytes + (file.size * (snapshot.bytesTransferred / snapshot.totalBytes))) / totalBytes * 100));
          },
          (error) => {
            toast.error("Error uploading image. Please try again.");
            setUploading(false);
            reject(error);
          },
          async () => {
            const url = await uploadTask.snapshot.ref.getDownloadURL();
            imageUrls.push(url);
            loadedBytes += file.size;
            resolve();
          }
        );
      });
    });

    try {
      await Promise.all(uploadTasks);
      const currentDate = new Date();
      const productDataToSave = {
        itemname: productData.itemname,
        authorname: productData.authorname,
        publication: productData.publication,
        isbn: productData.isbn,
        code: productData.code,
        edition: productData.edition,
        language: productData.language,
        hsn: productData.hsn,
        binding: productData.binding,
       length: productData.length,
       width: productData.width,
       height: productData.height,
       pages: productData.pages,
       description: productData.description,
       gst: productData.gst,
       itemweight: productData.itemweight,
       category: productData.category,
       sellingprice: productData.sellingprice,
       mrp: productData.mrp,
      maximumpurchase: productData.maximumpurchase,
      dateAdded: currentDate,
      purchaseprice: productData.purchaseprice,
      stock:productData.stock,
        images: [...productData.imagesUrls, ...imageUrls], // Append new images to existing
      };

      if (productData.id) {
        // Update existing product
        await db.collection("Product").doc(productData.id).update(productDataToSave);
        toast.success("Product updated successfully!");
      } else {
        // Add new product
        await db.collection("Product").add(productDataToSave);
        toast.success("Product added successfully!");
      }

      setIsModalOpen(false);
      setProductData({
        id: "",
        itemname: "",
        authorname: "",
        publication: "",
        isbn: "",
        code: "",
        edition: "",
        language: "",
        hsn: "",
        binding: "",
        length: "",
        width:"",
        height:"",
        pages:"",
        description:"",
        gst:"",
        itemweight:"",
        category:"",
        sellingprice:"",
        mrp:"",
        maximumpurchase:"",
        purchaseprice:"",
        stock:"",
        images: [],
        imagesUrls: [], // Added this to manage existing images
      });
      window.location.reload();
    } catch (error) {
      toast.error("Error saving product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setProductData({
      ...product,
      images: [], // Reset images to avoid showing old files
      imagesUrls: product.images || [], // Preserve existing image URLs
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, imageUrls) => {
    try {
      // Delete images from storage
      await Promise.all(imageUrls.map(async (url) => {
        // Decode the file name and path
        const decodedUrl = decodeURIComponent(url);
        const fileName = decodedUrl.split('/').pop().split('?')[0];
  
        // Construct the file reference path
        const fileRef = storage.ref().child(`Product/${fileName}`);
  
        // Check if the file exists before trying to delete it
        const fileSnapshot = await fileRef.getMetadata().catch((error) => {
          if (error.code === 'storage/object-not-found') {
            console.warn(`File not found: ${fileName}`);
          } else {
            throw error;
          }
        });
  
        if (fileSnapshot) {
          // File exists, proceed to delete
          await fileRef.delete();
          console.log(`File deleted: ${fileName}`);
        } else {
          console.warn(`File already deleted or doesn't exist: ${fileName}`);
        }
      }));
  
      // Delete product from Firestore
      await db.collection("Product").doc(id).delete();
      toast.success("Product deleted successfully!");
      window.location.reload();
    } catch (error) {
      toast.error("Error deleting product. Please try again.");
      console.error("Error deleting product:", error);
    }
  };
  

  const handleRemoveImage = async (url) => {
    try {
      // Decode the file name and path
      const decodedUrl = decodeURIComponent(url);
      const fileName = decodedUrl.split('/').pop().split('?')[0];
  
      // Construct the file reference path
      const fileRef = storage.ref().child(`Product/${fileName}`);
  
      // Log the file reference for debugging
      console.log("Deleting file:", fileRef.fullPath);
  
      // Delete the file from Firebase Storage
      await fileRef.delete();
  
      // Update the product data to remove the image URL
      const updatedImagesUrls = productData.imagesUrls.filter(imageUrl => imageUrl !== url);
      setProductData(prev => ({ ...prev, imagesUrls: updatedImagesUrls }));
  
      toast.success("Image removed successfully!");
    } catch (error) {
      toast.error("Error removing image. Please try again.");
      console.error("Error removing image:", error);
    }
  };
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await db.collection("Product").get();
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setFilteredProducts(productList.filter(product => product.itemname.toLowerCase().includes(searchTerm.toLowerCase())));
    } catch (error) {
      toast.error("Error fetching products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);


  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await firebase.firestore().collection('categories').get();
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);
  
  useEffect(() => {
    setFilteredProducts(products.filter(product => product.itemname.toLowerCase().includes(searchTerm.toLowerCase())));
  }, [searchTerm, products]);

  return (
    <div className="m-auto min-h-screen  py-16 bg-white dark:bg-gray-900">
        <AdminNavbar/>
      <section className="bg-white lg:ml-64 dark:bg-gray-900">
        <section className="bg-white dark:bg-gray-900 p-3 sm:p-5">
          <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
            <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="w-full md:w-1/2">
                  <form className="flex items-center">
                    <label htmlFor="simple-search" className="sr-only">
                      Search
                    </label>
                    <div className="relative w-full">
                    <input
                        type="text"
                        id="simple-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search"
                        required=""
                      />
                    </div>
                  </form>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    className="flex hover:text-white items-center justify-center text-black bg-red-400 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={handleAddCategoryClick}
                  >
                    ➕ Add Category
                  </button>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-1 flex-shrink-0">
                  <button
                    type="button"
                    className="flex hover:text-white items-center justify-center text-black bg-red-400 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={() => setIsModalOpen(true)}
                  >
                    ➕ Add Product
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
              {loading ? (
                  <p className="p-4">Loading...</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="p-4">No products found.</p>
                ) : (
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Title</th>
                        <th scope="col" className="px-6 py-3">MRP</th>
                        <th scope="col" className="px-6 py-3">Selling Price</th>
                        <th scope="col" className="px-6 py-3">purchaseprice Price</th>
                        <th scope="col" className="px-6 py-3">In Stock</th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.itemname}</td>
                          <td className="px-6 py-4">₹{product.mrp}</td>
                          <td className="px-6 py-4">₹{product.sellingprice}</td>
                          <td className="px-6 py-4">₹{product.purchaseprice}</td>
                          <td className="px-6 py-4">{product.stock}</td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              className="text-blue-600 dark:text-blue-500 hover:underline"
                              onClick={() => handleEdit(product)}
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="text-red-600 dark:text-red-500 hover:underline ml-2"
                              onClick={() => handleDelete(product.id, product.images)}
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
        {isModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full h-full bg-white dark:bg-gray-800 overflow-auto">
        <button
          className="absolute top-4 right-4 text-red-500"
          onClick={() => setIsModalOpen(false)} // Close modal button
        >
          ✖ Close
        </button>
        <div className="p-8" >
            <h2 className="text-xl font-semibold mb-4">Product {productData.id ? "Edit" : "Add"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  name="itemname"
                  value={productData.itemname}
                  onChange={handleInputChange}
                  placeholder="Item Name"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="authorname"
                  value={productData.authorname}
                  onChange={handleInputChange}
                  placeholder="Author Name"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="publication"
                  value={productData.publication}
                  onChange={handleInputChange}
                  placeholder="Publication"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="isbn"
                  value={productData.isbn}
                  onChange={handleInputChange}
                  placeholder="ISBN"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="code"
                  value={productData.code}
                  onChange={handleInputChange}
                  placeholder="Code"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="edition"
                  value={productData.edition}
                  onChange={handleInputChange}
                  placeholder="Edition"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="language"
                  value={productData.language}
                  onChange={handleInputChange}
                  placeholder="Language"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="hsn"
                  value={productData.hsn}
                  onChange={handleInputChange}
                  placeholder="HSN"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="binding"
                  value={productData.binding}
                  onChange={handleInputChange}
                  placeholder="Binding"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="length"
                  value={productData.length}
                  onChange={handleInputChange}
                  placeholder="Length(In CM)"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="width"
                  value={productData.width}
                  onChange={handleInputChange}
                  placeholder="Width(IN CM)"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="height"
                  value={productData.height}
                  onChange={handleInputChange}
                  placeholder="Height(In CM)"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="pages"
                  value={productData.pages}
                  onChange={handleInputChange}
                  placeholder="Pages"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="gst"
                  value={productData.gst}
                  onChange={handleInputChange}
                  placeholder="GST(In %)"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="itemweight"
                  value={productData.itemweight}
                  onChange={handleInputChange}
                  placeholder="Item Weight"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  {/* <input
                  type="text"
                  name="publication"
                  value={productData.publication}
                  onChange={handleInputChange}
                  placeholder="Publication"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                /> */}
                                  <div className="mb-4">
  <label className="block text-gray-700 mb-2" htmlFor="category">
    Category
  </label>
  <select
    id="category"
    name="category"
    className="border border-gray-300 rounded-lg w-full p-2"
    value={productData.category}
    onChange={handleInputChange}
    required
  >
    <option value="">Select Category</option>
    {/* Dynamically mapping over categories to display them */}
    {categories.map((category) => (
      <option key={category.id} value={category.name}>
        {category.name}
      </option>
    ))}
  </select>
</div>

<input
                  type="text"
                  name="sellingprice"
                  value={productData.sellingprice}
                  onChange={handleInputChange}
                  placeholder="Selling Price"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="mrp"
                  value={productData.mrp}
                  onChange={handleInputChange}
                  placeholder="MRP"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="maximumpurchase"
                  value={productData.maximumpurchase}
                  onChange={handleInputChange}
                  placeholder="Maximum Purchase"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                  <input
                  type="text"
                  name="purchaseprice"
                  value={productData.purchaseprice}
                  onChange={handleInputChange}
                  placeholder="Purchase Price"
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                   <input
                  type="text"
                  name="stock"
                  value={productData.stock}
                  onChange={handleInputChange}
                  placeholder="Enter Quantity (Stock) "
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
                                 

               
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder="Description"
                  className="w-full h-48 p-2 border border-gray-300 rounded"
                />
              
         
               <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Images</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Existing Images</label>
                <div className="flex flex-wrap gap-2">
                  {productData.imagesUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={`Product Image ${index + 1}`} className="w-24 h-24 object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(url)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
                </div>
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white p-2 rounded"
                >
                  {uploading ? `Uploading ${uploadProgress}%` : 'Submit'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
      {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 overflow-auto">
                    <button
                      className="absolute top-4 right-4 text-red-500"
                      onClick={handleCloseCategoryModal} // Close modal button
                    >
                      ✖ Close
                    </button>
                    {/* Render the Category component here */}
                    <Category />
                  </div>
                </div>
              )}
      </section>

     
      <ToastContainer />
    </div>
  );
};

export default Products;
