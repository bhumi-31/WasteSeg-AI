import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bhumikanarula07_db_user:R2VEh7TVlTjarFWd@wastemanagement.6pmert2.mongodb.net/wastewise?retryWrites=true&w=majority';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit - app can still work with localStorage
    return null;
  }
}

export default connectDB;
