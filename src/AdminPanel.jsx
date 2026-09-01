import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  X,
  Package,
  RefreshCw,
  ImagePlus,
  ShoppingBag,
  Clock3,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  ClipboardList,
  CircleDollarSign,
  AlertCircle,
  TrendingUp,
  Boxes,
  CalendarDays,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";

import "./styles.css";

const PRODUCTS_API_URL =
  "https://ira-the-label.onrender.com/api/products";

const ORDERS_API_URL =
  "https://ira-the-label.onrender.com/api/orders";
const PAYMENT_METHODS = ["COD", "UPI", "CARD"];

const emptyProduct = {
  name: "",
  description: "",
  category: "Kurtis",
  price: "",
  discount: "",
  stock: "",
  sizes: "",
  colors: "",
  paymentMethods: ["COD"],
};

const normalizePaymentMethods = (methods) => {
  let parsed = methods;

  if (typeof methods === "string") {
    try {
      parsed = JSON.parse(methods);
    } catch {
      parsed = methods
        .split(",")
        .map((item) => item.trim());
    }
  }

  const valid = Array.isArray(parsed)
    ? parsed.filter((method) =>
        PAYMENT_METHODS.includes(method)
      )
    : [];

  return valid.length
    ? [...new Set(valid)]
    : ["COD"];
};

