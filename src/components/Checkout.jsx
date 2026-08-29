import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Landmark,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

// ======================================================
// API
// ======================================================

const API_URL = "https://ira-the-label.onrender.com";

// ======================================================
// HELPERS
// ======================================================

const money = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const getProductId = (product) => {
  return String(
    product?._id ||
      product?.id ||
      product?.productId ||
      ""
  );
};

const getProductImage = (product) => {
  let image = "";

  if (
    Array.isArray(product?.images) &&
    product.images.length > 0
  ) {
    image = product.images[0];
  } else if (product?.image) {
    image = product.image;
  }

  if (!image) return "";

  // Base64 image
  if (
    typeof image === "string" &&
    image.startsWith("data:image")
  ) {
    return image;
  }

  // Full URL
  if (
    typeof image === "string" &&
    (
      image.startsWith("http://") ||
      image.startsWith("https://")
    )
  ) {
    return image;
  }

  // Backend image path
  return `https://ira-the-label.onrender.com${image}`;
};

const getProductPrice = (product) => {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);

  if (discount > 0) {
    return Math.round(
      price - (price * discount) / 100
    );
  }

  return price;
};

const getPaymentMethodName = (method) => {
  const methods = {
    cod: "Cash on Delivery",
    online: "Online Payment",
    bank: "Bank Transfer",
  };

  return methods[method] || method;
};

// ======================================================
// CHECKOUT COMPONENT
// ======================================================

