import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    website_name: { type: String, required: true },
    title: { type: [String] },  // Array of strings
    mrp: { type: [String] },    // Array of strings
    current: { type: [String] },// Array of strings
    rating: { type: [String] }, // Array of strings
    image: { type: [String] },  // Array of strings
}, { timestamps: true });

const Product = mongoose.model('ApproachOne', ProductSchema);

export default Product;