export default function AdminPanel({ onBack }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    ...emptyProduct,
  });

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("success");

  const [selectedImages, setSelectedImages] =
    useState([]);

  const [imagePreviews, setImagePreviews] =
    useState([]);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [updatingOrder, setUpdatingOrder] =
    useState(null);

  // =========================
  // MESSAGE
  // =========================

  const showMessage = (
    text,
    type = "success"
  ) => {
    setMessage(text);
    setMessageType(type);

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  // =========================
  // ORDER STATUS HELPERS
  // =========================

  const normalizeStatus = (status) => {
    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (
      value === "accepted" ||
      value === "accept"
    ) {
      return "Accepted";
    }

    if (
      value === "rejected" ||
      value === "reject"
    ) {
      return "Rejected";
    }

    if (
      value === "cancelled" ||
      value === "canceled"
    ) {
      return "Cancelled";
    }

    return "Pending";
  };

  const normalizeOrder = (order) => {
    if (!order) return order;

    const normalizedStatus = normalizeStatus(
      order.status ??
        order.orderStatus ??
        "Pending"
    );

    return {
      ...order,
      status: normalizedStatus,
      orderStatus: normalizedStatus,
    };
  };

  // =========================
  // LOAD PRODUCTS
  // =========================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        PRODUCTS_API_URL,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Could not load products (${response.status})`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error(
        "Load products error:",
        error
      );

      setProducts([]);

      showMessage(
        `Could not load products: ${error.message}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);

      const response = await fetch(
        ORDERS_API_URL,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Could not load orders (${response.status})`
        );
      }

      const data = await response.json();

      const fetchedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      const cleanOrders =
        fetchedOrders.map(normalizeOrder);

      setOrders(cleanOrders);

      setSelectedOrder((currentOrder) => {
        if (!currentOrder) {
          return null;
        }

        const updatedOrder =
          cleanOrders.find(
            (order) =>
              String(order._id) ===
              String(currentOrder._id)
          );

        return updatedOrder || currentOrder;
      });
    } catch (error) {
      console.error(
        "Load orders error:",
        error
      );

      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // =========================
  // LOAD DASHBOARD
  // =========================

  const loadDashboard = async () => {
    setMessage("");

    await Promise.all([
      loadProducts(),
      loadOrders(),
    ]);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =========================
  // FORM HANDLERS
  // =========================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () =>
        resolve(reader.result);

      reader.onerror = () =>
        reject(
          new Error("Could not read image")
        );

      reader.readAsDataURL(file);
    });

  const handleImageChange = async (
    event
  ) => {
    const files = Array.from(
      event.target.files
    );

    if (!files.length) return;

    try {
      const imageData = await Promise.all(
        files.map((file) =>
          fileToBase64(file)
        )
      );

      setSelectedImages((current) => [
        ...current,
        ...imageData,
      ]);

      setImagePreviews((current) => [
        ...current,
        ...imageData,
      ]);
    } catch (error) {
      showMessage(
        "Could not process selected image.",
        "error"
      );
    }

    event.target.value = "";
  };

  const removeImage = (index) => {
    setSelectedImages((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );

    setImagePreviews((current) =>
      current.filter(
        (_, imageIndex) =>
          imageIndex !== index
      )
    );
  };

  const resetForm = () => {
    setForm({
      ...emptyProduct,
    });

    setEditingId(null);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const closeProductModal = () => {
    setShowForm(false);
    resetForm();
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (product) => {
    setEditingId(product._id);

    setForm({
      name: product.name || "",

      description:
        product.description || "",

      category:
        product.category || "Kurtis",

      price: product.price ?? "",

      discount:
        product.discount ?? "",

      stock: product.stock ?? "",

      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : product.sizes || "",

      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : product.colors || "",

      paymentMethods: normalizePaymentMethods(product.paymentMethods),
    });

    const existingImages =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images
        : product.image
        ? [product.image]
        : [];

    setSelectedImages(existingImages);
    setImagePreviews(existingImages);
    setShowForm(true);
  };

  // =========================
  // PAYMENT METHOD HELPERS
  // =========================

  const togglePaymentMethod = (method) => {
    setForm((current) => {
      const currentMethods =
        Array.isArray(current.paymentMethods) &&
        current.paymentMethods.length > 0
          ? current.paymentMethods
          : ["COD"];

      const isSelected =
        currentMethods.includes(method);

      // Never allow all payment methods to be disabled.
      if (isSelected && currentMethods.length === 1) {
        showMessage(
          "At least one payment method must remain selected.",
          "error"
        );
        return current;
      }

      const nextMethods = isSelected
        ? currentMethods.filter(
            (item) => item !== method
          )
        : [...currentMethods, method];

      return {
        ...current,
        paymentMethods: normalizePaymentMethods(nextMethods),
      };
    });
  };

  // =========================
  // SAVE PRODUCT
  // =========================

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      showMessage(
        "Please enter a product name.",
        "error"
      );

      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      showMessage(
        "Please enter a valid price.",
        "error"
      );

      return;
    }

    setSaving(true);

    const productData = {
      name: form.name.trim(),

      description:
        form.description.trim(),

      category: form.category,

      price: Number(form.price),

      discount: Number(
        form.discount || 0
      ),

      stock: Number(
        form.stock || 0
      ),

      sizes: form.sizes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      colors: form.colors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      paymentMethods: normalizePaymentMethods(form.paymentMethods),

      images: selectedImages,
    };

    try {
      const url = editingId
        ? `${PRODUCTS_API_URL}/${editingId}`
        : PRODUCTS_API_URL;

      const response = await fetch(url, {
        method: editingId
          ? "PUT"
          : "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          productData
        ),
      });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Could not save product"
        );
      }

      showMessage(
        editingId
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      closeProductModal();

      await loadProducts();
    } catch (error) {
      showMessage(
        `Could not save product: ${error.message}`,
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const deleteProduct = async (
    id,
    name
  ) => {
    const confirmed = window.confirm(
      `Delete "${name}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${PRODUCTS_API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Could not delete product"
        );
      }

      showMessage(
        "Product deleted successfully!"
      );

      await loadProducts();
    } catch (error) {
      showMessage(
        `Could not delete product: ${error.message}`,
        "error"
      );
    }
  };

  // ======================================================
  // DELETE ORDER
  // ======================================================

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this order? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      setUpdatingOrder(orderId);

      const response = await fetch(
        `${ORDERS_API_URL}/${orderId}`,
        {
          method: "DELETE",
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch (error) {
        console.error(
          "Could not parse delete response:",
          error
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Could not delete order"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.filter(
          (order) =>
            String(order._id) !== String(orderId)
        )
      );

      setSelectedOrder((currentOrder) =>
        currentOrder &&
        String(currentOrder._id) === String(orderId)
          ? null
          : currentOrder
      );

      showMessage(
        data.message || "Order deleted successfully!"
      );

      await loadOrders();
    } catch (error) {
      console.error("Delete order error:", error);

      showMessage(
        error.message || "Could not delete order.",
        "error"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  // ======================================================
  // UPDATE ORDER STATUS / REJECT ORDER
  // ======================================================

  const updateOrderStatus = async (orderId, newStatus) => {
    const normalizedNewStatus = normalizeStatus(newStatus);

    // ====================================================
    // REJECT ORDER = DELETE IT COMPLETELY
    // ====================================================

    if (normalizedNewStatus === "Rejected") {
      const confirmed = window.confirm(
        "Are you sure you want to reject this order? This will permanently delete the order."
      );

      if (!confirmed) return;

      try {
        setUpdatingOrder(orderId);

        console.log("Deleting rejected order:", orderId);

        const response = await fetch(
          `${ORDERS_API_URL}/${orderId}`,
          {
            method: "DELETE",
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          console.error(
            "Could not parse delete response:",
            error
          );
        }

        console.log("Delete order response:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Could not delete order"
          );
        }

        // Remove order immediately from admin dashboard
        setOrders((currentOrders) =>
          currentOrders.filter(
            (order) =>
              String(order._id) !== String(orderId)
          )
        );

        // Close the order details modal
        setSelectedOrder(null);

        showMessage(
          "Order rejected and deleted successfully!"
        );

        // Refresh from database
        await loadOrders();
      } catch (error) {
        console.error(
          "Reject/delete order error:",
          error
        );

        showMessage(
          error.message ||
            "Could not reject the order.",
          "error"
        );
      } finally {
        setUpdatingOrder(null);
      }

      return;
    }

    // ====================================================
    // ACCEPT ORDER = ONLY UPDATE STATUS
    // ====================================================

    if (normalizedNewStatus === "Accepted") {
      const confirmed = window.confirm(
        "Are you sure you want to accept this order?"
      );

      if (!confirmed) return;

      try {
        setUpdatingOrder(orderId);

        console.log(
          "Accepting order:",
          orderId
        );

        const response = await fetch(
          `${ORDERS_API_URL}/${orderId}/status`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              orderStatus: "Accepted",
            }),
          }
        );

        let data = {};

        try {
          data = await response.json();
        } catch (error) {
          console.error(
            "Could not parse server response:",
            error
          );
        }

        console.log(
          "Order update response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not accept order"
          );
        }

        const backendOrder =
          data.order ||
          data.updatedOrder ||
          data.data ||
          {};

        const updatedOrder = normalizeOrder({
          ...backendOrder,

          _id:
            backendOrder._id ||
            orderId,

          status:
            backendOrder.status ??
            "Accepted",

          orderStatus:
            backendOrder.orderStatus ??
            "Accepted",
        });

        // Update order card immediately
        setOrders((currentOrders) =>
          currentOrders.map((order) => {
            if (
              String(order._id) !==
              String(orderId)
            ) {
              return order;
            }

            return normalizeOrder({
              ...order,
              ...updatedOrder,

              status: "Accepted",

              orderStatus: "Accepted",
            });
          })
        );

        // Update open modal
        setSelectedOrder((currentOrder) => {
          if (
            !currentOrder ||
            String(currentOrder._id) !==
              String(orderId)
          ) {
            return currentOrder;
          }

          return normalizeOrder({
            ...currentOrder,
            ...updatedOrder,

            status: "Accepted",

            orderStatus: "Accepted",
          });
        });

        showMessage(
          data.message ||
            "Order accepted successfully!"
        );

        // Refresh from database
        await loadOrders();
      } catch (error) {
        console.error(
          "Accept order error:",
          error
        );

        showMessage(
          error.message ||
            "Could not accept order.",
          "error"
        );
      } finally {
        setUpdatingOrder(null);
      }
    }
  };

  // =========================
  // HELPERS
  // =========================

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("data:image") ||
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `https://ira-the-label.onrender.com${image}`;
  };

  const getImage = (product) => {
    const image =
      product.images?.[0] ||
      product.image ||
      "";

    return getImageUrl(image);
  };

  const getCustomerName = (order) => {
    if (order.customerName) {
      return order.customerName;
    }

    const customer =
      order.customer ||
      order.customerDetails ||
      {};

    const name = [
      customer.firstName,
      customer.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    return name || "Customer";
  };

  const getCustomerPhone = (order) =>
    order.phone ||
    order.customer?.phone ||
    order.customerDetails?.phone ||
    "Not provided";

  const getAddress = (order) => {
    const address =
      order.address ||
      order.deliveryAddress ||
      {};

    const parts = [
      address.houseNumber ||
        address.house ||
        address.street,

      address.apartment ||
        address.landmark,

      address.city,

      address.state,

      address.pinCode ||
        address.pincode,
    ].filter(Boolean);

    return (
      parts.join(", ") ||
      "Address not available"
    );
  };

  const getOrderItems = (order) => {
    if (Array.isArray(order.items)) {
      return order.items;
    }

    if (Array.isArray(order.products)) {
      return order.products;
    }

    return [];
  };

  const getOrderImage = (item) => {
    const image =
      item.image ||
      item.product?.image ||
      item.productImage ||
      item.product?.images?.[0] ||
      "";

    return getImageUrl(image);
  };

  const formatDate = (date) => {
    if (!date) return "Just now";

    const parsed = new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return "Just now";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getOrderStatus = (order) => {
    return normalizeStatus(
      order?.status ??
        order?.orderStatus ??
        "Pending"
    );
  };

  const getStatusClass = (status) =>
    String(status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");

  // =========================
  // DASHBOARD STATS
  // =========================

  const totalStock = products.reduce(
    (total, product) =>
      total +
      Number(product.stock || 0),
    0
  );

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      getOrderStatus(order)
        .toLowerCase() === "pending"
  ).length;

  const acceptedOrders = orders.filter(
    (order) =>
      getOrderStatus(order)
        .toLowerCase() === "accepted"
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) =>
      total +
      Number(
        order.totalAmount ||
          order.total ||
          0
      ),
    0
  );

  return (
    <div className="admin-page">

      {/* ================= TOP BAR ================= */}

      <header className="dashboard-topbar">

        <div className="dashboard-brand">

          <div className="brand-mark">
            IRA
          </div>

          <div>
            <span>
              STORE MANAGEMENT
            </span>

            <h2>
              IRA THE LABEL
            </h2>
          </div>

        </div>

        <div className="dashboard-top-actions">

          <button
            className="refresh-button"
            onClick={loadDashboard}
            type="button"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="add-product-button"
            onClick={openAddForm}
            type="button"
          >
            <Plus size={18} />
            Add Product
          </button>

        </div>

      </header>

      <main className="dashboard-main">

        {/* ================= WELCOME ================= */}

        <section className="dashboard-welcome">

          <div>

            <div className="dashboard-breadcrumb">
              <LayoutDashboard size={15} />
              ADMIN DASHBOARD
            </div>

            <h1>
              Welcome to your{" "}
              <span>
                Dashboard
              </span>
            </h1>

            <p>
              Manage your products, inventory and
              customer orders from one place.
            </p>

          </div>

          <button
            className="back-store-button"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft size={16} />
            Back to Store
          </button>

        </section>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div
            className={`admin-message ${messageType}`}
          >

            {messageType === "error" ? (
              <AlertCircle size={19} />
            ) : (
              <CheckCircle2 size={19} />
            )}

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage("")
              }
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* ================= STATS ================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="stat-icon products-icon">
              <Package size={21} />
            </div>

            <div className="stat-content">

              <span>
                Total Products
              </span>

              <strong>
                {products.length}
              </strong>

              <small>
                <TrendingUp size={13} />
                Your active collection
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon stock-icon">
              <Boxes size={21} />
            </div>

            <div className="stat-content">

              <span>
                Available Stock
              </span>

              <strong>
                {totalStock}
              </strong>

              <small>
                Units in inventory
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card">

            <div className="stat-icon orders-icon">
              <ClipboardList size={21} />
            </div>

            <div className="stat-content">

              <span>
                Total Orders
              </span>

              <strong>
                {totalOrders}
              </strong>

              <small>
                {acceptedOrders} accepted orders
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card attention-card">

            <div className="stat-icon pending-icon">
              <Clock3 size={21} />
            </div>

            <div className="stat-content">

              <span>
                Pending Review
              </span>

              <strong>
                {pendingOrders}
              </strong>

              <small>
                Orders awaiting action
              </small>

            </div>

          </div>

          <div className="dashboard-stat-card revenue-card">

            <div className="stat-icon revenue-icon">
              <CircleDollarSign size={21} />
            </div>

            <div className="stat-content">

              <span>
                Total Revenue
              </span>

              <strong>
                ₹
                {totalRevenue.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <small>
                Based on all orders
              </small>

            </div>

          </div>

        </section>

        {/* ================= ORDERS ================= */}

        <section className="dashboard-section">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                ORDER MANAGEMENT
              </span>

              <h2>
                Customer Orders
              </h2>

              <p>
                Review incoming orders and manage
                their status.
              </p>

            </div>

            <div className="section-badge">
              <Clock3 size={15} />
              {pendingOrders} Pending
            </div>

          </div>

          {ordersLoading ? (

            <div className="admin-loading">
              <Loader2
                className="loading-spinner"
                size={25}
              />
              Loading customer orders...
            </div>

          ) : orders.length === 0 ? (

            <div className="admin-empty">

              <ShoppingBag size={38} />

              <h3>
                No orders yet
              </h3>

              <p>
                New customer orders will appear
                here.
              </p>

            </div>

          ) : (

            <div className="order-dashboard-grid">

              {orders.map((order) => {
                const orderItems =
                  getOrderItems(order);

                const orderStatus =
                  getOrderStatus(order);

                const orderTotal = Number(
                  order.totalAmount ||
                    order.total ||
                    0
                );

                return (
                  <div
                    className="order-dashboard-card"
                    key={order._id}
                  >

                    <div className="order-card-top">

                      <div className="order-number-block">

                        <div className="order-card-icon">
                          <ShoppingBag size={19} />
                        </div>

                        <div>

                          <span>
                            ORDER
                          </span>

                          <h3>
                            #
                            {String(
                              order._id || ""
                            )
                              .slice(-6)
                              .toUpperCase()}
                          </h3>

                        </div>

                      </div>

                      <span
                        className={`order-status ${getStatusClass(
                          orderStatus
                        )}`}
                      >
                        {orderStatus}
                      </span>

                    </div>

                    <div className="order-card-customer">

                      <User size={16} />

                      <div>

                        <span>
                          Customer
                        </span>

                        <strong>
                          {getCustomerName(order)}
                        </strong>

                      </div>

                    </div>

                    <div className="order-card-meta">

                      <div>
                        <CalendarDays size={15} />

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>
                      </div>

                      <div>
                        <Package size={15} />

                        <span>
                          {orderItems.length}{" "}
                          {orderItems.length === 1
                            ? "item"
                            : "items"}
                        </span>
                      </div>

                    </div>

                    <div className="order-card-bottom">

                      <div className="order-card-price">

                        <span>
                          Order Total
                        </span>

                        <strong>
                          ₹
                          {orderTotal.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <button
                          className="view-order-button"
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              normalizeOrder(order)
                            )
                          }
                        >
                          View Details
                          <ChevronRight size={17} />
                        </button>

                        <button
                          className="delete-order"
                          type="button"
                          title="Delete order"
                          disabled={
                            String(updatingOrder) ===
                            String(order._id)
                          }
                          onClick={() =>
                            deleteOrder(order._id)
                          }
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            padding: "10px 12px",
                            border: "1px solid #d9c5c5",
                            borderRadius: "8px",
                            background: "transparent",
                            cursor:
                              String(updatingOrder) ===
                              String(order._id)
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {String(updatingOrder) ===
                          String(order._id) ? (
                            <Loader2
                              className="loading-spinner"
                              size={16}
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete
                        </button>
                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

        {/* ================= PRODUCTS ================= */}

        <section className="dashboard-section products-section">

          <div className="section-header">

            <div>

              <span className="section-eyebrow">
                INVENTORY MANAGEMENT
              </span>

              <h2>
                Your Collection
              </h2>

              <p>
                Manage products, prices and
                available inventory.
              </p>

            </div>

            <button
              className="add-product-button small-add"
              onClick={openAddForm}
              type="button"
            >
              <Plus size={17} />
              Add Product
            </button>

          </div>

          {loading ? (

            <div className="admin-loading">
              <Loader2
                className="loading-spinner"
                size={25}
              />
              Loading products...
            </div>

          ) : products.length === 0 ? (

            <div className="admin-empty">

              <Package size={38} />

              <h3>
                Your collection is empty
              </h3>

              <p>
                Start building your collection by
                adding your first product.
              </p>

              <button
                className="add-product-button"
                onClick={openAddForm}
                type="button"
              >
                <Plus size={18} />
                Add First Product
              </button>

            </div>

          ) : (

            <div className="admin-product-grid">

              {products.map((product) => {
                const image =
                  getImage(product);

                return (
                  <div
                    className="admin-product-card"
                    key={product._id}
                  >

                    <div className="admin-product-image">

                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                        />
                      ) : (
                        <div className="admin-no-image">
                          IRA
                        </div>
                      )}

                      <span className="admin-category">
                        {product.category}
                      </span>

                    </div>

                    <div className="admin-product-info">

                      <h3>
                        {product.name}
                      </h3>

                      <div className="product-price-row">

                        <strong>
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        {Number(
                          product.discount
                        ) > 0 && (
                          <span>
                            {product.discount}% OFF
                          </span>
                        )}

                      </div>

                      <div className="product-stock-info">

                        <span>
                          Available Stock
                        </span>

                        <strong>
                          {product.stock || 0}
                        </strong>

                      </div>

                      <div className="admin-product-actions">

                        <button
                          className="edit-product"
                          type="button"
                          onClick={() =>
                            openEditForm(product)
                          }
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>

                        <button
                          className="delete-product"
                          type="button"
                          onClick={() =>
                            deleteProduct(
                              product._id,
                              product.name
                            )
                          }
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </section>

      </main>

      {/* ================= ORDER DETAILS MODAL ================= */}

      {selectedOrder &&
        (() => {

          const orderItems =
            getOrderItems(selectedOrder);

          const orderStatus =
            getOrderStatus(selectedOrder);

          const paymentMethod =
            selectedOrder.paymentMethod ||
            "Cash on Delivery";

          const orderTotal = Number(
            selectedOrder.totalAmount ||
              selectedOrder.total ||
              0
          );

          const isPending =
            orderStatus.toLowerCase() ===
            "pending";

          const isUpdating =
            String(updatingOrder) ===
            String(selectedOrder._id);

          return (
            <div className="admin-modal-overlay">

              <div className="order-details-modal">

                <div className="order-modal-header">

                  <div>

                    <span className="section-eyebrow">
                      CUSTOMER ORDER
                    </span>

                    <div className="modal-order-heading">

                      <h2>
                        Order #
                        {String(
                          selectedOrder._id || ""
                        )
                          .slice(-6)
                          .toUpperCase()}
                      </h2>

                      <span
                        className={`order-status ${getStatusClass(
                          orderStatus
                        )}`}
                      >
                        {orderStatus}
                      </span>

                    </div>

                    <p>
                      Placed on{" "}
                      {formatDate(
                        selectedOrder.createdAt
                      )}
                    </p>

                  </div>

                  <button
                    className="modal-close"
                    type="button"
                    onClick={() =>
                      setSelectedOrder(null)
                    }
                  >
                    <X size={21} />
                  </button>

                </div>

                <div className="order-summary-grid">

                  <div className="summary-card">

                    <User size={19} />

                    <div>

                      <span>
                        Customer
                      </span>

                      <strong>
                        {getCustomerName(
                          selectedOrder
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="summary-card">

                    <Phone size={19} />

                    <div>

                      <span>
                        Phone Number
                      </span>

                      <strong>
                        {getCustomerPhone(
                          selectedOrder
                        )}
                      </strong>

                    </div>

                  </div>

                  <div className="summary-card">

                    <CreditCard size={19} />

                    <div>

                      <span>
                        Payment
                      </span>

                      <strong>
                        {paymentMethod}
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="order-info-block">

                  <div className="info-block-title">

                    <MapPin size={18} />

                    <h3>
                      Delivery Address
                    </h3>

                  </div>

                  <p>
                    {getAddress(selectedOrder)}
                  </p>

                </div>

                <div className="order-info-block">

                  <div className="info-block-title">

                    <Package size={18} />

                    <h3>
                      Ordered Products
                    </h3>

                    <span>
                      {orderItems.length} items
                    </span>

                  </div>

                  <div className="modal-order-products">

                    {orderItems.map(
                      (item, index) => {

                        const itemImage =
                          getOrderImage(item);

                        const itemName =
                          item.name ||
                          item.product?.name ||
                          "Product";

                        const itemQuantity =
                          item.quantity ||
                          item.qty ||
                          1;

                        const itemPrice = Number(
                          item.price ||
                            item.product?.price ||
                            0
                        );

                        return (
                          <div
                            className="modal-order-item"
                            key={
                              item._id || index
                            }
                          >

                            <div className="modal-order-image">

                              {itemImage ? (
                                <img
                                  src={itemImage}
                                  alt={itemName}
                                />
                              ) : (
                                <Package size={20} />
                              )}

                            </div>

                            <div className="modal-order-item-info">

                              <strong>
                                {itemName}
                              </strong>

                              <span>
                                Quantity:{" "}
                                {itemQuantity}
                              </span>

                            </div>

                            <strong className="modal-item-price">

                              ₹
                              {(
                                itemPrice *
                                itemQuantity
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </strong>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                <div className="order-modal-footer">

                  <div className="order-final-total">

                    <span>
                      Order Total
                    </span>

                    <strong>
                      ₹
                      {orderTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  {isPending && (

                    <div className="order-bottom-actions">

                      <button
                        className="reject-order"
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateOrderStatus(
                            selectedOrder._id,
                            "Rejected"
                          )
                        }
                      >

                        {isUpdating ? (
                          <Loader2
                            className="loading-spinner"
                            size={18}
                          />
                        ) : (
                          <XCircle size={18} />
                        )}

                        Reject

                      </button>

                      <button
                        className="accept-order"
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateOrderStatus(
                            selectedOrder._id,
                            "Accepted"
                          )
                        }
                      >

                        {isUpdating ? (
                          <Loader2
                            className="loading-spinner"
                            size={18}
                          />
                        ) : (
                          <CheckCircle2 size={18} />
                        )}

                        Accept Order

                      </button>

                    </div>
                  )}

                </div>

              </div>

            </div>
          );
        })()}

      {/* ================= PRODUCT MODAL ================= */}

      {showForm && (

        <div className="admin-modal-overlay">

          <div className="admin-modal">

            <div className="admin-modal-head">

              <div>

                <span className="section-eyebrow">
                  IRA THE LABEL
                </span>

                <h2>
                  {editingId
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

              </div>

              <button
                className="modal-close"
                type="button"
                onClick={closeProductModal}
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={saveProduct}>

              <div className="admin-form-grid">

                <div className="form-field">

                  <label>
                    Product Name *
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Rose Kurti"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option>
                      Kurtis
                    </option>

                    <option>
                      Suits
                    </option>

                    <option>
                      Sets
                    </option>

                    <option>
                      Co-ords
                    </option>

                    <option>
                      Dresses
                    </option>
                  </select>

                </div>

                <div className="form-field">

                  <label>
                    Price *
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-field">

                  <label>
                    Discount (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    name="discount"
                    value={form.discount}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-field">

                  <label>
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-field">

                  <label>
                    Sizes
                  </label>

                  <input
                    name="sizes"
                    value={form.sizes}
                    onChange={handleChange}
                    placeholder="S, M, L, XL"
                  />

                </div>

                <div className="form-field">

                  <label>
                    Colors
                  </label>

                  <input
                    name="colors"
                    value={form.colors}
                    onChange={handleChange}
                    placeholder="Rose, White, Black"
                  />

                </div>
                <div className="form-field full-field">
                  <div className="payment-method-heading">
                    <div>
                      <label>Payment Methods</label>
                      <p className="payment-method-description">
                        Choose how customers can pay for this product.
                      </p>
                    </div>

                    <span className="payment-method-count">
                      {form.paymentMethods?.length || 1} selected
                    </span>
                  </div>

                  <div className="payment-method-options">
                    {[
                      {
                        method: "COD",
                        label: "Cash on Delivery",
                        description: "Pay when the order arrives",
                        Icon: Banknote,
                      },
                      {
                        method: "UPI",
                        label: "UPI / Online",
                        description: "Fast digital payment",
                        Icon: Smartphone,
                      },
                      {
                        method: "CARD",
                        label: "Card",
                        description: "Credit or debit card",
                        Icon: CreditCard,
                      },
                    ].map(
                      ({
                        method,
                        label,
                        description,
                        Icon,
                      }) => {
                        const checked =
                          Array.isArray(form.paymentMethods) &&
                          form.paymentMethods.includes(method);

                        return (
                          <button
                            key={method}
                            type="button"
                            className={`payment-method-option ${
                              checked ? "selected" : ""
                            }`}
                            onClick={() =>
                              togglePaymentMethod(method)
                            }
                            aria-pressed={checked}
                          >
                            <span className="payment-method-icon">
                              <Icon size={20} strokeWidth={1.8} />
                            </span>

                            <span className="payment-method-copy">
                              <strong>{label}</strong>
                              <small>{description}</small>
                            </span>

                            <span
                              className={`payment-method-check ${
                                checked ? "checked" : ""
                              }`}
                              aria-hidden="true"
                            >
                              {checked && <CheckCircle2 size={19} />}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>

                  <p className="payment-method-hint">
                    Select at least one payment method. Changes are saved
                    with the product.
                  </p>
                </div>


                <div className="form-field full-field">

                  <label>
                    Product Images
                  </label>

                  <label className="image-upload-box">

                    <ImagePlus size={25} />

                    <span>
                      Click to upload product images
                    </span>

                    <small>
                      Select one or multiple images
                    </small>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      hidden
                    />

                  </label>

                  {imagePreviews.length > 0 && (

                    <div className="image-preview-grid">

                      {imagePreviews.map(
                        (image, index) => (

                          <div
                            className="image-preview-item"
                            key={`${image}-${index}`}
                          >

                            <img
                              src={getImageUrl(
                                image
                              )}
                              alt={`Preview ${
                                index + 1
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(index)
                              }
                            >
                              <X size={15} />
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

                <div className="form-field full-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Write a detailed product description..."
                    rows="5"
                  />

                </div>

              </div>

              <div className="admin-form-actions">

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeProductModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="add-product-button"
                  disabled={saving}
                >

                  {saving ? (
                    <>
                      <Loader2
                        className="loading-spinner"
                        size={17}
                      />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}