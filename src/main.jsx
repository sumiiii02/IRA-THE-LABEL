import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  SlidersHorizontal,
  ArrowRight,
  Trash2,
} from "lucide-react";

import AdminPanel from "./AdminPanel.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import Checkout from "./components/Checkout.jsx";
import "./styles.css";

const API_URL = "https://ira-the-label.onrender.com";

const categories = [
  "All",
  "Kurtis",
  "Suits",
  "Sets",
  "Co-ords",
  "Dresses",
];

// ========================================================
// HELPERS
// ========================================================

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getStoredData(key, fallback = []) {
  try {
    const data = localStorage.getItem(key);

    if (!data) {
      return fallback;
    }

    const parsed = JSON.parse(data);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return fallback;
  }
}

function getProductId(product) {
  return String(product?._id || product?.id || "");
}

function getProductImage(product) {
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
  if (image.startsWith("data:image")) {
    return image;
  }

  // Full URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Local backend image path
  return `https://ira-the-label.onrender.com${image}`;
}

function getDiscountedPrice(product) {
  const price = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);

  if (discount > 0) {
    return Math.round(
      price - (price * discount) / 100
    );
  }

  return price;
}

// ========================================================
// PRODUCT VISUAL
// ========================================================

function ProductVisual({
  tone = "rose",
  image,
  name = "Product",
}) {
  return (
    <div className={`product-visual ${tone}`}>
      {image ? (
        <img
          src={image}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <>
          <div className="fabric-shape" />
          <span>IRA</span>
        </>
      )}
    </div>
  );
}

// ========================================================
// APP
// ========================================================

