import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

// ======================================================
// API
// ======================================================

const API_URL =
  "https://ira-the-label.onrender.com";

// ======================================================
// HELPERS
// ======================================================

const money = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
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

  if (!image) {
    return "";
  }

  // Base64 image
  if (
    typeof image === "string" &&
    image.startsWith("data:image")
  ) {
    return image;
  }

  // Full image URL
  if (
    typeof image === "string" &&
    (image.startsWith("http://") ||
      image.startsWith("https://"))
  ) {
    return image;
  }

  // Backend image path
  return `https://ira-the-label.onrender.com${image}`;
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle2 size={17} />;

    case "Shipped":
      return <Truck size={17} />;

    case "Cancelled":
    case "Rejected":
      return <XCircle size={17} />;

    case "Processing":
    case "Accepted":
    case "Confirmed":
      return <Package size={17} />;

    default:
      return <Clock3 size={17} />;
  }
};

// ======================================================
// MY ORDERS
// ======================================================

function MyOrders({ customerId, nav }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // LOAD CUSTOMER ORDERS
  // ====================================================

  const loadOrders = async () => {
    if (!customerId) {
      setError(
        "Unable to identify this customer."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/orders/customer/${encodeURIComponent(
          customerId
        )}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Could not load your orders."
        );
      }

      setOrders(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "LOAD CUSTOMER ORDERS ERROR:",
        error
      );

      setError(
        error?.message ||
          "Something went wrong while loading your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOAD ORDERS WHEN PAGE OPENS
  // ====================================================

  useEffect(() => {
    loadOrders();
  }, [customerId]);

  // ====================================================
  // PAGE
  // ====================================================

  return (
    <main className="simple-page my-orders-page">

      {/* ==================================================
          BACK BUTTON
      ================================================== */}

      <button
        className="checkout-back"
        onClick={() => nav("home")}
      >
        <ArrowLeft size={17} />
        Back to store
      </button>

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="simple-page-heading">

        <p className="eyebrow">
          YOUR ORDERS
        </p>

        <h1>
          My orders.
        </h1>

        <p>
          View your order history and
          track the status of your
          purchases.
        </p>

      </div>

      {/* ==================================================
          LOADING
      ================================================== */}

      {loading && (
        <div className="empty-state">

          <Package
            size={38}
            strokeWidth={1.5}
          />

          <h3>
            Loading your orders...
          </h3>

          <p>
            Please wait while we
            fetch your order history.
          </p>

        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}

      {!loading && error && (
        <div className="empty-state">

          <XCircle
            size={38}
            strokeWidth={1.5}
          />

          <h3>
            Couldn't load your orders.
          </h3>

          <p>
            {error}
          </p>

          <button
            className="primary"
            onClick={loadOrders}
          >
            Try again
          </button>

        </div>
      )}

      {/* ==================================================
          NO ORDERS
      ================================================== */}

      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="empty-state">

            <Package
              size={42}
              strokeWidth={1.5}
            />

            <h3>
              No orders yet.
            </h3>

            <p>
              Once you place an order,
              it will appear here.
            </p>

            <button
              className="primary"
              onClick={() => nav("shop")}
            >
              Start shopping
            </button>

          </div>
        )}

      {/* ==================================================
          ORDERS
      ================================================== */}

      {!loading &&
        !error &&
        orders.length > 0 && (
          <div className="my-orders-list">

            {orders.map((order) => {

              const status =
                order.orderStatus ||
                "Pending";

              const statusClass =
                String(status)
                  .toLowerCase();

              const orderItems =
                Array.isArray(
                  order.items
                )
                  ? order.items
                  : [];

              const totalQuantity =
                orderItems.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.quantity || 1
                    ),
                  0
                );

              return (
                <article
                  className="my-order-card"
                  key={order._id}
                >

                  {/* ======================================
                      ORDER HEADER
                  ====================================== */}

                  <div className="my-order-header">

                    <div>

                      <p className="eyebrow">
                        ORDER
                      </p>

                      <h2>
                        #
                        {String(
                          order._id || ""
                        )
                          .slice(-8)
                          .toUpperCase()}
                      </h2>

                      <span>
                        {formatDate(
                          order.createdAt
                        )}
                      </span>

                    </div>

                    <div
                      className={`order-status ${statusClass}`}
                    >
                      {getStatusIcon(status)}

                      <span>
                        {status}
                      </span>
                    </div>

                  </div>

                  {/* ======================================
                      ORDER ITEMS
                  ====================================== */}

                  <div className="my-order-items">

                    {orderItems.map(
                      (item, index) => {

                        const image =
                          getProductImage(
                            item
                          );

                        const quantity =
                          Number(
                            item.quantity ||
                              1
                          );

                        const price =
                          Number(
                            item.price || 0
                          );

                        const itemTotal =
                          price *
                          quantity;

                        return (
                          <div
                            className="my-order-item"
                            key={`${order._id}-${index}`}
                          >

                            {/* PRODUCT IMAGE */}

                            <div className="my-order-image">

                              {image ? (
                                <img
                                  src={image}
                                  alt={
                                    item.name ||
                                    "Product"
                                  }
                                />
                              ) : (
                                <span>
                                  IRA
                                </span>
                              )}

                              <b>
                                {quantity}
                              </b>

                            </div>

                            {/* PRODUCT INFO */}

                            <div className="my-order-item-info">

                              <h3>
                                {item.name ||
                                  "Product"}
                              </h3>

                              {item.size && (
                                <p>
                                  Size:{" "}
                                  {item.size}
                                </p>
                              )}

                              {item.color && (
                                <p>
                                  Color:{" "}
                                  {item.color}
                                </p>
                              )}

                              <span>
                                {money(price)}
                                {" × "}
                                {quantity}
                              </span>

                            </div>

                            {/* ITEM TOTAL */}

                            <strong>
                              {money(
                                itemTotal
                              )}
                            </strong>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* ======================================
                      ORDER FOOTER
                  ====================================== */}

                  <div className="my-order-footer">

                    <div>

                      <span>
                        Items
                      </span>

                      <strong>
                        {totalQuantity}{" "}
                        {totalQuantity === 1
                          ? "item"
                          : "items"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Payment
                      </span>

                      <strong>
                        {order.paymentMethod ||
                          "—"}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Total
                      </span>

                      <strong>
                        {money(
                          order.totalAmount
                        )}
                      </strong>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

    </main>
  );
}

export default MyOrders;