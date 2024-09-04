import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DBUSER)
        console.log("mongoose connected successfully...")
    } catch (error) {
        console.log(error)
    }
}

export default connectDB