function App() {
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  // CART
  const [cart, setCart] = useState(() =>
    getStoredData("ira_cart", [])
  );

  // WISHLIST
  const [wishlist, setWishlist] = useState(() =>
    getStoredData("ira_wishlist", [])
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [checkoutItems, setCheckoutItems] =
    useState([]);

  // ========================================================
  // SAVE CART
  // ========================================================

  useEffect(() => {
    localStorage.setItem(
      "ira_cart",
      JSON.stringify(cart)
    );
  }, [cart]);

  // ========================================================
  // SAVE WISHLIST
  // ========================================================

  useEffect(() => {
    localStorage.setItem(
      "ira_wishlist",
      JSON.stringify(wishlist)
    );
  }, [wishlist]);

  // ========================================================
  // LOAD PRODUCTS
  // ========================================================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load products (${response.status})`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        console.error(
          "Unexpected products response:",
          data
        );

        setProducts([]);
      }
    } catch (error) {
      console.error(
        "LOAD PRODUCTS ERROR:",
        error
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ========================================================
  // FILTER PRODUCTS
  // ========================================================

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const productCategory =
        String(product.category || "").toLowerCase();

      const productName =
        String(product.name || "").toLowerCase();

      const categoryMatch =
        category === "All" ||
        productCategory === category.toLowerCase();

      const searchMatch =
        productName.includes(
          query.toLowerCase()
        );

      return categoryMatch && searchMatch;
    });
  }, [products, category, query]);

  // ========================================================
  // ADD TO CART
  // ========================================================

  const addToCart = (
    product,
    quantityToAdd = 1
  ) => {
    const productId = getProductId(product);

    if (!productId) {
      console.error(
        "Product cannot be added. No product ID:",
        product
      );

      return;
    }

    const quantity = Math.max(
      1,
      Number(quantityToAdd) || 1
    );

    setCart((currentCart) => {
      const existingProduct =
        currentCart.find(
          (item) =>
            getProductId(item) === productId
        );

      // Product already in cart
      if (existingProduct) {
        return currentCart.map((item) => {
          if (
            getProductId(item) === productId
          ) {
            return {
              ...item,
              quantity:
                Number(item.quantity || 1) +
                quantity,
            };
          }

          return item;
        });
      }

      // Add new product
      return [
        ...currentCart,
        {
          ...product,
          quantity,
        },
      ];
    });
  };

  // ========================================================
  // UPDATE CART QUANTITY
  // ========================================================

  const updateQuantity = (
    productId,
    change
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (
            getProductId(item) ===
            String(productId)
          ) {
            return {
              ...item,
              quantity:
                Number(item.quantity || 1) +
                Number(change),
            };
          }

          return item;
        })
        .filter(
          (item) =>
            Number(item.quantity || 0) > 0
        )
    );
  };

  // ========================================================
  // REMOVE FROM CART
  // ========================================================

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          getProductId(item) !==
          String(productId)
      )
    );
  };

  // ========================================================
  // CLEAR CART
  // ========================================================

  const clearCart = () => {
    setCart([]);
  };

  // ========================================================
  // WISHLIST
  // ========================================================

  const toggleWishlist = (productId) => {
    const id = String(productId);

    if (!id) {
      return;
    }

    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => String(item) === id
      );

      if (exists) {
        return currentWishlist.filter(
          (item) =>
            String(item) !== id
        );
      }

      return [...currentWishlist, id];
    });
  };

  // ========================================================
  // NAVIGATION
  // ========================================================

  const nav = (newPage) => {
    setPage(newPage);
    setMenuOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ========================================================
  // OPEN PRODUCT
  // ========================================================

  const openProduct = (product) => {
    setSelectedProduct(product);
    nav("product");
  };

  // ========================================================
  // BUY NOW
  // ========================================================

  const buyNow = (
    product,
    quantity = 1
  ) => {
    if (!product) {
      return;
    }

    setCheckoutItems([
      {
        ...product,
        quantity: Math.max(
          1,
          Number(quantity) || 1
        ),
      },
    ]);

    nav("checkout");
  };

  // ========================================================
  // CHECKOUT CART
  // ========================================================

  const checkoutCart = () => {
    if (!cart.length) {
      return;
    }

    setCheckoutItems([...cart]);

    nav("checkout");
  };

  // ========================================================
  // CART COUNT
  // ========================================================

  const cartItemCount = cart.reduce(
    (total, item) =>
      total +
      Number(item.quantity || 1),
    0
  );

  // ========================================================
  // ADMIN PAGE
  // ========================================================

  if (page === "admin") {
    return (
      <AdminPanel
        onBack={() => {
          setPage("home");
          loadProducts();
        }}
      />
    );
  }

  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="header">
        <div className="topline">
          LIGHT • BREEZY • EVERYDAY WEARABLES
        </div>

        <div className="navrow">
          <button
            className="icon-btn mobile-only"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >
            {menuOpen ? <X /> : <Menu />}
          </button>

          <div
            className="wordmark"
            onClick={() => nav("home")}
            style={{ cursor: "pointer" }}
          >
            IRA <span>THE LABEL</span>
          </div>

          <nav
            className={`navlinks ${
              menuOpen ? "open" : ""
            }`}
          >
            {[
              "New In",
              "Collections",
              "Kurtis",
              "Suits",
              "Sets",
              "Dresses",
              "Sale",
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (
                    item === "New In" ||
                    item === "Collections" ||
                    item === "Sale"
                  ) {
                    setCategory("All");
                  } else {
                    setCategory(item);
                  }

                  nav("shop");
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          <button
            className="admin-button"
            onClick={() => nav("admin")}
          >
            Admin
          </button>

          <div className="actions">
            <div className="searchbox">
              <Search size={17} />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search IRA..."
              />
            </div>

            <button
              className="icon-btn"
              onClick={() =>
                nav("wishlist")
              }
            >
              <Heart
                fill={
                  wishlist.length > 0
                    ? "currentColor"
                    : "none"
                }
              />

              <b>{wishlist.length}</b>
            </button>

            <button
              className="icon-btn"
              onClick={() => nav("cart")}
            >
              <ShoppingBag />

              <b>{cartItemCount}</b>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HOME ================= */}

      {page === "home" && (
        <Home
          nav={nav}
          setCategory={setCategory}
          products={products}
          openProduct={openProduct}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
        />
      )}

      {/* ================= SHOP ================= */}

      {page === "shop" && (
        <Shop
          products={filteredProducts}
          category={category}
          setCategory={setCategory}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          loading={loading}
          openProduct={openProduct}
        />
      )}

      {/* ================= PRODUCT DETAILS ================= */}

      {page === "product" &&
        selectedProduct && (
          <ProductDetails
            product={selectedProduct}
            onBack={() => nav("shop")}
            addToCart={addToCart}
            onBuyNow={buyNow}
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
          />
        )}

      {/* ================= CART ================= */}

      {page === "cart" && (
        <Cart
          cart={cart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          checkoutCart={checkoutCart}
          nav={nav}
        />
      )}

      {/* ================= CHECKOUT ================= */}

      {page === "checkout" && (
        <Checkout
          items={checkoutItems}
          nav={nav}
          clearCart={clearCart}
        />
      )}

      {/* ================= WISHLIST ================= */}

      {page === "wishlist" && (
        <Wishlist
          products={products.filter(
            (product) =>
              wishlist.some(
                (id) =>
                  String(id) ===
                  getProductId(product)
              )
          )}
          nav={nav}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          addToCart={addToCart}
          openProduct={openProduct}
        />
      )}

      {/* ================= FOOTER ================= */}

      <footer>
        <div className="footer-brand">
          IRA <span>THE LABEL</span>
        </div>

        <p>
          Light. Breezy. Everyday wearables.
        </p>

        <div className="footer-links">
          <button>About</button>
          <button>Shipping</button>
          <button>Returns</button>
          <button>Contact</button>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 IRA THE LABEL
          </span>

          <button
            onClick={() => nav("admin")}
          >
            Owner Dashboard
          </button>
        </div>
      </footer>
    </>
  );
}

// ========================================================
// HOME
// ========================================================

function Home({
  nav,
  setCategory,
  products,
  openProduct,
  wishlist,
  toggleWishlist,
  addToCart,
}) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            THE EVERYDAY EDIT
          </p>

          <h1>
            Made for your
            <br />
            <i>everyday.</i>
          </h1>

          <p className="hero-text">
            Light, breezy silhouettes designed
            to feel effortless from morning
            to evening.
          </p>

          <button
            className="primary"
            onClick={() => nav("shop")}
          >
            Explore the collection
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="hero-art">
          <img
            src="/IRA-THE-LABEL/logo.png"
            alt="IRA THE LABEL"
            className="hero-logo"
          />
        </div>
      </section>

      <section className="marquee">
        <span>NEW ARRIVALS</span>
        <span>•</span>
        <span>EVERYDAY WEAR</span>
        <span>•</span>
        <span>IRA THE LABEL</span>
        <span>•</span>
        <span>NEW ARRIVALS</span>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">
              SHOP BY MOOD
            </p>

            <h2>
              Find your everyday favourite.
            </h2>
          </div>

          <button
            className="text-btn"
            onClick={() => nav("shop")}
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="category-grid">
          {[
            ["Kurtis", "rose"],
            ["Suits", "green"],
            ["Sets", "sky"],
            ["Dresses", "lavender"],
          ].map(([name, tone]) => (
            <button
              className="category-card"
              key={name}
              onClick={() => {
                setCategory(name);
                nav("shop");
              }}
            >
              <ProductVisual tone={tone} />

              <div>
                <span>{name}</span>
                <ArrowRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">
              JUST IN
            </p>

            <h2>New arrivals.</h2>
          </div>

          <button
            className="text-btn"
            onClick={() => nav("shop")}
          >
            Shop all
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="product-grid">
          {products
            .slice(0, 4)
            .map((product) => (
              <ProductCard
                key={getProductId(product)}
                p={product}
                wishlist={wishlist}
                toggleWish={toggleWishlist}
                addToCart={addToCart}
                openProduct={openProduct}
              />
            ))}
        </div>
      </section>
    </main>
  );
}

// ========================================================
// SHOP
// ========================================================

function Shop({
  products,
  category,
  setCategory,
  wishlist,
  toggleWishlist,
  addToCart,
  loading,
  openProduct,
}) {
  return (
    <main className="shop-page">
      <div className="shop-heading">
        <p className="eyebrow">
          IRA THE LABEL
        </p>

        <h1>Shop the collection.</h1>

        <p>
          Everyday pieces, designed to be
          lived in.
        </p>
      </div>

      <div className="shop-tools">
        <div className="chips">
          {categories.map((item) => (
            <button
              className={
                category === item
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategory(item)
              }
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <button className="filter">
          <SlidersHorizontal size={16} />
          Filters
          <ChevronDown size={15} />
        </button>
      </div>

      {loading ? (
        <p
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          Loading products...
        </p>
      ) : products.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          No products found.
        </p>
      ) : (
        <div className="product-grid large">
          {products.map((product) => (
            <ProductCard
              key={getProductId(product)}
              p={product}
              wishlist={wishlist}
              toggleWish={toggleWishlist}
              addToCart={addToCart}
              openProduct={openProduct}
            />
          ))}
        </div>
      )}
    </main>
  );
}

// ========================================================
// PRODUCT CARD
// ========================================================

function ProductCard({
  p,
  wishlist = [],
  toggleWish,
  addToCart,
  openProduct,
}) {
  const productId = getProductId(p);

  const liked = wishlist.some(
    (id) => String(id) === productId
  );

  const image = getProductImage(p);

  const discountedPrice =
    getDiscountedPrice(p);

  return (
    <article className="product-card">
      <div
        className="product-media"
        style={{ cursor: "pointer" }}
        onClick={() => openProduct(p)}
      >
        {p.tag && (
          <span className="tag">
            {p.tag}
          </span>
        )}

        <button
          type="button"
          className="wish"
          onClick={(event) => {
            event.stopPropagation();
            toggleWish(productId);
          }}
        >
          <Heart
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

        <ProductVisual
          tone={p.tone || "rose"}
          image={image}
          name={p.name}
        />

        <button
          type="button"
          className="quick-add"
          onClick={(event) => {
            event.stopPropagation();
            addToCart(p, 1);
          }}
        >
          Add to bag
        </button>
      </div>

      <div className="product-info">
        <p>{p.category}</p>

        <h3
          style={{ cursor: "pointer" }}
          onClick={() => openProduct(p)}
        >
          {p.name}
        </h3>

        <div>
          <strong>
            {money(discountedPrice)}
          </strong>

          {Number(p.discount) > 0 && (
            <del>{money(p.price)}</del>
          )}
        </div>
      </div>
    </article>
  );
}

// ========================================================
// CART
// ========================================================

function Cart({
  cart,
  removeFromCart,
  updateQuantity,
  checkoutCart,
  nav,
}) {
  const total = cart.reduce(
    (sum, product) => {
      const price =
        getDiscountedPrice(product);

      const quantity =
        Number(product.quantity || 1);

      return sum + price * quantity;
    },
    0
  );

  const totalItems = cart.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity || 1),
    0
  );

  return (
    <main className="simple-page">
      <p className="eyebrow">
        YOUR BAG
      </p>

      <h1>Your shopping bag.</h1>

      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag size={34} />

          <h3>Your bag is empty</h3>

          <p>
            Add something you love from the
            collection.
          </p>

          <button
            className="primary"
            onClick={() => nav("shop")}
          >
            Shop now
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.map((product) => {
              const productId =
                getProductId(product);

              const image =
                getProductImage(product);

              const quantity =
                Number(product.quantity || 1);

              const price =
                getDiscountedPrice(product);

              return (
                <div
                  className="cart-item"
                  key={productId}
                >
                  <ProductVisual
                    tone={
                      product.tone || "rose"
                    }
                    image={image}
                    name={product.name}
                  />

                  <div className="cart-item-info">
                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      {product.category}
                    </p>

                    <strong>
                      {money(price)}
                    </strong>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateQuantity(
                            productId,
                            -1
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            productId,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <strong>
                      {money(
                        price * quantity
                      )}
                    </strong>

                    <button
                      className="icon-btn"
                      onClick={() =>
                        removeFromCart(
                          productId
                        )
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <aside className="summary">
            <h3>Order summary</h3>

            <div>
              <span>
                Items ({totalItems})
              </span>

              <strong>
                {money(total)}
              </strong>
            </div>

            <div>
              <span>Shipping</span>
              <span>
                Calculated at checkout
              </span>
            </div>

            <hr />

            <div className="total">
              <span>Total</span>

              <strong>
                {money(total)}
              </strong>
            </div>

            <button
              className="primary full"
              onClick={checkoutCart}
            >
              Proceed to checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

// ========================================================
// WISHLIST
// ========================================================

function Wishlist({
  products,
  nav,
  wishlist,
  toggleWishlist,
  addToCart,
  openProduct,
}) {
  return (
    <main className="simple-page">
      <p className="eyebrow">
        SAVED FOR LATER
      </p>

      <h1>Your wishlist.</h1>

      {!products.length ? (
        <div className="empty-state">
          <Heart size={34} />

          <h3>Nothing saved yet</h3>

          <p>
            Tap the heart on any piece you
            love.
          </p>

          <button
            className="primary"
            onClick={() => nav("shop")}
          >
            Explore pieces
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={getProductId(product)}
              p={product}
              wishlist={wishlist}
              toggleWish={toggleWishlist}
              addToCart={addToCart}
              openProduct={openProduct}
            />
          ))}
        </div>
      )}
    </main>
  );
}

// ========================================================
// RENDER
// ========================================================

createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);