function Checkout({ items = [], nav, clearCart }) {
  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [orderPlaced, setOrderPlaced] =
    useState(false);

  const [orderId, setOrderId] =
    useState("");

  const [error, setError] =
    useState("");

  // ======================================================
  // TOTALS
  // ======================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, product) => {
        const price =
          getProductPrice(product);

        const quantity =
          Number(product.quantity || 1);

        return total + price * quantity;
      },
      0
    );
  }, [items]);

  const totalItems = useMemo(() => {
    return items.reduce(
      (total, product) => {
        return (
          total +
          Number(product.quantity || 1)
        );
      },
      0
    );
  }, [items]);

  const shipping = 0;

  const total = subtotal + shipping;

  // ======================================================
  // UPDATE CUSTOMER
  // ======================================================

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateCheckout = () => {
    if (!customer.firstName.trim()) {
      return "Please enter your first name.";
    }

    if (!customer.lastName.trim()) {
      return "Please enter your last name.";
    }

    if (!customer.email.trim()) {
      return "Please enter your email address.";
    }

    if (!customer.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!customer.address.trim()) {
      return "Please enter your delivery address.";
    }

    if (!customer.city.trim()) {
      return "Please enter your city.";
    }

    if (!customer.state.trim()) {
      return "Please enter your state.";
    }

    if (!customer.pincode.trim()) {
      return "Please enter your PIN code.";
    }

    return "";
  };

  // ======================================================
  // PLACE ORDER
  // ======================================================

  const placeOrder = async () => {
    setError("");

    // Cart validation
    if (!items.length) {
      setError("Your shopping bag is empty.");
      return;
    }

    // Form validation
    const validationError =
      validateCheckout();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setPlacingOrder(true);

    try {
      // ================================================
      // DATA MATCHES YOUR CURRENT SERVER.JS SCHEMA
      // ================================================

      const orderData = {
        customer: {
          firstName:
            customer.firstName.trim(),

          lastName:
            customer.lastName.trim(),

          email:
            customer.email.trim(),

          phone:
            customer.phone.trim(),
        },

        deliveryAddress: {
          houseNumber:
            customer.address.trim(),

          apartment:
            customer.apartment.trim(),

          city:
            customer.city.trim(),

          state:
            customer.state.trim(),

          pinCode:
            customer.pincode.trim(),
        },

        items: items.map((product) => {
          const price =
            getProductPrice(product);

          const quantity =
            Number(product.quantity || 1);

          return {
            productId:
              getProductId(product),

            name:
              product.name || "Product",

            price,

            quantity,

            image:
              getProductImage(product),

            size:
              product.selectedSize ||
              product.size ||
              "",

            color:
              product.selectedColor ||
              product.color ||
              "",
          };
        }),

        paymentMethod:
          getPaymentMethodName(
            paymentMethod
          ),

        totalAmount: total,

        orderStatus: "Pending",
      };

      console.log(
        "Sending order:",
        orderData
      );

      // ================================================
      // SEND ORDER TO BACKEND
      // ================================================

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            orderData
          ),
        }
      );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let result = {};

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        result =
          await response.json();
      } else {
        const text =
          await response.text();

        console.error(
          "Server returned:",
          text
        );

        result = {
          message: text,
        };
      }

      // ================================================
      // HANDLE ERROR
      // ================================================

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Could not place order (${response.status})`
        );
      }

      console.log(
        "Order created successfully:",
        result
      );

      // Get MongoDB order ID
      const newOrderId =
        result?.order?._id ||
        result?._id ||
        `IRA-${Date.now()}`;

      setOrderId(newOrderId);

      // Clear shopping cart
      if (
        typeof clearCart ===
        "function"
      ) {
        clearCart();
      }

      // Show success screen
      setOrderPlaced(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(
        "Order placement error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // ======================================================
  // ORDER SUCCESS
  // ======================================================

  if (orderPlaced) {
    return (
      <main className="checkout-page">
        <section className="order-success">
          <CheckCircle2
            size={56}
            strokeWidth={1.5}
          />

          <p className="eyebrow">
            ORDER CONFIRMED
          </p>

          <h1>
            Thank you for your order.
          </h1>

          <p className="success-text">
            We've received your order
            successfully. Your order is now
            being processed and IRA THE LABEL
            will keep you updated.
          </p>

          <div className="order-id-box">
            <span>
              ORDER NUMBER
            </span>

            <strong>
              {orderId}
            </strong>
          </div>

          <div className="success-summary">
            <div>
              <Package size={18} />

              <span>
                {totalItems} item
                {totalItems !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

            <strong>
              {money(total)}
            </strong>
          </div>

          <button
            className="primary"
            onClick={() =>
              nav("home")
            }
          >
            Continue shopping
          </button>
        </section>
      </main>
    );
  }

  // ======================================================
  // EMPTY CHECKOUT
  // ======================================================

  if (!items.length) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <ShoppingBag
            size={42}
            strokeWidth={1.5}
          />

          <h2>
            Your bag is empty.
          </h2>

          <p>
            Add something to your shopping
            bag before proceeding to checkout.
          </p>

          <button
            className="primary"
            onClick={() =>
              nav("shop")
            }
          >
            Explore collection
          </button>
        </section>
      </main>
    );
  }

  // ======================================================
  // MAIN CHECKOUT
  // ======================================================

  return (
    <main className="checkout-page">

      {/* BACK BUTTON */}

      <button
        className="checkout-back"
        onClick={() => nav("cart")}
      >
        <ArrowLeft size={17} />
        Back to bag
      </button>

      {/* PAGE HEADER */}

      <header className="checkout-heading">
        <p className="eyebrow">
          SECURE CHECKOUT
        </p>

        <h1>
          Complete your order.
        </h1>

        <p>
          Enter your delivery details and
          choose your preferred payment
          method.
        </p>
      </header>

      {/* ERROR */}

      {error && (
        <div className="checkout-error">
          {error}
        </div>
      )}

      <div className="checkout-layout">

        {/* LEFT SIDE */}

        <section className="checkout-form">

          {/* CUSTOMER DETAILS */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <div className="checkout-title-icon">
                <User size={18} />
              </div>

              <div>
                <h2>
                  Customer details
                </h2>

                <p>
                  How can we contact you?
                </p>
              </div>

            </div>

            <div className="checkout-grid two">

              <div className="checkout-field">

                <label>
                  First name *
                </label>

                <input
                  type="text"
                  value={
                    customer.firstName
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "firstName",
                      event.target.value
                    )
                  }
                  placeholder="First name"
                />

              </div>

              <div className="checkout-field">

                <label>
                  Last name *
                </label>

                <input
                  type="text"
                  value={
                    customer.lastName
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "lastName",
                      event.target.value
                    )
                  }
                  placeholder="Last name"
                />

              </div>

            </div>

            <div className="checkout-grid two">

              <div className="checkout-field">

                <label>
                  Email address *
                </label>

                <input
                  type="email"
                  value={
                    customer.email
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                />

              </div>

              <div className="checkout-field">

                <label>
                  Phone number *
                </label>

                <input
                  type="tel"
                  value={
                    customer.phone
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="+91 00000 00000"
                />

              </div>

            </div>

          </div>

          {/* DELIVERY ADDRESS */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <div className="checkout-title-icon">
                <MapPin size={18} />
              </div>

              <div>
                <h2>
                  Delivery address
                </h2>

                <p>
                  Where should we send your
                  order?
                </p>
              </div>

            </div>

            <div className="checkout-field">

              <label>
                House number, street and area *
              </label>

              <input
                type="text"
                value={
                  customer.address
                }
                onChange={(event) =>
                  updateCustomer(
                    "address",
                    event.target.value
                  )
                }
                placeholder="House no., street, locality"
              />

            </div>

            <div className="checkout-field">

              <label>
                Apartment, floor or landmark
                <span className="optional">
                  Optional
                </span>
              </label>

              <input
                type="text"
                value={
                  customer.apartment
                }
                onChange={(event) =>
                  updateCustomer(
                    "apartment",
                    event.target.value
                  )
                }
                placeholder="Apartment, floor or nearby landmark"
              />

            </div>

            <div className="checkout-grid three">

              <div className="checkout-field">

                <label>
                  City *
                </label>

                <input
                  type="text"
                  value={
                    customer.city
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "city",
                      event.target.value
                    )
                  }
                  placeholder="City"
                />

              </div>

              <div className="checkout-field">

                <label>
                  State *
                </label>

                <input
                  type="text"
                  value={
                    customer.state
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "state",
                      event.target.value
                    )
                  }
                  placeholder="State"
                />

              </div>

              <div className="checkout-field">

                <label>
                  PIN code *
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    customer.pincode
                  }
                  onChange={(event) =>
                    updateCustomer(
                      "pincode",
                      event.target.value
                    )
                  }
                  placeholder="000000"
                />

              </div>

            </div>

          </div>

          {/* PAYMENT METHOD */}

          <div className="checkout-section">

            <div className="checkout-section-title">

              <div className="checkout-title-icon">
                <CreditCard size={18} />
              </div>

              <div>
                <h2>
                  Payment method
                </h2>

                <p>
                  Select how you would like
                  to pay.
                </p>
              </div>

            </div>

            <div className="payment-options">

              <label
                className={`payment-option ${
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod === "cod"
                  }
                  onChange={() =>
                    setPaymentMethod("cod")
                  }
                />

                <div className="payment-icon">
                  <Truck size={20} />
                </div>

                <div className="payment-copy">
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Pay for your order when
                    it arrives.
                  </span>
                </div>

                <span className="payment-radio" />

              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "online"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={
                    paymentMethod ===
                    "online"
                  }
                  onChange={() =>
                    setPaymentMethod(
                      "online"
                    )
                  }
                />

                <div className="payment-icon">
                  <CreditCard size={20} />
                </div>

                <div className="payment-copy">
                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    Pay securely using UPI,
                    card or other online
                    options.
                  </span>
                </div>

                <span className="payment-radio" />

              </label>

              <label
                className={`payment-option ${
                  paymentMethod === "bank"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={
                    paymentMethod === "bank"
                  }
                  onChange={() =>
                    setPaymentMethod("bank")
                  }
                />

                <div className="payment-icon">
                  <Landmark size={20} />
                </div>

                <div className="payment-copy">
                  <strong>
                    Bank Transfer
                  </strong>

                  <span>
                    Transfer instructions
                    will be provided after
                    your order.
                  </span>
                </div>

                <span className="payment-radio" />

              </label>

            </div>

          </div>

        </section>

        {/* RIGHT SIDE — ORDER SUMMARY */}

        <aside className="checkout-summary">

          <div className="checkout-summary-head">

            <div>
              <h2>
                Your order
              </h2>

              <span>
                {totalItems} item
                {totalItems !== 1
                  ? "s"
                  : ""}
              </span>
            </div>

          </div>

          {/* PRODUCTS */}

          <div className="checkout-products">

            {items.map(
              (product, index) => {
                const productId =
                  getProductId(product) ||
                  index;

                const image =
                  getProductImage(product);

                const price =
                  getProductPrice(product);

                const quantity =
                  Number(
                    product.quantity || 1
                  );

                return (
                  <div
                    className="checkout-product"
                    key={productId}
                  >

                    <div className="checkout-product-image">

                      {image ? (
                        <img
                          src={image}
                          alt={
                            product.name ||
                            "Product"
                          }
                        />
                      ) : (
                        <div className="checkout-no-image">
                          IRA
                        </div>
                      )}

                      <span className="product-quantity">
                        {quantity}
                      </span>

                    </div>

                    <div className="checkout-product-info">

                      <h4>
                        {product.name ||
                          "Product"}
                      </h4>

                      {product.category && (
                        <p>
                          {product.category}
                        </p>
                      )}

                      <span>
                        {money(price)} ×{" "}
                        {quantity}
                      </span>

                    </div>

                    <strong>
                      {money(
                        price * quantity
                      )}
                    </strong>

                  </div>
                );
              }
            )}

          </div>

          {/* TOTALS */}

          <div className="checkout-totals">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                {money(subtotal)}
              </strong>
            </div>

            <div>
              <span>
                Shipping
              </span>

              <strong>
                Free
              </strong>
            </div>

            <div className="checkout-total">

              <span>
                Total
              </span>

              <strong>
                {money(total)}
              </strong>

            </div>

          </div>

          {/* PLACE ORDER */}

          <button
            type="button"
            className="checkout-place-order"
            onClick={placeOrder}
            disabled={placingOrder}
          >
            {placingOrder
              ? "PLACING ORDER..."
              : `PLACE ORDER • ${money(
                  total
                )}`}
          </button>

          <p className="checkout-secure-text">

            <CheckCircle2 size={15} />

            Your personal and order details
            are securely submitted to IRA
            THE LABEL.

          </p>

        </aside>

      </div>
    </main>
  );
}

export default Checkout;