import express from "express";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.put("/:id", requireAdmin, updateProduct);
router.post("/", requireAdmin, createProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
