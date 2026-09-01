import express from "express";
import multer from "multer";
import path from "path";
import Product from "../models/Product.js";

const router = express.Router();

// ======================================================
// MULTER IMAGE UPLOAD
// ======================================================

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

// ======================================================
// PAYMENT METHODS HELPER
// ======================================================

const PAYMENT_METHODS = ["COD", "UPI", "CARD"];

const parsePaymentMethods = (value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  // Already an array
  if (Array.isArray(value)) {
    const valid = value.filter((method) =>
      PAYMENT_METHODS.includes(method)
    );

    return valid.length ? [...new Set(valid)] : ["COD"];
  }

  // String coming from JSON or FormData
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        const valid = parsed.filter((method) =>
          PAYMENT_METHODS.includes(method)
        );

        return valid.length
          ? [...new Set(valid)]
          : ["COD"];
      }
    } catch (error) {
      // Not JSON, continue below
    }

    // Support comma-separated values:
    // "COD,UPI,CARD"

    const valid = value
      .split(",")
      .map((method) => method.trim())
      .filter((method) =>
        PAYMENT_METHODS.includes(method)
      );

    return valid.length
      ? [...new Set(valid)]
      : ["COD"];
  }

  return ["COD"];
};

// ======================================================
// GET ALL PRODUCTS
// ======================================================

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    res.status(500).json({
      message: "Could not load products",
    });
  }
});

// ======================================================
// GET SINGLE PRODUCT
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const product =
      await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    res.status(500).json({
      message: "Could not load product",
    });
  }
});

// ======================================================
// ADD PRODUCT
// ======================================================

router.post(
  "/",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const images =
        req.files?.map(
          (file) =>
            `/uploads/${file.filename}`
        ) || [];

      const paymentMethods =
        parsePaymentMethods(
          req.body.paymentMethods
        );

      let sizes = [];
      let colors = [];

      // ------------------------------
      // SIZES
      // ------------------------------

      if (req.body.sizes) {
        try {
          sizes = JSON.parse(
            req.body.sizes
          );
        } catch (error) {
          sizes = String(
            req.body.sizes
          )
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      // ------------------------------
      // COLORS
      // ------------------------------

      if (req.body.colors) {
        try {
          colors = JSON.parse(
            req.body.colors
          );
        } catch (error) {
          colors = String(
            req.body.colors
          )
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
        }
      }

      // ------------------------------
      // CREATE PRODUCT
      // ------------------------------

      const product =
        await Product.create({
          name: req.body.name,

          description:
            req.body.description || "",

          category:
            req.body.category || "",

          price:
            Number(req.body.price),

          discount:
            Number(
              req.body.discount || 0
            ),

          stock:
            Number(
              req.body.stock || 0
            ),

          sizes,

          colors,

          images,

          // IMPORTANT
          paymentMethods:
            paymentMethods || ["COD"],
        });

      res.status(201).json(product);
    } catch (error) {
      console.error(
        "ADD PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Could not add product",
      });
    }
  }
);

// ======================================================
// UPDATE PRODUCT
// ======================================================

router.put(
  "/:id",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      // ==================================================
      // NEW IMAGES
      // ==================================================

      const newImages =
        req.files?.map(
          (file) =>
            `/uploads/${file.filename}`
        ) || [];

      // ==================================================
      // BASIC PRODUCT FIELDS
      // ==================================================

      if (
        req.body.name !== undefined
      ) {
        product.name =
          req.body.name;
      }

      if (
        req.body.description !== undefined
      ) {
        product.description =
          req.body.description;
      }

      if (
        req.body.category !== undefined
      ) {
        product.category =
          req.body.category;
      }

      if (
        req.body.price !== undefined
      ) {
        product.price =
          Number(req.body.price);
      }

      if (
        req.body.discount !== undefined
      ) {
        product.discount =
          Number(
            req.body.discount
          );
      }

      if (
        req.body.stock !== undefined
      ) {
        product.stock =
          Number(
            req.body.stock
          );
      }

      // ==================================================
      // SIZES
      // ==================================================

      if (
        req.body.sizes !== undefined
      ) {
        try {
          product.sizes =
            JSON.parse(
              req.body.sizes
            );
        } catch (error) {
          product.sizes = String(
            req.body.sizes
          )
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);
        }
      }

      // ==================================================
      // COLORS
      // ==================================================

      if (
        req.body.colors !== undefined
      ) {
        try {
          product.colors =
            JSON.parse(
              req.body.colors
            );
        } catch (error) {
          product.colors = String(
            req.body.colors
          )
            .split(",")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean);
        }
      }

      // ==================================================
      // PAYMENT METHODS
      // ==================================================

      if (
        req.body.paymentMethods !== undefined
      ) {
        const paymentMethods =
          parsePaymentMethods(
            req.body.paymentMethods
          );

        if (paymentMethods) {
          product.paymentMethods =
            paymentMethods;
        }
      }

      // ==================================================
      // IMAGES
      // ==================================================

      // Only replace images if new
      // images were actually uploaded.

      if (newImages.length > 0) {
        product.images =
          newImages;
      }

      // ==================================================
      // SAVE TO MONGODB
      // ==================================================

      const updatedProduct =
        await product.save();

      res.status(200).json(
        updatedProduct
      );
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error.message ||
          "Could not update product",
      });
    }
  }
);

// ======================================================
// DELETE PRODUCT
// ======================================================

router.delete(
  "/:id",
  async (req, res) => {
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
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Could not delete product",
      });
    }
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;