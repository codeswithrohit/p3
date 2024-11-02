import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { firebase } from '../Firebase/config';

const SearchPage = () => {
  const router = useRouter();
  const { search } = router.query; // Retrieve the search query from URL
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (search) {
      const fetchResults = async () => {
        try {
          const snapshot = await firebase.firestore().collection("Product").get();
          const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const filteredResults = allProducts.filter(product =>
            product.itemname?.toLowerCase().includes(search.toLowerCase()) ||
            product.authorname?.toLowerCase().includes(search.toLowerCase()) ||
            product.publication?.toLowerCase().includes(search.toLowerCase())
          );
          setResults(filteredResults);
        } catch (error) {
          console.error("Error fetching search results", error);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [search]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Search Results for "{search}"</h1>
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.itemname} - {result.authorname}</li>
        ))}
      </ul>
      {results.length === 0 && <p>No results found</p>}
    </div>
  );
};

export default SearchPage;
