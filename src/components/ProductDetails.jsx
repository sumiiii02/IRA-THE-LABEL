import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

export default function ProductDetails({
  product,
  onBack,
  addToCart,
  onBuyNow,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [openSection, setOpenSection] = useState("details");
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Reset product selections when product changes
  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setSelectedImage(0);
    setOpenSection("details");
    setShowSizeGuide(false);
  }, [product]);

  // Close size guide with ESC key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowSizeGuide(false);
      }
    };

    if (showSizeGuide) {
      window.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showSizeGuide]);

  // ==========================================
  // IMAGE URL HELPER
  // ==========================================

  const getImageUrl = (image) => {
    if (!image || typeof image !== "string") return "";

    if (image.startsWith("data:image")) {
      return image;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    if (image.startsWith("/")) {
      return `https://ira-the-label.onrender.com${image}`;
    }

    return image;
  };

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <main className="ira-product-page">
        <div className="ira-product-not-found">
          <h1>Product not found</h1>

          <button
            type="button"
            className="ira-back-button"
            onClick={onBack}
          >
            <ArrowLeft size={17} />
            Back to Collection
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // PRODUCT IMAGES
  // ==========================================

  let images = [];

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    images = product.images
      .map(getImageUrl)
      .filter(Boolean);
  }

  if (images.length === 0 && product.image) {
    images = [getImageUrl(product.image)];
  }

  // ==========================================
  // PRODUCT DATA
  // ==========================================

  const price = Number(product.price || 0);
  const discount = Number(product.discount || 0);

  const stock =
    product.stock === undefined ||
    product.stock === null ||
    product.stock === ""
      ? Infinity
      : Number(product.stock);

  const isInStock = stock > 0;

  const originalPrice =
    discount > 0 && discount < 100
      ? Math.round(price / (1 - discount / 100))
      : null;

  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === "string"
    ? product.sizes
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean)
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors
    : typeof product.colors === "string"
    ? product.colors
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean)
    : [];

  const currentImage =
    images[
      Math.min(
        selectedImage,
        Math.max(images.length - 1, 0)
      )
    ] || "";

  // ==========================================
  // VALIDATE SELECTION
  // ==========================================

  const validateSelection = () => {
    if (!isInStock) {
      alert("Sorry, this product is currently out of stock.");
      return false;
    }

    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size first.");
      return false;
    }

    return true;
  };

  // ==========================================
  // CREATE SELECTED PRODUCT
  // ==========================================

  const getSelectedProduct = () => {
    return {
      ...product,
      selectedSize,
      selectedColor,
      quantity,
    };
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    if (typeof addToCart !== "function") {
      console.error(
        "addToCart function was not passed to ProductDetails"
      );

      alert("Cart could not be updated.");
      return;
    }

    addToCart(getSelectedProduct(), quantity);

    alert("Added to your bag!");
  };

  // ==========================================
  // BUY NOW
  // ==========================================

  const handleBuyNow = () => {
    if (!validateSelection()) return;

    if (typeof onBuyNow !== "function") {
      console.error(
        "onBuyNow function was not passed to ProductDetails"
      );

      alert("Checkout is currently unavailable.");
      return;
    }

    onBuyNow(getSelectedProduct(), quantity);
  };

  // ==========================================
  // QUANTITY
  // ==========================================

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (
        Number.isFinite(stock) &&
        current >= stock
      ) {
        return current;
      }

      return current + 1;
    });
  };

  // ==========================================
  // ACCORDION
  // ==========================================

  const toggleSection = (section) => {
    setOpenSection((current) =>
      current === section ? "" : section
    );
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .ira-product-page {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 28px 40px 80px;
          color: #2f3036;
          background: #ffffff;
        }

        /* BACK BUTTON */

        .ira-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          padding: 6px 0;
          color: #777;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: 0.2s ease;
        }

        .ira-back-button:hover {
          color: #2f3036;
          transform: translateX(-2px);
        }

        .ira-product-not-found {
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        /* MAIN LAYOUT */

        .ira-product-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.85fr);
          gap: 65px;
          align-items: start;
        }

        /* PRODUCT GALLERY */

        .ira-gallery {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .ira-thumbnails {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
        }

        .ira-thumbnail {
          width: 64px;
          height: 80px;
          padding: 0;
          border: 1px solid #e4e4e4;
          background: #ffffff;
          cursor: pointer;
          overflow: hidden;
          transition: 0.2s ease;
        }

        .ira-thumbnail:hover {
          border-color: #777;
        }

        .ira-thumbnail.active {
          border: 2px solid #30323a;
        }

        .ira-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .ira-main-image-wrap {
          width: 78%;
          max-width: 460px;
          margin: 0 auto;
          background: #f7f7f7;
          position: relative;
          overflow: hidden;
        }

        .ira-main-image {
          width: 100%;
          height: 560px;
          display: block;
          object-fit: contain;
          background: #f7f7f7;
        }

        .ira-no-image {
          width: 100%;
          height: 560px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          color: #888;
          background: #f7f7f7;
        }

        .ira-sale-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 7px 11px;
          background: #30323a;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        /* PRODUCT INFO */

        .ira-product-info {
          width: 100%;
          padding-top: 8px;
        }

        .ira-category {
          margin: 0 0 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #9a9a9a;
        }

        .ira-product-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 50px);
          font-weight: 500;
          line-height: 1.08;
          color: #30323a;
          text-transform: lowercase;
        }

        .ira-price-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 22px;
        }

        .ira-price {
          font-size: 23px;
          font-weight: 700;
          color: #30323a;
        }

        .ira-old-price {
          font-size: 15px;
          color: #a0a0a0;
        }

        .ira-discount {
          padding: 5px 9px;
          background: #f5ecec;
          color: #a05252;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .ira-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          font-size: 13px;
          font-weight: 500;
        }

        .ira-stock-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
        }

        .ira-description {
          margin: 22px 0 0;
          max-width: 520px;
          color: #757575;
          font-size: 14px;
          line-height: 1.75;
        }

        .ira-divider {
          width: 100%;
          height: 1px;
          background: #e9e9e9;
          margin: 28px 0;
        }

        /* PRODUCT SELECTION */

        .ira-section {
          margin-bottom: 25px;
        }

        .ira-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 13px;
        }

        .ira-label {
          font-size: 13px;
          font-weight: 700;
          color: #444;
        }

        .ira-size-guide {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: #8b6a6f;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 4px 0;
          transition: 0.2s ease;
        }

        .ira-size-guide:hover {
          color: #30323a;
        }

        .ira-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .ira-size-button {
          min-width: 50px;
          height: 44px;
          padding: 0 15px;
          border: 1px solid #dedede;
          background: #ffffff;
          color: #333;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ira-size-button:hover {
          border-color: #555;
        }

        .ira-size-button.active {
          background: #30323a;
          color: #ffffff;
          border-color: #30323a;
        }

        /* COLORS */

        .ira-colors {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 13px;
        }

        .ira-color-button {
          width: 36px;
          height: 36px;
          padding: 3px;
          border: 1px solid transparent;
          background: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ira-color-button:hover {
          transform: scale(1.05);
        }

        .ira-color-button.active {
          border-color: #30323a;
        }

        .ira-color-circle {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid #ddd;
        }

        /* QUANTITY */

        .ira-quantity-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 8px;
        }

        .ira-quantity-box {
          height: 46px;
          display: flex;
          align-items: center;
          border: 1px solid #dedede;
          background: #ffffff;
        }

        .ira-quantity-box button {
          width: 44px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;
          background: #ffffff;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .ira-quantity-box button:hover {
          background: #f7f7f7;
        }

        .ira-quantity-box button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .ira-quantity-number {
          width: 42px;
          text-align: center;
          font-size: 14px;
        }

        /* PURCHASE BUTTONS */

        .ira-purchase-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 30px;
        }

        .ira-add-button,
        .ira-buy-button {
          min-height: 56px;
          border: none;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .ira-add-button {
          background: #343740;
          color: #ffffff;
        }

        .ira-add-button:hover {
          background: #202228;
          transform: translateY(-1px);
        }

        .ira-buy-button {
          background: #ffffff;
          color: #30323a;
          border: 1px solid #30323a;
        }

        .ira-buy-button:hover {
          background: #30323a;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .ira-add-button:disabled,
        .ira-buy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ACCORDION */

        .ira-accordion {
          margin-top: 32px;
          border-top: 1px solid #e7e7e7;
        }

        .ira-accordion-item {
          border-bottom: 1px solid #e7e7e7;
        }

        .ira-accordion-button {
          width: 100%;
          min-height: 60px;
          border: none;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          text-align: left;
          color: #333;
          font-size: 14px;
          font-weight: 600;
        }

        .ira-accordion-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ira-accordion-content {
          padding: 0 0 22px;
          color: #727272;
          font-size: 13px;
          line-height: 1.7;
        }

        .ira-detail-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ira-detail-list li {
          position: relative;
          padding-left: 18px;
          margin-bottom: 9px;
        }

        .ira-detail-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #9a6b72;
          font-weight: 700;
        }

        /* SIZE GUIDE MODAL */

        .ira-size-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 20, 25, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
          animation: iraFadeIn 0.25s ease;
        }

        .ira-size-modal {
          width: 100%;
          max-width: 650px;
          background: #ffffff;
          border-radius: 18px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25);
          animation: iraModalUp 0.3s ease;
        }

        .ira-size-modal-header {
          padding: 28px 32px 22px;
          border-bottom: 1px solid #eeeeee;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .ira-size-modal-title {
          margin: 0;
          font-size: 25px;
          font-weight: 500;
          color: #30323a;
          letter-spacing: 0.3px;
        }

        .ira-size-modal-subtitle {
          margin: 7px 0 0;
          font-size: 13px;
          color: #888;
          line-height: 1.5;
        }

        .ira-size-modal-close {
          width: 38px;
          height: 38px;
          border: none;
          background: #f6f6f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #444;
          transition: 0.2s ease;
          flex-shrink: 0;
        }

        .ira-size-modal-close:hover {
          background: #30323a;
          color: #ffffff;
        }

        .ira-size-table-wrap {
          padding: 28px 32px 15px;
          overflow-x: auto;
        }

        .ira-size-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          text-align: center;
          overflow: hidden;
          border: 1px solid #eadfe0;
          border-radius: 10px;
        }

        .ira-size-table th {
          background: #f5e9ea;
          color: #3d3d42;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          padding: 16px 10px;
          text-transform: uppercase;
          border-bottom: 1px solid #eadfe0;
        }

        .ira-size-table td {
          padding: 17px 10px;
          border-bottom: 1px solid #eeeeee;
          color: #555;
          font-size: 14px;
          background: #ffffff;
        }

        .ira-size-table td:first-child {
          font-weight: 700;
          color: #30323a;
        }

        .ira-size-table tr:last-child td {
          border-bottom: none;
        }

        .ira-size-table tbody tr {
          transition: 0.2s ease;
        }

        .ira-size-table tbody tr:hover td {
          background: #fcf8f8;
        }

        .ira-size-modal-note {
          margin: 12px 32px 32px;
          padding: 15px 17px;
          background: #faf7f7;
          border-left: 3px solid #d7a4ac;
          color: #777;
          font-size: 12px;
          line-height: 1.65;
        }

        /* ANIMATIONS */

        @keyframes iraFadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes iraModalUp {
          from {
            opacity: 0;
            transform: translateY(25px) scale(0.97);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* TABLET */

        @media (max-width: 900px) {
          .ira-product-page {
            padding: 22px 25px 60px;
          }

          .ira-product-layout {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .ira-main-image-wrap {
            width: 65%;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .ira-product-page {
            padding: 18px 15px 50px;
          }

          .ira-gallery {
            flex-direction: column-reverse;
          }

          .ira-thumbnails {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .ira-thumbnail {
            min-width: 60px;
            width: 60px;
            height: 76px;
          }

          .ira-main-image-wrap {
            width: 100%;
            max-width: none;
          }

          .ira-main-image,
          .ira-no-image {
            height: 460px;
          }

          .ira-product-title {
            font-size: 38px;
          }

          .ira-purchase-buttons {
            grid-template-columns: 1fr;
          }

          .ira-size-modal {
            border-radius: 14px;
          }

          .ira-size-modal-header {
            padding: 22px 20px 18px;
          }

          .ira-size-table-wrap {
            padding: 20px 15px 10px;
          }

          .ira-size-modal-note {
            margin: 10px 15px 20px;
          }

          .ira-size-modal-title {
            font-size: 22px;
          }

          .ira-size-table th,
          .ira-size-table td {
            padding: 14px 7px;
            font-size: 11px;
          }

          .ira-size-table td {
            font-size: 13px;
          }
        }
      `}</style>

      <main className="ira-product-page">

        {/* BACK BUTTON */}

        <button
          type="button"
          className="ira-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back to Collection
        </button>

        <div className="ira-product-layout">

          {/* PRODUCT GALLERY */}

          <section className="ira-gallery">

            {images.length > 1 && (
              <div className="ira-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={
                      selectedImage === index
                        ? "ira-thumbnail active"
                        : "ira-thumbnail"
                    }
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="ira-main-image-wrap">

              {currentImage ? (
                <img
                  className="ira-main-image"
                  src={currentImage}
                  alt={product.name || "Product"}
                />
              ) : (
                <div className="ira-no-image">
                  <strong>IRA</strong>
                  <small>No image available</small>
                </div>
              )}

              {discount > 0 && (
                <span className="ira-sale-tag">
                  {discount}% OFF
                </span>
              )}

            </div>
          </section>

          {/* PRODUCT INFORMATION */}

          <section className="ira-product-info">

            <p className="ira-category">
              {product.category || "Collection"}
            </p>

            <h1 className="ira-product-title">
              {product.name || "Product"}
            </h1>

            {/* PRICE */}

            <div className="ira-price-row">

              <span className="ira-price">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {originalPrice && (
                <del className="ira-old-price">
                  ₹{originalPrice.toLocaleString("en-IN")}
                </del>
              )}

              {discount > 0 && (
                <span className="ira-discount">
                  SAVE {discount}%
                </span>
              )}

            </div>

            {/* STOCK */}

            <div
              className="ira-stock"
              style={{
                color: isInStock
                  ? "#5c765f"
                  : "#a65a5a",
              }}
            >
              <span className="ira-stock-dot" />

              {isInStock
                ? "In stock"
                : "Out of stock"}
            </div>

            {/* DESCRIPTION */}

            {product.description && (
              <p className="ira-description">
                {product.description}
              </p>
            )}

            <div className="ira-divider" />

            {/* SIZE */}

            {sizes.length > 0 && (
              <div className="ira-section">

                <div className="ira-label-row">

                  <span className="ira-label">
                    Select Size
                    {selectedSize
                      ? `: ${selectedSize}`
                      : ""}
                  </span>

                  <button
                    type="button"
                    className="ira-size-guide"
                    onClick={() => setShowSizeGuide(true)}
                  >
                    <Ruler size={15} />
                    Size Guide
                  </button>

                </div>

                <div className="ira-sizes">

                  {sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={
                        selectedSize === size
                          ? "ira-size-button active"
                          : "ira-size-button"
                      }
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}

                </div>

              </div>
            )}

            {/* COLOR */}

            {colors.length > 0 && (
              <div className="ira-section">

                <span className="ira-label">
                  Color
                  {selectedColor
                    ? `: ${selectedColor}`
                    : ""}
                </span>

                <div className="ira-colors">

                  {colors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      type="button"
                      title={color}
                      aria-label={`Select ${color}`}
                      className={
                        selectedColor === color
                          ? "ira-color-button active"
                          : "ira-color-button"
                      }
                      onClick={() =>
                        setSelectedColor(color)
                      }
                    >
                      <span
                        className="ira-color-circle"
                        style={{
                          backgroundColor:
                            getColorValue(color),
                        }}
                      />
                    </button>
                  ))}

                </div>

              </div>
            )}

            {/* QUANTITY */}

            <div className="ira-quantity-row">

              <span className="ira-label">
                Quantity
              </span>

              <div className="ira-quantity-box">

                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <strong className="ira-quantity-number">
                  {quantity}
                </strong>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    Number.isFinite(stock) &&
                    quantity >= stock
                  }
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>

              </div>

            </div>

            {/* PURCHASE BUTTONS */}

            <div className="ira-purchase-buttons">

              <button
                type="button"
                className="ira-add-button"
                onClick={handleAddToCart}
                disabled={!isInStock}
              >
                <ShoppingBag size={18} />

                {isInStock
                  ? "Add to Bag"
                  : "Out of Stock"}
              </button>

              <button
                type="button"
                className="ira-buy-button"
                onClick={handleBuyNow}
                disabled={!isInStock}
              >
                <Zap size={18} />
                Buy Now
              </button>

            </div>

            {/* ACCORDION */}

            <div className="ira-accordion">

              {/* PRODUCT DETAILS */}

              <div className="ira-accordion-item">

                <button
                  type="button"
                  className="ira-accordion-button"
                  onClick={() =>
                    toggleSection("details")
                  }
                >
                  <span className="ira-accordion-title">
                    <Sparkles size={17} />
                    Product Details
                  </span>

                  {openSection === "details"
                    ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />}
                </button>

                {openSection === "details" && (
                  <div className="ira-accordion-content">

                    <ul className="ira-detail-list">

                      <li>
                        {product.description ||
                          "Thoughtfully designed for effortless everyday wear."}
                      </li>

                      <li>
                        Category:{" "}
                        <strong>
                          {product.category || "Collection"}
                        </strong>
                      </li>

                      {selectedSize && (
                        <li>
                          Selected size:{" "}
                          <strong>
                            {selectedSize}
                          </strong>
                        </li>
                      )}

                      {selectedColor && (
                        <li>
                          Selected color:{" "}
                          <strong>
                            {selectedColor}
                          </strong>
                        </li>
                      )}

                    </ul>

                  </div>
                )}

              </div>

              {/* FABRIC & CARE */}

              <div className="ira-accordion-item">

                <button
                  type="button"
                  className="ira-accordion-button"
                  onClick={() =>
                    toggleSection("fabric")
                  }
                >
                  <span className="ira-accordion-title">
                    <Heart size={17} />
                    Fabric & Care
                  </span>

                  {openSection === "fabric"
                    ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />}
                </button>

                {openSection === "fabric" && (
                  <div className="ira-accordion-content">

                    <ul className="ira-detail-list">

                      <li>
                        Gentle machine wash or hand wash recommended.
                      </li>

                      <li>
                        Wash similar colours together.
                      </li>

                      <li>
                        Follow the care instructions provided with the garment.
                      </li>

                    </ul>

                  </div>
                )}

              </div>

              {/* SHIPPING */}

              <div className="ira-accordion-item">

                <button
                  type="button"
                  className="ira-accordion-button"
                  onClick={() =>
                    toggleSection("shipping")
                  }
                >
                  <span className="ira-accordion-title">
                    <ShoppingBag size={17} />
                    Shipping & Returns
                  </span>

                  {openSection === "shipping"
                    ? <ChevronUp size={18} />
                    : <ChevronDown size={18} />}
                </button>

                {openSection === "shipping" && (
                  <div className="ira-accordion-content">

                    <ul className="ira-detail-list">

                      <li>
                        Shipping availability depends on your delivery location.
                      </li>

                      <li>
                        Please check your order details carefully before checkout.
                      </li>

                      <li>
                        Returns and exchanges are subject to the store's return policy.
                      </li>

                    </ul>

                  </div>
                )}

              </div>

            </div>

          </section>

        </div>
      </main>

      {/* SIZE GUIDE MODAL */}

      {showSizeGuide && (
        <div
          className="ira-size-modal-overlay"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="ira-size-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="ira-size-modal-header">

              <div>
                <h2 className="ira-size-modal-title">
                  Size Guide
                </h2>

                <p className="ira-size-modal-subtitle">
                  Find your perfect fit using the measurements below.
                </p>
              </div>

              <button
                type="button"
                className="ira-size-modal-close"
                onClick={() => setShowSizeGuide(false)}
                aria-label="Close size guide"
              >
                <X size={19} />
              </button>

            </div>

            <div className="ira-size-table-wrap">

              <table className="ira-size-table">

                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Chest (Inches)</th>
                    <th>Waist (Inches)</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>S</td>
                    <td>31–33</td>
                    <td>26–28</td>
                  </tr>

                  <tr>
                    <td>M</td>
                    <td>34–36</td>
                    <td>28–30</td>
                  </tr>

                  <tr>
                    <td>L</td>
                    <td>37–39</td>
                    <td>30–32</td>
                  </tr>

                  <tr>
                    <td>XL</td>
                    <td>40–42</td>
                    <td>32–34</td>
                  </tr>

                  <tr>
                    <td>XXL</td>
                    <td>43–45</td>
                    <td>34–36</td>
                  </tr>

                </tbody>

              </table>

            </div>

            <div className="ira-size-modal-note">
              Measurements are in inches. For the best fit, compare your
              body measurements with the size chart. If you are between
              two sizes, we recommend choosing the larger size for a more
              comfortable fit.
            </div>

          </div>
        </div>
      )}

    </>
  );
}


// ==========================================
// COLOR HELPER
// ==========================================

function getColorValue(color) {
  if (!color) return "#cccccc";

  const value = color.toLowerCase().trim();

  const colorMap = {
    black: "#111111",
    white: "#ffffff",
    red: "#c94b4b",
    blue: "#6f86b5",
    green: "#819d7a",
    yellow: "#e5c85c",
    pink: "#e8a7b8",
    rose: "#dca1ad",
    purple: "#9683ae",
    lavender: "#aaa6c7",
    beige: "#d8c8ad",
    brown: "#8a644c",
    grey: "#a6a6a6",
    gray: "#a6a6a6",
    cream: "#f3ead7",
    peach: "#efb59f",
    orange: "#dd944f",
    maroon: "#7a2736",
  };

  return colorMap[value] || color;
}