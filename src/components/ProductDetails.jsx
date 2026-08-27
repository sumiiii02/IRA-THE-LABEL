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

  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
    setQuantity(1);
    setSelectedImage(0);
    setOpenSection("details");
  }, [product]);

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
      return `http://localhost:5000${image}`;
    }

    return `http://localhost:5000/${image}`;
  };

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <main className="ira-product-page">
        <h1>Product not found</h1>

        <button
          type="button"
          className="ira-back-button"
          onClick={onBack}
        >
          <ArrowLeft size={17} />
          Back to Collection
        </button>
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
          max-width: 1250px;
          margin: 0 auto;
          padding: 25px 35px 70px;
          color: #2d2d32;
          background: #ffffff;
        }

        .ira-back-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: transparent;
          padding: 5px 0;
          color: #666;
          font-size: 13px;
          cursor: pointer;
          margin-bottom: 15px;
        }

        .ira-back-button:hover {
          color: #222;
        }

        /* MAIN LAYOUT */

        .ira-product-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(350px, 0.85fr);
          gap: 55px;
          align-items: start;
        }

        /* GALLERY */

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
          width: 62px;
          height: 78px;
          padding: 0;
          border: 1px solid #e2e2e2;
          background: #fff;
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
          width: 70%;
          max-width: 410px;
          margin: 0 auto;
          background: #f6f6f6;
          position: relative;
          overflow: hidden;
        }

        .ira-main-image {
          width: 100%;
          height: 460px;
          display: block;
          object-fit: contain;
          background: #f6f6f6;
        }

        .ira-no-image {
          width: 100%;
          height: 460px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 6px;
          color: #777;
          background: #f6f6f6;
        }

        .ira-sale-tag {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 10px;
          background: #30323a;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        /* PRODUCT INFO */

        .ira-product-info {
          width: 100%;
          padding-top: 5px;
        }

        .ira-category {
          margin: 0 0 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #8a8a8a;
        }

        .ira-product-title {
          margin: 0;
          font-size: clamp(34px, 4vw, 48px);
          font-weight: 500;
          line-height: 1.05;
          color: #30323a;
          text-transform: lowercase;
        }

        .ira-price-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .ira-price {
          font-size: 22px;
          font-weight: 700;
          color: #30323a;
        }

        .ira-old-price {
          font-size: 15px;
          color: #999;
        }

        .ira-discount {
          padding: 5px 9px;
          background: #f3eeee;
          color: #9a4d4d;
          font-size: 10px;
          font-weight: 700;
        }

        .ira-stock {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 12px;
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
          margin: 20px 0 0;
          max-width: 500px;
          color: #747474;
          font-size: 14px;
          line-height: 1.7;
        }

        .ira-divider {
          width: 100%;
          height: 1px;
          background: #e8e8e8;
          margin: 25px 0;
        }

        /* SELECTIONS */

        .ira-section {
          margin-bottom: 23px;
        }

        .ira-label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .ira-label {
          font-size: 13px;
          font-weight: 700;
          color: #444;
        }

        .ira-size-guide {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: none;
          background: transparent;
          color: #777;
          font-size: 12px;
          cursor: pointer;
        }

        .ira-sizes {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ira-size-button {
          min-width: 48px;
          height: 42px;
          padding: 0 14px;
          border: 1px solid #dedede;
          background: #fff;
          color: #333;
          font-size: 13px;
          cursor: pointer;
        }

        .ira-size-button:hover {
          border-color: #555;
        }

        .ira-size-button.active {
          background: #30323a;
          color: #fff;
          border-color: #30323a;
        }

        .ira-colors {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 12px;
        }

        .ira-color-button {
          width: 34px;
          height: 34px;
          padding: 3px;
          border: 1px solid transparent;
          background: #fff;
          border-radius: 50%;
          cursor: pointer;
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
        }

        .ira-quantity-box button {
          width: 44px;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border: none;
          background: #fff;
          cursor: pointer;
        }

        .ira-quantity-box button:hover {
          background: #f6f6f6;
        }

        .ira-quantity-box button:disabled {
          opacity: 0.4;
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
          margin-top: 26px;
        }

        .ira-add-button,
        .ira-buy-button {
          min-height: 55px;
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
          color: #fff;
        }

        .ira-add-button:hover {
          background: #202228;
        }

        .ira-buy-button {
          background: #ffffff;
          color: #30323a;
          border: 1px solid #30323a;
        }

        .ira-buy-button:hover {
          background: #30323a;
          color: #ffffff;
        }

        .ira-add-button:disabled,
        .ira-buy-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ACCORDION */

        .ira-accordion {
          margin-top: 28px;
          border-top: 1px solid #e6e6e6;
        }

        .ira-accordion-item {
          border-bottom: 1px solid #e6e6e6;
        }

        .ira-accordion-button {
          width: 100%;
          min-height: 58px;
          border: none;
          background: #fff;
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
          gap: 9px;
        }

        .ira-accordion-content {
          padding: 0 0 20px;
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
          padding-left: 17px;
          margin-bottom: 8px;
        }

        .ira-detail-list li::before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #4f7155;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .ira-product-page {
            padding: 20px 20px 50px;
          }

          .ira-product-layout {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .ira-main-image-wrap {
            width: 65%;
          }
        }

        @media (max-width: 600px) {
          .ira-product-page {
            padding: 18px 15px 45px;
          }

          .ira-gallery {
            flex-direction: column-reverse;
          }

          .ira-thumbnails {
            width: 100%;
            flex-direction: row;
            overflow-x: auto;
          }

          .ira-thumbnail {
            min-width: 58px;
            width: 58px;
            height: 72px;
          }

          .ira-main-image-wrap {
            width: 100%;
            max-width: none;
          }

          .ira-main-image,
          .ira-no-image {
            height: 420px;
          }

          .ira-product-title {
            font-size: 38px;
          }

          .ira-purchase-buttons {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <main className="ira-product-page">
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
                    onClick={() =>
                      setSelectedImage(index)
                    }
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
                  </span>

                  <button
                    type="button"
                    className="ira-size-guide"
                    onClick={() =>
                      alert(
                        "Please refer to the size measurements provided by the store."
                      )
                    }
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
                      onClick={() =>
                        setSelectedSize(size)
                      }
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
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ADD TO BAG + BUY NOW */}

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
                          <strong>{selectedSize}</strong>
                        </li>
                      )}

                      {selectedColor && (
                        <li>
                          Selected color:{" "}
                          <strong>{selectedColor}</strong>
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

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