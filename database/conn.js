import mongoose from "mongoose";

async function dbConnect() {

    mongoose.set('strictQuery', true)
    const db = await mongoose.connect(process.env.ATLAS_URI);
    console.log("Database Connected")
    return db;
}

export default dbConnect;