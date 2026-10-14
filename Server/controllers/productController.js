import { Types } from "mongoose";
import { getDB } from "../config/db.js";

export async function getProducts(req, res) {
  try {
    const db = getDB();

    const products = await db
      .collection("products")
      .find()
      .toArray();

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to get products"
    });
  }
}

export async function getProductById(req, res) {
  try {
    const db = getDB();

    const product = await db
      .collection("products")
      .findOne({
        _id: new Types.ObjectId(req.params.id)
      });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get product"
    });
  }
}
