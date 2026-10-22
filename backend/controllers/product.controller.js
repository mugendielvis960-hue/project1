import Product from "../models/Product.model.js";
import mongoose from "mongoose";

const isValidImageUrl = (image) => {
  try {
    const url = new URL(image);
    return url.protocol === "https:";
  } catch {
    return false;
  }
};

const validateProduct = ({ name, description, price, image }) =>
  typeof name === "string" &&
  name.length <= 150 &&
  Boolean(name.trim()) &&
  typeof description === "string" &&
  description.length <= 2000 &&
  Boolean(description.trim()) &&
  Number.isFinite(price) &&
  price > 0 &&
  typeof image === "string" &&
  image.length <= 2048 &&
  isValidImageUrl(image);

const validationError = (res) =>
  res.status(400).json({
    success: false,
    message: "Enter a name, description, positive price, and valid image URL",
  });

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createProduct = async (req, res) => {
  if (!validateProduct(req.body ?? {})) return validationError(res);

  try {
    const { name, description, price, image } = req.body;
    const newProduct = new Product({ name: name.trim(), description: description.trim(), price, image });
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(error instanceof mongoose.Error.ValidationError ? 400 : 500).json({
      success: false,
      message: error instanceof mongoose.Error.ValidationError ? error.message : "Internal server error",
    });
  }
};

export const updateProduct = async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  const allowedFields = ["name", "description", "price", "image"];
  const updatedData = Object.fromEntries(
    Object.entries(req.body ?? {}).filter(([key]) => allowedFields.includes(key)),
  );
  if (!Object.keys(updatedData).length || !validateProduct({
    name: updatedData.name,
    description: updatedData.description,
    price: updatedData.price,
    image: updatedData.image,
  })) {
    return validationError(res);
  }

  try {
    updatedData.name = updatedData.name.trim();
    updatedData.description = updatedData.description.trim();
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedData,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(
      error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError ? 400 : 500,
    ).json({
      success: false,
      message: error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError
        ? error.message
        : "Internal server error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
