import React, { useState, useEffect } from 'react';
import { firebase } from '../Firebase/config';
import { v4 as uuidv4 } from 'uuid';
import { AiFillEdit, AiFillDelete } from 'react-icons/ai';

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const firestore = firebase.firestore();
  const storage = firebase.storage();

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await firestore.collection('categories').get();
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  const handleCategoryImageChange = (e) => {
    if (e.target.files[0]) {
      setCategoryImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = '';
    if (categoryImage) {
      const imageRef = storage.ref(`categories/${uuidv4()}-${categoryImage.name}`);
      await imageRef.put(categoryImage);
      imageUrl = await imageRef.getDownloadURL();
    }

    if (editingCategoryId) {
      await firestore.collection('categories').doc(editingCategoryId).update({
        name: categoryName,
        imageUrl: imageUrl || null,
      });
      setEditingCategoryId(null);
    } else {
      await firestore.collection('categories').add({
        name: categoryName,
        imageUrl,
      });
    }

    setCategoryName('');
    setCategoryImage(null);
    setIsSubmitting(false);

    const snapshot = await firestore.collection('categories').get();
    const categoriesData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoriesData);
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingCategoryId(category.id);
  };

  const handleDelete = async (id) => {
    await firestore.collection('categories').doc(id).delete();
    setCategories(categories.filter(category => category.id !== id));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Category</h1>
      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-md shadow-sm">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category Name</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter category name"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Category Image</label>
          <input
            type="file"
            onChange={handleCategoryImageChange}
            className="mt-1 block w-full"
          />
        </div>
        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors ${isSubmitting && 'opacity-50 cursor-not-allowed'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto bg-white rounded-md shadow-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left px-4 py-2 font-medium text-gray-600">#</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Category Name</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Image</th>
              <th className="text-left px-4 py-2 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => (
              <tr key={category.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition`}>
                <td className="border-t px-4 py-2">{index + 1}</td>
                <td className="border-t px-4 py-2">{category.name}</td>
                <td className="border-t px-4 py-2">
                  {category.imageUrl && (
                    <img src={category.imageUrl} alt={category.name} className="h-8 w-8 object-cover rounded-md shadow-sm" />
                  )}
                </td>
                <td className="border-t px-4 py-2 flex items-center space-x-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 transition"
                    onClick={() => handleEdit(category)}
                  >
                    <AiFillEdit size={20} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 transition"
                    onClick={() => handleDelete(category.id)}
                  >
                    <AiFillDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCategory;
