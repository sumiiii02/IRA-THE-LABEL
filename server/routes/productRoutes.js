import express from "express";
import multer from "multer";
import path from "path";
import Product from "../models/Product.js";

const router = express.Router();

// ==============================
// MULTER IMAGE UPLOAD
// ==============================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage,

  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ==============================
// GET ALL PRODUCTS
// ==============================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);

    res.status(500).json({
      message: "Could not load products",
    });
  }
});

// ==============================
// GET SINGLE PRODUCT
// ==============================

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Could not load product",
    });
  }
});

// ==============================
// ADD PRODUCT
// ==============================

router.post(
  "/",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const images =
        req.files?.map(
          (file) => `/uploads/${file.filename}`
        ) || [];

      const product = await Product.create({
        name: req.body.name,
        description: req.body.description || "",
        category: req.body.category || "",
        price: Number(req.body.price),
        discount: Number(req.body.discount || 0),
        stock: Number(req.body.stock || 0),

        sizes: req.body.sizes
          ? JSON.parse(req.body.sizes)
          : [],

        colors: req.body.colors
          ? JSON.parse(req.body.colors)
          : [],

        images,
      });

      res.status(201).json(product);
    } catch (error) {
      console.error("ADD PRODUCT ERROR:", error);

      res.status(500).json({
        message:
          error.message || "Could not add product",
      });
    }
  }
);

// ==============================
// UPDATE PRODUCT
// ==============================

router.put(
  "/:id",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product = await Product.findById(
        req.params.id
      );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const newImages =
        req.files?.map(
          (file) => `/uploads/${file.filename}`
        ) || [];

      // Update only the fields that were sent

      if (req.body.name !== undefined) {
        product.name = req.body.name;
      }

      if (req.body.description !== undefined) {
        product.description =
          req.body.description;
      }

      if (req.body.category !== undefined) {
        product.category =
          req.body.category;
      }

      if (req.body.price !== undefined) {
        product.price = Number(req.body.price);
      }

      if (req.body.discount !== undefined) {
        product.discount = Number(
          req.body.discount
        );
      }

      if (req.body.stock !== undefined) {
        product.stock = Number(req.body.stock);
      }

      if (req.body.sizes !== undefined) {
        try {
          product.sizes = JSON.parse(
            req.body.sizes
          );
        } catch (error) {
          product.sizes = req.body.sizes;
        }
      }

      if (req.body.colors !== undefined) {
        try {
          product.colors = JSON.parse(
            req.body.colors
          );
        } catch (error) {
          product.colors = req.body.colors;
        }
      }

      // IMPORTANT:
      // Keep existing images when no new images are uploaded
      if (newImages.length > 0) {
        product.images = newImages;
      }

      const updatedProduct =
        await product.save();

      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error("UPDATE PRODUCT ERROR:", error);

      res.status(500).json({
        message:
          error.message ||
          "Could not update product",
      });
    }
  }
);

// ==============================
// DELETE PRODUCT
// ==============================

router.delete("/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    res.status(500).json({
      message: "Could not delete product",
    });
  }
});

// ==============================
// EXPORT ROUTER
// ==============================

export default router;