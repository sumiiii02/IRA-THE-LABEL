const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// ========================================
// PRODUCT SCHEMA
// ========================================

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      default: "Kurtis",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

// ========================================
// ORDER SCHEMA
// ========================================

const orderSchema = new mongoose.Schema(
  {
    customer: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    deliveryAddress: {
      houseNumber: {
        type: String,
        required: true,
        trim: true,
      },

      apartment: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      pinCode: {
        type: String,
        required: true,
        trim: true,
      },
    },

    items: [
      {
        productId: {
          type: String,
          default: "",
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        quantity: {
          type: Number,
          default: 1,
          min: 1,
        },

        image: {
          type: String,
          default: "",
        },

        size: {
          type: String,
          default: "",
        },

        color: {
          type: String,
          default: "",
        },
      },
    ],

    paymentMethod: {
      type: String,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Rejected",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

// ========================================
// HOME / TEST ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IRA THE LABEL API is running",
  });
});

// ========================================
// PRODUCT ROUTES
// ========================================

// GET ALL PRODUCTS

app.get("/api/products", async (req, res) => {
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

// GET SINGLE PRODUCT

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

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

// ADD PRODUCT

app.post("/api/products/add", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      stock,
      sizes,
      colors,
      images,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        message: "Product price is required",
      });
    }

    if (Number(price) < 0) {
      return res.status(400).json({
        message: "Product price cannot be negative",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || "",
      category: category || "Kurtis",
      price: Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock) || 0,
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
      images: Array.isArray(images) ? images : [],
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);

    res.status(500).json({
      message:
        error.message || "Could not add product",
    });
  }
});

// UPDATE PRODUCT

app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      price,
      discount,
      stock,
      sizes,
      colors,
      images,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Product name is required",
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        message: "Product price is required",
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description || "",
        category: category || "Kurtis",
        price: Number(price),
        discount: Number(discount) || 0,
        stock: Number(stock) || 0,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        images: Array.isArray(images) ? images : [],
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    res.status(500).json({
      message:
        error.message || "Could not update product",
    });
  }
});

// DELETE PRODUCT

app.delete("/api/products/:id", async (req, res) => {
  try {
    const product =
      await Product.findByIdAndDelete(req.params.id);

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

// ========================================
// ORDER ROUTES
// ========================================

// CREATE ORDER

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer,
      deliveryAddress,
      items,
      paymentMethod,
      totalAmount,
    } = req.body;

    if (
      !customer ||
      !customer.firstName ||
      !customer.email ||
      !customer.phone
    ) {
      return res.status(400).json({
        message:
          "Complete customer details are required",
      });
    }

    if (
      !deliveryAddress ||
      !deliveryAddress.houseNumber ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.pinCode
    ) {
      return res.status(400).json({
        message:
          "Complete delivery address is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Your cart is empty",
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        message: "Payment method is required",
      });
    }

    if (
      totalAmount === undefined ||
      totalAmount === null ||
      Number(totalAmount) < 0
    ) {
      return res.status(400).json({
        message: "Valid order total is required",
      });
    }

    const order = await Order.create({
      customer,
      deliveryAddress,
      items,
      paymentMethod,
      totalAmount: Number(totalAmount),
      orderStatus: "Pending",
    });

    console.log("New order created:", order._id);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Could not place order",
    });
  }
});

// GET ALL ORDERS

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({
      createdAt: -1,
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);

    res.status(500).json({
      message: "Could not load orders",
    });
  }
});

// GET SINGLE ORDER

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    res.status(500).json({
      message: "Could not load order",
    });
  }
});

// ========================================
// UPDATE ORDER STATUS
// ========================================

const updateOrderStatusHandler = async (req, res) => {
  try {
    const requestedStatus =
      req.body.orderStatus || req.body.status;

    if (!requestedStatus) {
      return res.status(400).json({
        success: false,
        message: "Order status is required",
      });
    }

    const normalizedStatus = String(
      requestedStatus
    )
      .trim()
      .toLowerCase();

    const statusMap = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
      canceled: "Cancelled",
    };

    const finalStatus =
      statusMap[normalizedStatus];

    if (!finalStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = finalStatus;

    await order.save();

    console.log(
      `Order ${order._id} updated to ${finalStatus}`
    );

    res.status(200).json({
      success: true,
      message: `Order ${finalStatus.toLowerCase()} successfully`,
      order,
    });
  } catch (error) {
    console.error(
      "UPDATE ORDER STATUS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Could not update order status",
    });
  }
};

// ========================================
// STATUS UPDATE ROUTES
// ========================================

// Supports your current admin dashboard route

app.patch(
  "/api/orders/:id/status",
  updateOrderStatusHandler
);

app.put(
  "/api/orders/:id/status",
  updateOrderStatusHandler
);

// Extra compatible routes

app.patch(
  "/api/orders/:id",
  updateOrderStatusHandler
);

app.put(
  "/api/orders/:id",
  updateOrderStatusHandler
);

// ========================================
// DELETE ORDER
// ========================================

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const order =
      await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ORDER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Could not delete order",
    });
  }
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message:
        "Image is too large. Please use a smaller image.",
    });
  }

  res.status(500).json({
    message:
      error.message || "Internal server error",
  });
});

// ========================================
// START SERVER
// ========================================

if (!MONGO_URI) {
  console.error(
    "ERROR: MONGO_URI is missing in your .env file"
  );
  process.exit(1);
}

app.listen(PORT, () => {
  console.log("==============================");
  console.log("IRA THE LABEL BACKEND RUNNING");
  console.log(`PORT: ${PORT}`);
  console.log("==============================");
});

// ========================================
// CONNECT TO MONGODB
// ========================================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );
  });