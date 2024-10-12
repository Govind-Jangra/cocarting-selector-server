import mongoose from 'mongoose';
import Product from '../Model/ProductModel.js';

async function storeInMongoDB(productData) {
    try {
        await mongoose.connect('mongodb+srv://govind:govind@cluster0.pslgd.mongodb.net/productInfoSelectors', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const updatedProduct = await Product.findOneAndUpdate(
            { website_name: productData.website_name },  
            {
                title: productData.title,
                mrp: productData.mrp,
                current: productData.current,
                rating: productData.rating,
            },
            { 
                new: true,
                upsert: true,     
                runValidators: true 
            }
        );

        console.log('Data processed:', updatedProduct._id);

    } catch (error) {
        console.error('Error storing data in MongoDB:', error);
    } finally {
        await mongoose.connection.close();
    }
}

export default storeInMongoDB;
