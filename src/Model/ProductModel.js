import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    website_name: { type: String, required: true },
    title: { type: String, required: true },
    mrp: { type: String, required: true },
    current: { type: String, required: true },
    rating: { type: String, required: true },
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

export default Product;
