import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
    },

    image: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
    },

    discount: {
      type: Number,
      default: 0,
    },

    stock: {
      type: Number,
      default: 0,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    // Payment methods allowed for this product
    paymentMethods: {
      type: [String],
      enum: ["COD", "UPI", "CARD"],
      default: ["COD"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;