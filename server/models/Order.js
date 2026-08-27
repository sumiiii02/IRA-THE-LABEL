const mongoose = require("mongoose");

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
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    address: {
      houseAddress: {
        type: String,
        required: true,
      },
      apartment: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pinCode: {
        type: String,
        required: true,
      },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          default: "",
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        image: {
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
    },

    orderStatus: {
      type: String,
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);