import mongoose from "mongoose";

const connectionDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected Successfully");
  } catch (error) {
    console.log("Connection Failed");
    console.log(error.message);
  }
};

export default connectionDB;