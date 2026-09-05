const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ========================================
// CONFIG
// ========================================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(
  express.json({
    limit: "50mb",
  })
);

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

    paymentMethods: {
      type: [String],
      enum: ["COD", "UPI", "CARD"],
      default: ["COD", "UPI", "CARD"],
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

// ========================================
// FILTER / CATEGORY SCHEMA
// ========================================

const filterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Filter = mongoose.model(
  "Filter",
  filterSchema
);

// ========================================
// ORDER SCHEMA
// ========================================

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

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
      enum: ["COD", "UPI", "CARD"],
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

const Order = mongoose.model(
  "Order",
  orderSchema
);

// ========================================
// HOME / TEST
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "IRA THE LABEL API is running",
  });
});

// ========================================
// FILTER ROUTES
// ========================================

// ========================================
// GET ALL FILTERS
// ========================================

app.get("/api/filters", async (req, res) => {
  try {
    const filters = await Filter.find({
      active: true,
    }).sort({
      order: 1,
      createdAt: 1,
    });

    res.status(200).json(filters);
  } catch (error) {
    console.error(
      "GET FILTERS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Could not load filters",
    });
  }
});

// ========================================
// GET ALL FILTERS FOR ADMIN
// ========================================

app.get(
  "/api/admin/filters",
  async (req, res) => {
    try {
      const filters = await Filter.find().sort({
        order: 1,
        createdAt: 1,
      });

      res.status(200).json(filters);
    } catch (error) {
      console.error(
        "GET ADMIN FILTERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Could not load filters",
      });
    }
  }
);

// ========================================
// ADD FILTER
// ========================================

app.post("/api/filters", async (req, res) => {
  try {
    const {
      name,
      image,
      order,
      active,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Filter name is required",
      });
    }

    const existingFilter =
      await Filter.findOne({
        name: {
          $regex: new RegExp(
            `^${name.trim()}$`,
            "i"
          ),
        },
      });

    if (existingFilter) {
      return res.status(400).json({
        success: false,
        message:
          "A filter with this name already exists",
      });
    }

    const filter = await Filter.create({
      name: name.trim(),
      image: image || "",
      order:
        order !== undefined
          ? Number(order)
          : await Filter.countDocuments(),
      active:
        active !== undefined
          ? Boolean(active)
          : true,
    });

    res.status(201).json({
      success: true,
      message: "Filter added successfully",
      filter,
    });
  } catch (error) {
    console.error(
      "ADD FILTER ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Could not add filter",
    });
  }
});

// ========================================
// UPDATE FILTER
// ========================================

app.put(
  "/api/filters/:id",
  async (req, res) => {
    try {
      const {
        name,
        image,
        order,
        active,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Filter name is required",
        });
      }

      const duplicate =
        await Filter.findOne({
          name: {
            $regex: new RegExp(
              `^${name.trim()}$`,
              "i"
            ),
          },

          _id: {
            $ne: req.params.id,
          },
        });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message:
            "Another filter with this name already exists",
        });
      }

      const filter =
        await Filter.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),
            image: image || "",
            order:
              order !== undefined
                ? Number(order)
                : 0,
            active:
              active !== undefined
                ? Boolean(active)
                : true,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!filter) {
        return res.status(404).json({
          success: false,
          message: "Filter not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Filter updated successfully",
        filter,
      });
    } catch (error) {
      console.error(
        "UPDATE FILTER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not update filter",
      });
    }
  }
);

// ========================================
// DELETE FILTER PERMANENTLY
// ========================================

app.delete(
  "/api/filters/:id",
  async (req, res) => {
    try {
      const filter =
        await Filter.findByIdAndDelete(
          req.params.id
        );

      if (!filter) {
        return res.status(404).json({
          success: false,
          message: "Filter not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Filter deleted permanently",
      });
    } catch (error) {
      console.error(
        "DELETE FILTER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not delete filter",
      });
    }
  }
);

// ========================================
// PRODUCT ROUTES
// ========================================

// GET ALL PRODUCTS

app.get("/api/products", async (req, res) => {
  try {
    const products =
      await Product.find().sort({
        createdAt: -1,
      });

    res.status(200).json(products);
  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Could not load products",
    });
  }
});

// GET SINGLE PRODUCT

app.get(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
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
        success: false,
        message:
          "Could not load product",
      });
    }
  }
);

// ADD PRODUCT

app.post(
  "/api/products/add",
  async (req, res) => {
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
        paymentMethods,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required",
        });
      }

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product price is required",
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Product price cannot be negative",
        });
      }

      const validPaymentMethods =
        Array.isArray(paymentMethods)
          ? paymentMethods.filter(
              (method) =>
                [
                  "COD",
                  "UPI",
                  "CARD",
                ].includes(method)
            )
          : [
              "COD",
              "UPI",
              "CARD",
            ];

      if (
        validPaymentMethods.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one payment method must be selected",
        });
      }

      const product =
        await Product.create({
          name: name.trim(),

          description:
            description || "",

          category:
            category || "Kurtis",

          price: Number(price),

          discount:
            Number(discount) || 0,

          stock:
            Number(stock) || 0,

          sizes:
            Array.isArray(sizes)
              ? sizes
              : [],

          colors:
            Array.isArray(colors)
              ? colors
              : [],

          images:
            Array.isArray(images)
              ? images
              : [],

          paymentMethods:
            validPaymentMethods,
        });

      res.status(201).json({
        success: true,
        message:
          "Product added successfully",
        product,
      });
    } catch (error) {
      console.error(
        "ADD PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not add product",
      });
    }
  }
);

