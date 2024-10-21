import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 
const mongoUri=process.env.MONGO_URI;
const connectDB = async () => {
    try {
        const serverSelectionTimeoutMS = 10000;
       await mongoose.connect(mongoUri,{
        useNewUrlParser: true,
  useUnifiedTopology: true,
      
       });
       console.log("mongodb connected")
    } catch (error) {
        console.error(`Error connecting to MongoDB:`, error);
    if (error.cause) {
        console.error(`Cause:`, error.cause);
    }
    process.exit(1);
    }
};

export default connectDB;
