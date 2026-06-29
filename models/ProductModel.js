import mongoose, { Mongoose } from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
