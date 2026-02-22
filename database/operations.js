// File for storing basic db operations that the backend might use
// For now, just a get all products to test that the connection works
import { supabase } from './db.js'; // Import the supabase client from db.js

async function getAllProducts() {
  const { data, error } = await supabase
    .from('products') 
    .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return null;
    }
    return data;
}

// export the functions for use by the backend routes (will add more functions as needed)
export { getAllProducts };