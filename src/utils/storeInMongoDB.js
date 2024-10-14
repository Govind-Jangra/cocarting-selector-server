import mongoose from 'mongoose';
import Product from '../Model/ProductModel.js';

async function storeInMongoDB(productData) {
    try {
        // Attempting to connect to MongoDB
        await mongoose.connect('mongodb+srv://govind:govind@cluster0.pslgd.mongodb.net/productInfoSelectors', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB successfully.');

        // Updating or inserting the product data
        const updatedProduct = await Product.findOneAndUpdate(
            { website_name: productData.website_name },  // Query by website name
            {
                title: productData.title,
                mrp: productData.mrp,
                current: productData.current,
                rating: productData.rating,
                image:productData.image
            },
            { 
                new: true,        // Return the updated document
                upsert: true,     // Insert if the document doesn't exist
                runValidators: true // Run schema validators
            }
        );

        console.log('Data processed:', updatedProduct._id);

    } catch (error) {
        // Log detailed error information
        if (error.cause) {
            console.error('MongoDB connection error cause:', error.cause);
        }
        console.error('Error storing data in MongoDB:', error);
    } finally {
        // Ensure the MongoDB connection is closed
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
    }
}

export default storeInMongoDB;
