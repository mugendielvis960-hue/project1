import mongoose from "moongose";

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
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createArt, updatedArt
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