// UPDATE PRODUCT

app.put(
  "/api/products/:id",
  async (req, res) => {
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
        paymentMethods,
      } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required",
        });
      }

      if (
        price === undefined ||
        price === null ||
        price === ""
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product price is required",
        });
      }

      if (Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Product price cannot be negative",
        });
      }

      const validPaymentMethods =
        Array.isArray(paymentMethods)
          ? paymentMethods.filter(
              (method) =>
                [
                  "COD",
                  "UPI",
                  "CARD",
                ].includes(method)
            )
          : [
              "COD",
              "UPI",
              "CARD",
            ];

      if (
        validPaymentMethods.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one payment method must be selected",
        });
      }

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            name: name.trim(),

            description:
              description || "",

            category:
              category || "Kurtis",

            price: Number(price),

            discount:
              Number(discount) || 0,

            stock:
              Number(stock) || 0,

            sizes:
              Array.isArray(sizes)
                ? sizes
                : [],

            colors:
              Array.isArray(colors)
                ? colors
                : [],

            images:
              Array.isArray(images)
                ? images
                : [],

            paymentMethods:
              validPaymentMethods,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Product updated successfully",
        product,
      });
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not update product",
      });
    }
  }
);

// DELETE PRODUCT

app.delete(
  "/api/products/:id",
  async (req, res) => {
    try {
      const product =
        await Product.findByIdAndDelete(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Product deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not delete product",
      });
    }
  }
);

// ========================================
// ORDER ROUTES
// ========================================

// CREATE ORDER

app.post(
  "/api/orders",
  async (req, res) => {
    try {
      const {
        customerId,
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
          success: false,
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
          success: false,
          message:
            "Complete delivery address is required",
        });
      }

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Your cart is empty",
        });
      }

      if (
        !["COD", "UPI", "CARD"].includes(
          paymentMethod
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment method",
        });
      }

      if (
        totalAmount === undefined ||
        totalAmount === null ||
        Number(totalAmount) < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid order total is required",
        });
      }

      const order =
        await Order.create({
          customerId:
            customerId || "",

          customer,

          deliveryAddress,

          items,

          paymentMethod,

          totalAmount:
            Number(totalAmount),

          orderStatus:
            "Pending",
        });

      res.status(201).json({
        success: true,
        message:
          "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CREATE ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Could not place order",
      });
    }
  }
);

// GET ALL ORDERS

app.get(
  "/api/orders",
  async (req, res) => {
    try {
      const orders =
        await Order.find().sort({
          createdAt: -1,
        });

      res.status(200).json(orders);
    } catch (error) {
      console.error(
        "GET ORDERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load orders",
      });
    }
  }
);

// GET CUSTOMER ORDERS

app.get(
  "/api/orders/customer/:customerId",
  async (req, res) => {
    try {
      const { customerId } =
        req.params;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message:
            "Customer ID is required",
        });
      }

      const orders =
        await Order.find({
          customerId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json(orders);
    } catch (error) {
      console.error(
        "GET CUSTOMER ORDERS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load customer orders",
      });
    }
  }
);

// GET SINGLE ORDER

app.get(
  "/api/orders/:id",
  async (req, res) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not load order",
      });
    }
  }
);

// ========================================
// UPDATE ORDER STATUS
// ========================================

const updateOrderStatusHandler =
  async (req, res) => {
    try {
      const { orderStatus } =
        req.body;

      const allowedStatuses = [
        "Pending",
        "Accepted",
        "Rejected",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ];

      if (
        !orderStatus ||
        !allowedStatuses.includes(
          orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
        });
      }

      if (
        orderStatus === "Rejected"
      ) {
        const deletedOrder =
          await Order.findByIdAndDelete(
            req.params.id
          );

        if (!deletedOrder) {
          return res.status(404).json({
            success: false,
            message:
              "Order not found",
          });
        }

        return res.status(200).json({
          success: true,
          deleted: true,
          message:
            "Order rejected and deleted successfully",
          orderId:
            req.params.id,
        });
      }

      const updatedOrder =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            orderStatus,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message: `Order ${orderStatus.toLowerCase()} successfully`,
        order: updatedOrder,
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

// STATUS ROUTES

app.patch(
  "/api/orders/:id/status",
  updateOrderStatusHandler
);

app.put(
  "/api/orders/:id/status",
  updateOrderStatusHandler
);

// DELETE ORDER

app.delete(
  "/api/orders/:id",
  async (req, res) => {
    try {
      const order =
        await Order.findByIdAndDelete(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Order deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE ORDER ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Could not delete order",
      });
    }
  }
);

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
  (error, req, res, next) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );

    if (
      error.type ===
      "entity.too.large"
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Image is too large. Please use a smaller image.",
      });
    }

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error",
    });
  }
);

// ========================================
// MONGODB CONNECTION
// ========================================

if (!MONGO_URI) {
  console.error(
    "ERROR: MONGO_URI is missing in your .env file"
  );

  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB Connected Successfully"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );
  });

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log(
    "=============================="
  );

  console.log(
    "IRA THE LABEL BACKEND RUNNING"
  );

  console.log(`PORT: ${PORT}`);

  console.log(
    "=============================="
  );
});