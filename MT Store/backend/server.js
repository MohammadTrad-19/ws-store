const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
require("dotenv").config();
console.log("✅ THIS IS THE STRIPE SERVER FILE");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const ExcelJS = require("exceljs");

// DATABASE CONNECTION
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendOrderStatusEmail(to, subject, html) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

// TEST BACKEND
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// TEST DATABASE
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    res.json({
      message: "Database connected ✅",
      data: results
    });
  });
});

// REGISTER + SEND VERIFICATION EMAIL
app.post("/register", async (req, res) => {
  console.log("REGISTER ROUTE CALLED");

  const { fullname, email, password, phone } = req.body;

  if (!fullname || !email || !password || !phone) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const checkEmailQuery = "SELECT * FROM customers WHERE email = ?";

    db.query(checkEmailQuery, [email], (checkErr, checkResult) => {
      if (checkErr) {
        return res.status(500).json({
          message: "Database error while checking email",
          error: checkErr.message
        });
      }

      if (checkResult.length > 0) {
        return res.status(400).json({
          message: "Email already exists"
        });
      }

      const insertQuery = `
        INSERT INTO customers (fullname, email, password, phone, is_verified, verification_code)
        VALUES (?, ?, ?, ?, 0, ?)
      `;

      db.query(insertQuery, [fullname, email, hashedPassword, phone, verificationCode], async (insertErr, result) => {
        if (insertErr) {
          return res.status(500).json({
            message: "Database error while registering user",
            error: insertErr.message
          });
        }

        try {
          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "WS Store Verification Code",
            text: `Your verification code is: ${verificationCode}`
          });

          res.status(201).json({
            message: "Verification code sent to your email 📩",
            userId: result.insertId
          });
        } catch (emailErr) {
          console.error("EMAIL ERROR:", emailErr);

          return res.status(500).json({
            message: "User saved, but email could not be sent",
            error: emailErr.message
          });
        }
      });
    });
  } catch (hashErr) {
    console.error("HASH PASSWORD ERROR:", hashErr);
    return res.status(500).json({
      message: "Error while securing password",
      error: hashErr.message
    });
  }
});

// VERIFY EMAIL
app.post("/verify", (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      message: "Email and verification code are required"
    });
  }

  const query = `
    SELECT * FROM customers
    WHERE email = ? AND verification_code = ?
  `;

  db.query(query, [email, code], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while verifying account",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: "Invalid verification code or email"
      });
    }

    const user = results[0];

    const updateQuery = `
      UPDATE customers
      SET is_verified = 1, verification_code = NULL
      WHERE email = ?
    `;

    db.query(updateQuery, [email], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          message: "Database error while updating verification status",
          error: updateErr.message
        });
      }

      res.status(200).json({
        message: "Account verified successfully ✅",
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email
        }
      });
    });
  });
});
app.post("/resend-verification-code", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const verificationCode = generateVerificationCode();

  const findUserQuery = `
    SELECT id, email, is_verified
    FROM customers
    WHERE email = ?
  `;

  db.query(findUserQuery, [email], (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Database error while checking account",
        error: findErr.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    const user = results[0];

    if (user.is_verified === 1) {
      return res.status(400).json({
        message: "Account is already verified"
      });
    }

    const updateQuery = `
      UPDATE customers
      SET verification_code = ?
      WHERE email = ?
    `;

    db.query(updateQuery, [verificationCode, email], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          message: "Database error while updating verification code",
          error: updateErr.message
        });
      }

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "WS Store New Verification Code",
          text: `Your new verification code is: ${verificationCode}`
        });

        res.status(200).json({
          message: "Verification code resent successfully"
        });
      } catch (emailErr) {
        console.error("RESEND VERIFICATION EMAIL ERROR:", emailErr);

        return res.status(500).json({
          message: "Verification code updated, but email could not be sent",
          error: emailErr.message
        });
      }
    });
  });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const query = "SELECT * FROM customers WHERE email = ?";

  db.query(query, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while logging in",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.is_verified !== 1) {
      return res.status(403).json({
        message: "Please verify your email before logging in"
      });
    }

    res.status(200).json({
      message: "Login successful ✅",
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email
      }
    });
  });
});

// GET ALL PRODUCTS OR FILTER BY CATEGORY
app.get("/products", (req, res) => {
  const category = req.query.category;

  let query = `
    SELECT 
      products.id,
      products.name,
      products.description,
      products.price,
      products.image,
      products.brand,
      products.quantity,
      products.category_id,
      categories.name AS category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
  `;

  const values = [];

  if (category) {
    query += ` WHERE categories.name = ?`;
    values.push(category);
  }

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching products",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// GET SINGLE PRODUCT
// GET SINGLE PRODUCT + SIZE STOCK
// GET SINGLE PRODUCT + SIZE STOCK
app.get("/products/:id", (req, res) => {
  const productId = req.params.id;

  const productQuery = `
    SELECT 
      products.id,
      products.name,
      products.description,
      products.price,
      products.image,
      products.brand,
      products.quantity,
      products.category_id,
      categories.name AS category
    FROM products
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE products.id = ?
  `;

  db.query(productQuery, [productId], (err, productResults) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching product",
        error: err.message
      });
    }

    if (productResults.length === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const sizeQuery = `
      SELECT id, product_id, size, quantity
      FROM product_sizes
      WHERE product_id = ?
      ORDER BY CAST(size AS UNSIGNED), size
    `;

    db.query(sizeQuery, [productId], (sizeErr, sizeResults) => {
      if (sizeErr) {
        return res.status(500).json({
          message: "Database error while fetching product sizes",
          error: sizeErr.message
        });
      }

      const product = productResults[0];

      product.sizes = sizeResults;
      product.has_sizes = sizeResults.length > 0;

      res.json(product);
    });
  });
});

// GET CATEGORIES
app.get("/categories", (req, res) => {
  const query = "SELECT * FROM categories ORDER BY name ASC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching categories",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// OLD PURCHASE ROUTE
app.post("/purchase", async (req, res) => {
  const items = req.body.items;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items provided." });
  }

  db.beginTransaction(function (err) {
    if (err) {
      return res.status(500).json({ message: "Transaction error." });
    }

    let completed = 0;
    let failed = false;

    items.forEach(function (item) {
      const quantity = Number(item.quantity || 0);
      const productId = Number(item.id);

      const sql = `
        UPDATE products
        SET quantity = quantity - ?
        WHERE id = ? AND quantity >= ?
      `;

      db.query(sql, [quantity, productId, quantity], function (error, result) {
        if (failed) return;

        if (error) {
          failed = true;
          return db.rollback(function () {
            res.status(500).json({ message: "Database update failed." });
          });
        }

        if (result.affectedRows === 0) {
          failed = true;
          return db.rollback(function () {
            res.status(400).json({ message: "One or more products are out of stock." });
          });
        }

        completed++;

        if (completed === items.length) {
          db.commit(function (commitErr) {
            if (commitErr) {
              return db.rollback(function () {
                res.status(500).json({ message: "Commit failed." });
              });
            }

            res.json({ message: "Purchase completed successfully." });
          });
        }
      });
    });
  });
});

// ADD TO CART
app.post("/api/cart/add", (req, res) => {
  const {
    user_email,
    product_id,
    quantity,
    size,
    price,
    kit_variant,
    kit_option,
    custom_name,
    custom_number,
    customization
  } = req.body;

  if (!user_email || !product_id || !quantity) {
    return res.status(400).json({ message: "Missing data" });
  }

  const finalPrice = price !== undefined && price !== null ? Number(price) : null;

  const getCart = "SELECT * FROM cart WHERE user_email = ?";

  db.query(getCart, [user_email], (err, cartResult) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching cart",
        error: err.message
      });
    }

    const handleCart = (cartId) => {
      const checkItem = `
        SELECT * FROM cart_items
        WHERE cart_id = ?
          AND product_id = ?
          AND size <=> ?
          AND kit_variant <=> ?
          AND kit_option <=> ?
          AND custom_name <=> ?
          AND custom_number <=> ?
          AND customization <=> ?
      `;

      db.query(
        checkItem,
        [
          cartId,
          product_id,
          size || null,
          kit_variant || null,
          kit_option || null,
          custom_name || null,
          custom_number || null,
          customization || null
        ],
        (checkErr, itemResult) => {
          if (checkErr) {
            return res.status(500).json({
              message: "Database error while checking cart item",
              error: checkErr.message
            });
          }

          if (itemResult.length > 0) {
            const update = `
              UPDATE cart_items
              SET quantity = quantity + ?, price = ?
              WHERE id = ?
            `;

            db.query(update, [quantity, finalPrice, itemResult[0].id], (updateErr) => {
              if (updateErr) {
                return res.status(500).json({
                  message: "Database error while updating cart item",
                  error: updateErr.message
                });
              }

              return res.json({ message: "Quantity updated" });
            });
          } else {
            const insert = `
              INSERT INTO cart_items
              (cart_id, product_id, quantity, size, price, kit_variant, kit_option, custom_name, custom_number, customization)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
              insert,
              [
                cartId,
                product_id,
                quantity,
                size || null,
                finalPrice,
                kit_variant || null,
                kit_option || null,
                custom_name || null,
                custom_number || null,
                customization || null
              ],
              (insertErr) => {
                if (insertErr) {
                  return res.status(500).json({
                    message: "Database error while adding product to cart",
                    error: insertErr.message
                  });
                }

                return res.json({ message: "Product added to cart" });
              }
            );
          }
        }
      );
    };

    if (cartResult.length > 0) {
      handleCart(cartResult[0].id);
    } else {
      const createCart = "INSERT INTO cart (user_email) VALUES (?)";

      db.query(createCart, [user_email], (createErr, result) => {
        if (createErr) {
          return res.status(500).json({
            message: "Database error while creating cart",
            error: createErr.message
          });
        }

        handleCart(result.insertId);
      });
    }
  });
});

// GET CART
app.get("/api/cart/:email", (req, res) => {
  const { email } = req.params;

  const query = `
    SELECT 
      ci.id AS cart_item_id,
      ci.cart_id,
      ci.product_id AS id,
      ci.quantity,
      ci.size,
      COALESCE(ci.price, p.price) AS price,
      ci.kit_variant,
      ci.kit_option,
      ci.custom_name,
      ci.custom_number,
      ci.customization,
      p.name,
      p.image,
      p.description,
      p.brand,
      p.quantity AS stock,
      c.user_email
    FROM cart c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN products p ON p.id = ci.product_id
    WHERE c.user_email = ?
    ORDER BY ci.id ASC
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching cart",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// UPDATE CART ITEM
app.put("/api/cart/item/:id", (req, res) => {
  const cartItemId = req.params.id;
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return res.status(400).json({
      message: "Quantity must be at least 1"
    });
  }

  const query = "UPDATE cart_items SET quantity = ? WHERE id = ?";

  db.query(query, [quantity, cartItemId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while updating cart item",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.status(200).json({
      message: "Cart item updated successfully"
    });
  });
});

// DELETE CART ITEM
app.delete("/api/cart/item/:id", (req, res) => {
  const cartItemId = req.params.id;

  const query = "DELETE FROM cart_items WHERE id = ?";

  db.query(query, [cartItemId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while deleting cart item",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Cart item not found"
      });
    }

    res.status(200).json({
      message: "Cart item removed successfully"
    });
  });
});

// CREATE ORDER + REDUCE STOCK + CLEAR CART
// CREATE ORDER + REDUCE STOCK + CLEAR CART + SEND EMAIL
app.post("/api/orders/create", (req, res) => {
  const { user_email, items, total, payment_method, phone1, phone2, address } = req.body;

  if (!user_email || !items || items.length === 0) {
    return res.status(400).json({ message: "Missing order data" });
  }

  db.beginTransaction((transactionErr) => {
    if (transactionErr) {
      console.error("TRANSACTION START ERROR:", transactionErr);
      return res.status(500).json({
        message: "Failed to start transaction",
        error: transactionErr.message
      });
    }

    const createOrder = `
      INSERT INTO orders (user_email, total, payment_method, phone1, phone2, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(createOrder, [user_email, total, payment_method, phone1, phone2 || null, address], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error("CREATE ORDER ERROR:", err);
          res.status(500).json({ message: "Failed to create order", error: err.message });
        });
      }

      const orderId = result.insertId;
      let processedItems = 0;
      let failed = false;

      items.forEach((item) => {
        const orderedQty = Number(item.quantity || 0);
        const productId = Number(item.id);
        const hasSize = item.size && String(item.size).trim() !== "";

        if (!orderedQty || orderedQty < 1 || !productId) {
          failed = true;
          return db.rollback(() => {
            res.status(400).json({
              message: "Invalid product quantity or product ID"
            });
          });
        }

        const reduceStockQuery = hasSize
          ? `
            UPDATE product_sizes
            SET quantity = quantity - ?
            WHERE product_id = ? AND size = ? AND quantity >= ?
          `
          : `
            UPDATE products
            SET quantity = quantity - ?
            WHERE id = ? AND quantity >= ?
          `;

        const reduceStockValues = hasSize
          ? [orderedQty, productId, item.size, orderedQty]
          : [orderedQty, productId, orderedQty];

        db.query(reduceStockQuery, reduceStockValues, (stockErr, stockResult) => {
          if (failed) return;

          if (stockErr) {
            failed = true;
            return db.rollback(() => {
              console.error("REDUCE STOCK ERROR:", stockErr);
              res.status(500).json({
                message: "Failed to reduce product stock",
                error: stockErr.message
              });
            });
          }

          if (stockResult.affectedRows === 0) {
            failed = true;
            return db.rollback(() => {
              res.status(400).json({
                message: hasSize
                  ? `Size ${item.size} is out of stock for product ID ${productId}`
                  : `Product stock is not enough for product ID ${productId}`
              });
            });
          }

          const insertItemQuery = `
            INSERT INTO order_items
            (order_id, product_id, quantity, size, kit_variant, kit_option, custom_name, custom_number, customization, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertItemQuery,
            [
              orderId,
              productId,
              orderedQty,
              item.size || null,
              item.kit_variant || null,
              item.kit_option || null,
              item.custom_name || null,
              item.custom_number || null,
              item.customization || null,
              item.price,
              "Placed"
            ],
            (itemErr) => {
              if (failed) return;

              if (itemErr) {
                failed = true;
                return db.rollback(() => {
                  console.error("INSERT ORDER ITEM ERROR:", itemErr);
                  res.status(500).json({
                    message: "Failed to create order item",
                    error: itemErr.message
                  });
                });
              }

              processedItems++;

              if (processedItems === items.length) {
                const deleteCart = `
                  DELETE ci FROM cart_items ci
                  JOIN cart c ON ci.cart_id = c.id
                  WHERE c.user_email = ?
                `;

                db.query(deleteCart, [user_email], (deleteErr) => {
                  if (deleteErr) {
                    return db.rollback(() => {
                      console.error("DELETE CART ERROR:", deleteErr);
                      res.status(500).json({
                        message: "Order created but failed to clear cart",
                        error: deleteErr.message
                      });
                    });
                  }

                  db.commit((commitErr) => {
                    if (commitErr) {
                      return db.rollback(() => {
                        console.error("COMMIT ERROR:", commitErr);
                        res.status(500).json({
                          message: "Failed to commit order",
                          error: commitErr.message
                        });
                      });
                    }

                    const orderItemsHtml = items.map((orderItem) => {
                      const itemTotal = Number(orderItem.price || 0) * Number(orderItem.quantity || 1);

                      return `
                        <div style="padding:12px 0; border-bottom:1px solid #ddd;">
                          <p><strong>Product:</strong> ${orderItem.name || "Product"}</p>
                          ${orderItem.kit_option ? `<p><strong>Option:</strong> ${orderItem.kit_option}</p>` : ""}
                          ${orderItem.size ? `<p><strong>Size:</strong> ${orderItem.size}</p>` : ""}
                          ${orderItem.customization ? `<p><strong>Customize:</strong> ${orderItem.customization}</p>` : ""}
                          <p><strong>Quantity:</strong> ${orderItem.quantity}</p>
                          <p><strong>Price:</strong> $${orderItem.price}</p>
                          <p><strong>Subtotal:</strong> $${itemTotal}</p>
                        </div>
                      `;
                    }).join("");

                    sendOrderStatusEmail(
                      user_email,
                      "WS Store - Order Placed Successfully",
                      `
                        <div style="font-family:Arial,sans-serif; line-height:1.6;">
                          <h2>Thank you for shopping with WS Store</h2>
                          <p>Your order has been placed successfully.</p>

                          <h3>Order #${orderId}</h3>
                          ${orderItemsHtml}

                          <h3>Delivery Details</h3>
                          <p><strong>Total:</strong> $${total}</p>
                          <p><strong>Payment Method:</strong> ${payment_method}</p>
                          <p><strong>Phone 1:</strong> +961 ${phone1}</p>
                          ${phone2 ? `<p><strong>Phone 2:</strong> +961 ${phone2}</p>` : ""}
                          <p><strong>Address:</strong> ${address}</p>

                          <p>You can cancel your order within 2 hours.</p>
                        </div>
                      `
                    ).catch((emailErr) => {
                      console.error("ORDER PLACED EMAIL ERROR:", emailErr);
                    });

                    res.json({
                      message: "Order created successfully",
                      orderId: orderId
                    });
                  });
                });
              }
            }
          );
        });
      });
    });
  });
});

// GET ORDERS
app.get("/api/orders/:email", (req, res) => {
  const { email } = req.params;

  const query = `
    SELECT
      o.id AS order_id,
      o.user_email,
      o.total,
      o.payment_method,
      o.phone1,
      o.phone2,
      o.address,
      o.created_at AS order_created_at,

      oi.id AS order_item_id,
      oi.product_id,
      oi.quantity,
      oi.size,
      oi.kit_variant,
      oi.kit_option,
      oi.custom_name,
      oi.custom_number,
      oi.customization,
      oi.price,
      oi.status,
      oi.created_at,
      oi.canceled_at,

      p.name,
      p.image
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_email = ?
    ORDER BY o.id DESC, oi.id DESC
  `;

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("GET ORDERS ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch orders",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// CANCEL ONE ORDER ITEM + RESTORE STOCK
app.put("/api/order-items/cancel/:id", (req, res) => {
  const orderItemId = req.params.id;

  const getItemQuery = `
    SELECT *
    FROM order_items
    WHERE id = ?
  `;

  db.query(getItemQuery, [orderItemId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while fetching order item",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Order item not found"
      });
    }

    const item = results[0];

    if (item.status === "Canceled") {
      return res.status(400).json({
        message: "This item is already canceled"
      });
    }

    const createdAt = new Date(item.created_at);
    const now = new Date();
    const hoursPassed = (now - createdAt) / (1000 * 60 * 60);

    if (hoursPassed >= 2) {
      return res.status(400).json({
        message: "Cancellation period expired for this item"
      });
    }

    db.beginTransaction((transactionErr) => {
      if (transactionErr) {
        return res.status(500).json({
          message: "Failed to start transaction",
          error: transactionErr.message
        });
      }

      const updateOrderItemQuery = `
        UPDATE order_items
        SET status = 'Canceled', canceled_at = NOW()
        WHERE id = ? AND status <> 'Canceled'
      `;

      db.query(updateOrderItemQuery, [orderItemId], (updateErr, updateResult) => {
        if (updateErr) {
          return db.rollback(() => {
            res.status(500).json({
              message: "Database error while canceling item",
              error: updateErr.message
            });
          });
        }

        if (updateResult.affectedRows === 0) {
          return db.rollback(() => {
            res.status(400).json({
              message: "This item is already canceled"
            });
          });
        }

       const hasSize = item.size && String(item.size).trim() !== "";

const restoreStockQuery = hasSize
  ? `
    UPDATE product_sizes
    SET quantity = quantity + ?
    WHERE product_id = ? AND size = ?
  `
  : `
    UPDATE products
    SET quantity = quantity + ?
    WHERE id = ?
  `;

const restoreStockValues = hasSize
  ? [item.quantity, item.product_id, item.size]
  : [item.quantity, item.product_id];

db.query(restoreStockQuery, restoreStockValues, (stockErr) => {

          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                res.status(500).json({
                  message: "Failed to commit cancellation",
                  error: commitErr.message
                });
              });
            }

            res.status(200).json({
              message: "Order item canceled successfully"
            });
          });
        });
      });
    });
  });
});

// ADD TO WISHLIST
app.post("/api/wishlist/add", (req, res) => {
  const { user_email, product_id, kit_variant } = req.body;

  if (!user_email || !product_id) {
    return res.status(400).json({ message: "Missing data" });
  }

  const finalKitVariant = kit_variant || null;

  const findWishlist = "SELECT * FROM wishlist WHERE user_email = ?";

  db.query(findWishlist, [user_email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Server error", error: err.message });
    }

    const addItem = (wishlistId) => {
      const checkItem = `
        SELECT * FROM wishlist_items
        WHERE wishlist_id = ?
          AND product_id = ?
          AND kit_variant <=> ?
      `;

      db.query(checkItem, [wishlistId, product_id, finalKitVariant], (checkErr, itemResults) => {
        if (checkErr) {
          return res.status(500).json({ message: "Server error", error: checkErr.message });
        }

        if (itemResults.length > 0) {
          return res.json({ message: "Already in wishlist" });
        }

        const insertItem = `
          INSERT INTO wishlist_items (wishlist_id, product_id, kit_variant)
          VALUES (?, ?, ?)
        `;

        db.query(insertItem, [wishlistId, product_id, finalKitVariant], (insertErr) => {
          if (insertErr) {
            return res.status(500).json({ message: "Error adding item", error: insertErr.message });
          }

          res.json({ message: "Added to wishlist" });
        });
      });
    };

    if (results.length === 0) {
      const createWishlist = "INSERT INTO wishlist (user_email) VALUES (?)";

      db.query(createWishlist, [user_email], (createErr, result) => {
        if (createErr) {
          return res.status(500).json({ message: "Error creating wishlist", error: createErr.message });
        }

        addItem(result.insertId);
      });
    } else {
      addItem(results[0].id);
    }
  });
});

// GET WISHLIST
app.get("/api/wishlist/:email", (req, res) => {
  const userEmail = req.params.email;

  const sql = `
    SELECT 
      wi.id AS wishlist_item_id,
      wi.kit_variant,
      p.id,
      p.name,
      p.price,
      p.image,
      p.brand
    FROM wishlist w
    JOIN wishlist_items wi ON w.id = wi.wishlist_id
    JOIN products p ON wi.product_id = p.id
    WHERE w.user_email = ?
    ORDER BY wi.id DESC
  `;

  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error("GET WISHLIST ERROR:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }

    res.json(result);
  });
});

// REMOVE FROM WISHLIST
app.post("/api/wishlist/remove", (req, res) => {
  const { user_email, product_id, kit_variant } = req.body;

  if (!user_email || !product_id) {
    return res.status(400).json({ message: "Missing data" });
  }

  const finalKitVariant = kit_variant || null;

  const query = `
    DELETE wi FROM wishlist_items wi
    JOIN wishlist w ON wi.wishlist_id = w.id
    WHERE w.user_email = ?
      AND wi.product_id = ?
      AND wi.kit_variant <=> ?
  `;

  db.query(query, [user_email, product_id, finalKitVariant], (err) => {
    if (err) {
      return res.status(500).json({ message: "Error removing item", error: err.message });
    }

    res.json({ message: "Removed from wishlist" });
  });
});

// ADD REVIEW
app.post("/api/reviews/add", (req, res) => {
  const {
    product_id,
    user_name,
    user_email,
    review_text,
    rating,
    kit_variant
  } = req.body;

  if (!product_id || !user_name || !user_email) {
    return res.status(400).json({
      message: "Missing review data"
    });
  }

  if ((!review_text || review_text.trim() === "") && !rating) {
    return res.status(400).json({
      message: "Please write a comment or choose a star rating"
    });
  }

  const query = `
    INSERT INTO reviews (
      product_id,
      user_name,
      user_email,
      review_text,
      rating,
      kit_variant
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      product_id,
      user_name,
      user_email,
      review_text || "",
      rating || 5,
      kit_variant || null
    ],
    (err, result) => {

      if (err) {
        console.error("ADD REVIEW ERROR:", err);

        return res.status(500).json({
          message: "Failed to add review",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Review added successfully",
        reviewId: result.insertId
      });
    }
  );
});

// GET REVIEWS
app.get("/api/reviews/:productId", (req, res) => {
  const { productId } = req.params;
  const { kit_variant } = req.query;

  let query = `
    SELECT
      id,
      product_id,
      user_name,
      user_email,
      review_text,
      rating,
      kit_variant,
      created_at
    FROM reviews
    WHERE product_id = ?
  `;

  const values = [productId];

  if (kit_variant) {
    query += ` AND kit_variant = ? `;
    values.push(kit_variant);
  } else {
    query += ` AND (kit_variant IS NULL OR kit_variant = '') `;
  }

  query += ` ORDER BY id DESC `;

  db.query(query, values, (err, results) => {

    if (err) {
      console.error("GET REVIEWS ERROR:", err);

      return res.status(500).json({
        message: "Failed to fetch reviews",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// DELETE REVIEW
app.delete("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;
  const { user_email, is_admin } = req.body;

  if (!reviewId) {
    return res.status(400).json({
      message: "Review ID is required"
    });
  }

  let query;
  let values;

  if (is_admin === true) {
    query = "DELETE FROM reviews WHERE id = ?";
    values = [reviewId];
  } else {
    if (!user_email) {
      return res.status(400).json({
        message: "User email is required"
      });
    }

    query = "DELETE FROM reviews WHERE id = ? AND user_email = ?";
    values = [reviewId, user_email];
  }

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("DELETE REVIEW ERROR:", err);
      return res.status(500).json({
        message: "Failed to delete review",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "Review not found or not allowed to delete"
      });
    }

    res.status(200).json({
      message: "Review deleted successfully"
    });
  });
});

// UPDATE REVIEW
app.put("/api/reviews/:id", (req, res) => {
  const reviewId = req.params.id;

  const {
    user_email,
    review_text,
    rating
  } = req.body;

  if (!user_email) {
    return res.status(400).json({
      message: "Missing user email"
    });
  }

  if ((!review_text || review_text.trim() === "") && !rating) {
    return res.status(400).json({
      message: "Please write a comment or choose a star rating"
    });
  }

  const query = `
    UPDATE reviews
    SET review_text = ?, rating = ?
    WHERE id = ? AND user_email = ?
  `;

  db.query(
    query,
    [
      review_text || "",
      rating || 5,
      reviewId,
      user_email
    ],
    (err, result) => {
      if (err) {
        console.error("UPDATE REVIEW ERROR:", err);

        return res.status(500).json({
          message: "Failed to update review",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(403).json({
          message: "You can edit only your own review"
        });
      }

      res.status(200).json({
        message: "Review updated successfully"
      });
    }
  );
});

// CONTACT US: SAVE TO DATABASE + SEND EMAIL
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const insertQuery = `
    INSERT INTO contact_messages (name, email, message)
    VALUES (?, ?, ?)
  `;

  db.query(insertQuery, [name, email, message], (dbErr, dbResult) => {
    if (dbErr) {
      console.error("CONTACT DB ERROR:", dbErr);
      return res.status(500).json({
        message: "Failed to save contact message",
        error: dbErr.message
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "tradmohammad20@gmail.com",
      subject: `New Contact Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    transporter.sendMail(mailOptions, (mailErr) => {
      if (mailErr) {
        console.error("CONTACT EMAIL ERROR:", mailErr);
        return res.status(500).json({
          message: "Message saved but email failed to send",
          error: mailErr.message
        });
      }

      res.status(200).json({
        message: "Message sent successfully",
        messageId: dbResult.insertId
      });
    });
  });
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required"
    });
  }

  const query = "SELECT * FROM admins WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while logging in admin",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Invalid admin email or password"
      });
    }

    const admin = results[0];

    res.status(200).json({
      message: "Admin login successful ✅",
      admin: {
        id: admin.id,
        fullname: admin.fullname,
        email: admin.email
      }
    });
  });
});

app.get("/api/admin/products", (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.brand,
      p.quantity,
      p.category_id,
      c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to fetch products",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

app.post("/api/admin/products", (req, res) => {
  const { name, description, price, image, brand, quantity, category_id } = req.body;

  if (!name || !description || !price || !image || !brand || quantity === undefined || !category_id) {
    return res.status(400).json({
      message: "All product fields are required"
    });
  }

  const query = `
    INSERT INTO products (name, description, price, image, brand, quantity, category_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [name, description, price, image, brand, quantity, category_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to add product",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Product added successfully",
        productId: result.insertId
      });
    }
  );
});

app.put("/api/admin/products/:id", (req, res) => {
  const productId = req.params.id;
  const { name, description, price, image, brand, quantity, category_id } = req.body;

  if (!name || !description || !price || !image || !brand || quantity === undefined || !category_id) {
    return res.status(400).json({
      message: "All product fields are required"
    });
  }

  const query = `
    UPDATE products
    SET name = ?, description = ?, price = ?, image = ?, brand = ?, quantity = ?, category_id = ?
    WHERE id = ?
  `;

  db.query(
    query,
    [name, description, price, image, brand, quantity, category_id, productId],
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Failed to update product",
          error: err.message
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Product not found"
        });
      }

      res.status(200).json({
        message: "Product updated successfully"
      });
    }
  );
});

app.delete("/api/admin/products/:id", (req, res) => {
  const productId = req.params.id;

  const query = `DELETE FROM products WHERE id = ?`;

  db.query(query, [productId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Failed to delete product",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Product deleted successfully"
    });
  });
});

app.get("/api/admin/orders", (req, res) => {
  const query = `
    SELECT
      o.id AS order_id,
      o.user_email,
      o.total,
      o.payment_method,
      o.phone1,
      o.phone2,
      o.address,
      o.created_at AS order_created_at,

      oi.id AS order_item_id,
      oi.product_id,
      oi.quantity,
      oi.size,
      oi.kit_variant,
      oi.kit_option,
      oi.custom_name,
      oi.custom_number,
      oi.customization,
      oi.price,
      oi.status,
      oi.created_at,
      oi.canceled_at,

      p.name,
      p.image
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    ORDER BY o.id DESC, oi.id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("ADMIN GET ORDERS ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch admin orders",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

function checkOrderEmails() {
  const confirmedQuery = `
    SELECT 
      oi.id,
      oi.quantity,
      oi.size,
      oi.kit_option,
      oi.customization,
      oi.status,
      oi.confirmed_email_sent,
      oi.shipped_email_sent,
      oi.delivered_email_sent,
      oi.created_at,
      oi.canceled_at,
      o.user_email,
      p.name AS product_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.status = 'Placed'
      AND oi.canceled_at IS NULL
      AND oi.confirmed_email_sent = 0
      AND oi.created_at <= NOW() - INTERVAL 2 HOUR
  `;

  db.query(confirmedQuery, async (err, results) => {
    if (err) {
      console.error("CONFIRMED EMAIL CHECK ERROR:", err);
      return;
    }

    for (const item of results) {
      try {
        await sendOrderStatusEmail(
          item.user_email,
          "WS Store - Your Order Is Confirmed",
          `
            <h2>Thank you for shopping with WS Store</h2>
            <p>Your order has been confirmed successfully.</p>
            <p><strong>Product:</strong> ${item.product_name || "Product"}</p>
            <p><strong>Option:</strong> ${item.kit_option || "-"}</p>
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Size:</strong> ${item.size || "-"}</p>
            ${item.customization ? `<p><strong>Customize:</strong> ${item.customization}</p>` : ""}
            <p>The 2-hour cancellation period has ended.</p>
          `
        );

        db.query(
          `UPDATE order_items SET confirmed_email_sent = 1 WHERE id = ?`,
          [item.id]
        );
      } catch (emailErr) {
        console.error(`CONFIRMED EMAIL SEND ERROR for item ${item.id}:`, emailErr);
      }
    }
  });

  const shippedQuery = `
    SELECT 
      oi.id,
      oi.quantity,
      oi.size,
      oi.kit_option,
      oi.customization,
      oi.status,
      oi.confirmed_email_sent,
      oi.shipped_email_sent,
      oi.created_at,
      oi.canceled_at,
      o.user_email,
      p.name AS product_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.status = 'Placed'
      AND oi.canceled_at IS NULL
      AND oi.confirmed_email_sent = 1
      AND oi.shipped_email_sent = 0
      AND oi.created_at <= NOW() - INTERVAL 3 HOUR
  `;

  db.query(shippedQuery, async (err, results) => {
    if (err) {
      console.error("SHIPPED EMAIL CHECK ERROR:", err);
      return;
    }

    for (const item of results) {
      try {
        await sendOrderStatusEmail(
          item.user_email,
          "WS Store - Your Order Has Been Shipped",
          `
            <h2>Your order is on the way</h2>
            <p><strong>Product:</strong> ${item.product_name || "Product"}</p>
            <p><strong>Option:</strong> ${item.kit_option || "-"}</p>
            <p><strong>Quantity:</strong> ${item.quantity}</p>
            <p><strong>Size:</strong> ${item.size || "-"}</p>
            ${item.customization ? `<p><strong>Customize:</strong> ${item.customization}</p>` : ""}
            <p>Your order has been shipped.</p>
            <p>It may take 4–5 days to arrive depending on your location.</p>
            <p>Thank you for shopping with WS Store.</p>
          `
        );

        db.query(
          `UPDATE order_items SET shipped_email_sent = 1 WHERE id = ?`,
          [item.id]
        );
      } catch (emailErr) {
        console.error(`SHIPPED EMAIL SEND ERROR for item ${item.id}:`, emailErr);
      }
    }
  });
}

app.put("/api/admin/order-items/:id/status", (req, res) => {
  const orderItemId = req.params.id;
  const { status } = req.body;

  const allowedStatuses = ["Placed", "Shipped", "Delivered"];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status"
    });
  }

  const getItemQuery = `
    SELECT 
      oi.id,
      oi.order_id,
      oi.status,
      oi.quantity,
      oi.size,
      oi.kit_option,
      oi.customization,
      oi.price,
      oi.product_id,
      oi.confirmed_email_sent,
      oi.shipped_email_sent,
      oi.delivered_email_sent,
      o.user_email,
      p.name AS product_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.id = ?
  `;

  db.query(getItemQuery, [orderItemId], async (getErr, results) => {
    if (getErr) {
      console.error("ADMIN GET ORDER ITEM ERROR:", getErr);
      return res.status(500).json({
        message: "Failed to fetch order item",
        error: getErr.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Order item not found"
      });
    }

    const item = results[0];

    const updateStatusQuery = `
      UPDATE order_items
      SET status = ?
      WHERE id = ?
    `;

    db.query(updateStatusQuery, [status, orderItemId], async (updateErr, updateResult) => {
      if (updateErr) {
        console.error("ADMIN UPDATE ORDER STATUS ERROR:", updateErr);
        return res.status(500).json({
          message: "Failed to update order status",
          error: updateErr.message
        });
      }

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({
          message: "Order item not found"
        });
      }

      try {
        if (status === "Shipped" && Number(item.shipped_email_sent) === 0) {
          await sendOrderStatusEmail(
            item.user_email,
            "WS Store - Your Order Has Been Shipped",
            `
              <h2>Your order is on the way</h2>
              <p><strong>Product:</strong> ${item.product_name || "Product"}</p>
              <p><strong>Option:</strong> ${item.kit_option || "-"}</p>
              <p><strong>Quantity:</strong> ${item.quantity}</p>
              <p><strong>Size:</strong> ${item.size || "-"}</p>
              ${item.customization ? `<p><strong>Customize:</strong> ${item.customization}</p>` : ""}
              <p>Your order has been shipped successfully.</p>
              <p>It may take 4–5 days to arrive depending on your location.</p>
              <p>Thank you for shopping with WS Store.</p>
            `
          );

          db.query(
            `UPDATE order_items SET shipped_email_sent = 1 WHERE id = ?`,
            [orderItemId]
          );
        }

        if (status === "Delivered" && Number(item.delivered_email_sent) === 0) {
          await sendOrderStatusEmail(
            item.user_email,
            "WS Store - Your Order Has Been Delivered",
            `
              <h2>Your order has been delivered</h2>
              <p><strong>Product:</strong> ${item.product_name || "Product"}</p>
              <p><strong>Option:</strong> ${item.kit_option || "-"}</p>
              <p><strong>Quantity:</strong> ${item.quantity}</p>
              <p><strong>Size:</strong> ${item.size || "-"}</p>
              ${item.customization ? `<p><strong>Customize:</strong> ${item.customization}</p>` : ""}
              <p>Thank you for shopping with WS Store.</p>
              <p>We are waiting for your feedback.</p>
            `
          );

          db.query(
            `UPDATE order_items SET delivered_email_sent = 1 WHERE id = ?`,
            [orderItemId]
          );
        }

        res.status(200).json({
          message: "Order status updated successfully"
        });
      } catch (emailErr) {
        console.error("ORDER STATUS EMAIL ERROR:", emailErr);
        return res.status(500).json({
          message: "Status updated, but email failed to send",
          error: emailErr.message
        });
      }
    });
  });
});

setInterval(checkOrderEmails, 5 * 60 * 1000);

// GET ALL CONTACT MESSAGES FOR ADMIN
app.get("/api/admin/contact-messages", (req, res) => {
  const query = `
    SELECT id, name, email, message, created_at
    FROM contact_messages
    ORDER BY id DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("ADMIN GET CONTACT MESSAGES ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch contact messages",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

// GET ONE CONTACT MESSAGE BY ID FOR ADMIN
app.get("/api/admin/contact-messages/:id", (req, res) => {
  const messageId = req.params.id;

  const query = `
    SELECT id, name, email, message, created_at
    FROM contact_messages
    WHERE id = ?
  `;

  db.query(query, [messageId], (err, results) => {
    if (err) {
      console.error("ADMIN GET ONE CONTACT MESSAGE ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch contact message",
        error: err.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Contact message not found"
      });
    }

    res.status(200).json(results[0]);
  });
});

// DELETE CONTACT MESSAGE FOR ADMIN
app.delete("/api/admin/contact-messages/:id", (req, res) => {
  const messageId = req.params.id;

  const query = `DELETE FROM contact_messages WHERE id = ?`;

  db.query(query, [messageId], (err, result) => {
    if (err) {
      console.error("ADMIN DELETE CONTACT MESSAGE ERROR:", err);
      return res.status(500).json({
        message: "Failed to delete contact message",
        error: err.message
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Contact message not found"
      });
    }

    res.status(200).json({
      message: "Contact message deleted successfully"
    });
  });
});

app.get("/api/admin/dashboard-stats", (req, res) => {
  const stats = {};

  const filter = req.query.filter || "day";

  let groupExpression = "DATE(o.created_at)";
  let orderExpression = "period";

  if (filter === "week") {
    groupExpression = "YEARWEEK(o.created_at, 1)";
  }

  if (filter === "month") {
    groupExpression = "DATE_FORMAT(o.created_at, '%Y-%m')";
  }

  const totalProductsQuery = "SELECT COUNT(*) AS totalProducts FROM products";
  const totalOrdersQuery = "SELECT COUNT(*) AS totalOrders FROM orders";
  const totalMessagesQuery = "SELECT COUNT(*) AS totalMessages FROM contact_messages";
  const totalCustomersQuery = "SELECT COUNT(*) AS totalCustomers FROM customers";

  db.query(totalProductsQuery, (err, productsResult) => {
    if (err) return res.status(500).json({ message: "Products count error", error: err.message });

    stats.totalProducts = productsResult[0].totalProducts;

    db.query(totalOrdersQuery, (err, ordersResult) => {
      if (err) return res.status(500).json({ message: "Orders count error", error: err.message });

      stats.totalOrders = ordersResult[0].totalOrders;

      db.query(totalMessagesQuery, (err, messagesResult) => {
        if (err) return res.status(500).json({ message: "Messages count error", error: err.message });

        stats.totalMessages = messagesResult[0].totalMessages;

        db.query(totalCustomersQuery, (err, customersResult) => {
          if (err) return res.status(500).json({ message: "Customers count error", error: err.message });

          stats.totalCustomers = customersResult[0].totalCustomers;

          const productsSoldQuery = `
            SELECT 
              ${groupExpression} AS period,
              SUM(oi.quantity) AS total_sold
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE oi.status <> 'Canceled'
            GROUP BY ${groupExpression}
            ORDER BY ${orderExpression}
          `;

          db.query(productsSoldQuery, (err, soldResult) => {
            if (err) return res.status(500).json({ message: "Products sold chart error", error: err.message });

            stats.productsSold = soldResult;

            const revenueQuery = `
              SELECT 
                ${groupExpression} AS period,
                SUM(oi.quantity * oi.price) AS revenue
              FROM orders o
              JOIN order_items oi ON o.id = oi.order_id
              WHERE oi.status <> 'Canceled'
              GROUP BY ${groupExpression}
              ORDER BY ${orderExpression}
            `;

            db.query(revenueQuery, (err, revenueResult) => {
              if (err) return res.status(500).json({ message: "Revenue chart error", error: err.message });

              stats.revenue = revenueResult;

              const topProductsQuery = `
                SELECT 
                  p.name,
                  SUM(oi.quantity) AS total_sold
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.status <> 'Canceled'
                GROUP BY p.id, p.name
                ORDER BY total_sold DESC
                LIMIT 5
              `;

              db.query(topProductsQuery, (err, topProductsResult) => {
                if (err) return res.status(500).json({ message: "Top products chart error", error: err.message });

                stats.topProducts = topProductsResult;
                stats.filter = filter;

                res.json(stats);
              });
            });
          });
        });
      });
    });
  });
});

app.post("/api/admin/contact-messages/reply", async (req, res) => {
  const { to, subject, replyMessage } = req.body;

  if (!to || !subject || !replyMessage) {
    return res.status(400).json({
      message: "Recipient email, subject, and reply message are required"
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Reply from WS Store</h2>
          <p>${replyMessage}</p>
          <br>
          <p>Best regards,</p>
          <p><strong>WS Store Admin</strong></p>
        </div>
      `
    });

    res.status(200).json({
      message: "Reply sent successfully"
    });
  } catch (error) {
    console.error("REPLY EMAIL ERROR:", error);
    res.status(500).json({
      message: "Failed to send reply email",
      error: error.message
    });
  }
});

app.get("/api/stripe/config", (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

app.post("/api/stripe/create-payment-intent", async (req, res) => {
  const { user_email } = req.body;

  if (!user_email) {
    return res.status(400).json({ message: "User email is required" });
  }

  const query = `
    SELECT
      ci.quantity,
      COALESCE(ci.price, p.price) AS price
    FROM cart c
    JOIN cart_items ci ON c.id = ci.cart_id
    JOIN products p ON p.id = ci.product_id
    WHERE c.user_email = ?
  `;

  db.query(query, [user_email], async (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Database error while reading cart",
        error: err.message
      });
    }

    if (!results.length) {
      return res.status(400).json({
        message: "Cart is empty"
      });
    }

    const total = results.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100),
        currency: "usd",
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          user_email
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (stripeError) {
      res.status(500).json({
        message: "Failed to create Stripe payment intent",
        error: stripeError.message
      });
    }
  });
});
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required"
    });
  }

  const resetCode = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const findUserQuery = "SELECT id, email FROM customers WHERE email = ?";

  db.query(findUserQuery, [email], (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Database error while checking email",
        error: findErr.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "No account found with this email"
      });
    }

    const updateQuery = `
      UPDATE customers
      SET reset_code = ?, reset_code_expires = ?
      WHERE email = ?
    `;

    db.query(updateQuery, [resetCode, expiresAt, email], async (updateErr) => {
      if (updateErr) {
        return res.status(500).json({
          message: "Database error while saving reset code",
          error: updateErr.message
        });
      }

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: "WS Store Password Reset Code",
          text: `Your password reset code is: ${resetCode}. This code expires in 10 minutes.`
        });

        res.status(200).json({
          message: "Password reset code sent to your email"
        });
      } catch (emailErr) {
        console.error("RESET PASSWORD EMAIL ERROR:", emailErr);
        return res.status(500).json({
          message: "Reset code saved, but email could not be sent",
          error: emailErr.message
        });
      }
    });
  });
});
app.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({
      message: "Email, reset code, and new password are required"
    });
  }

  const findUserQuery = `
    SELECT id, email, reset_code, reset_code_expires
    FROM customers
    WHERE email = ?
  `;

  db.query(findUserQuery, [email], async (findErr, results) => {
    if (findErr) {
      return res.status(500).json({
        message: "Database error while checking reset code",
        error: findErr.message
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    const user = results[0];

    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({
        message: "Invalid reset code"
      });
    }

    const now = new Date();
    const expiresAt = new Date(user.reset_code_expires);

    if (now > expiresAt) {
      return res.status(400).json({
        message: "Reset code has expired"
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatePasswordQuery = `
        UPDATE customers
        SET password = ?, reset_code = NULL, reset_code_expires = NULL
        WHERE email = ?
      `;

      db.query(updatePasswordQuery, [hashedPassword, email], (updateErr) => {
        if (updateErr) {
          return res.status(500).json({
            message: "Database error while updating password",
            error: updateErr.message
          });
        }

        res.status(200).json({
          message: "Password reset successfully"
        });
      });
    } catch (hashErr) {
      return res.status(500).json({
        message: "Error while securing new password",
        error: hashErr.message
      });
    }
  });
});
app.get("/api/admin/reviews", (req, res) => {
  const query = `
    SELECT
      r.id AS review_id,
      r.product_id,
      r.user_name,
      r.user_email,
      r.review_text,
      r.rating,
      r.kit_variant,
      r.created_at,
      p.name AS product_name,
      p.image AS product_image
    FROM reviews r
    LEFT JOIN products p ON r.product_id = p.id
    ORDER BY r.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("ADMIN REVIEWS ERROR:", err);

      return res.status(500).json({
        message: "Failed to load admin reviews",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});

app.post("/api/chatbot", (req, res) => {
  const { message, language } = req.body;

  if (!message) {
    return res.status(400).json({
      reply: "Message is required"
    });
  }

  const text = message.toLowerCase();

  // SAVE CHATBOT MESSAGE
function saveChatbotMessage(replyText) {

  const userName = req.body.user_name || "Guest User";

  db.query(
    `INSERT INTO chatbot_messages 
    (user_name, user_message, bot_reply, language) 
    VALUES (?, ?, ?, ?)`,
    
    [
      userName,
      message,
      replyText,
      language || "english"
    ],

    (err) => {
      if (err) {
        console.error("SAVE CHATBOT MESSAGE ERROR:", err);
      }
    }
  );
}

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey") ||
    text.includes("مرحبا") ||
    text.includes("اهلا")
  ) {

    const reply = language === "arabic"
      ? "أهلاً بك في WS Store! كيف يمكنني مساعدتك؟"
      : "Hello! Welcome to WS Store. How can I help you?";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("thank you") ||
    text.includes("thanks") ||
    text.includes("thank") ||
    text.includes("شكرا") ||
    text.includes("شكراً")
  ) {

    const reply = language === "arabic"
      ? "على الرحب والسعة! إذا احتجت أي مساعدة أخرى أنا هنا."
      : "You're welcome! If you need anything else, I’m here to help.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("racket") ||
    text.includes("racquet") ||
    text.includes("مضرب")
  ) {

    const reply = language === "arabic"
      ? "حالياً لا يوجد مضارب في WS Store، ولكن يمكن أن نوفرها قريباً. يمكنك التواصل معنا من صفحة Contact Us لطلبها."
      : "Currently, rackets are not available in WS Store, but they may be added soon. You can contact us through the Contact Us form to request them.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("payment") ||
    text.includes("pay") ||
    text.includes("card") ||
    text.includes("cash") ||
    text.includes("دفع") ||
    text.includes("كاش") ||
    text.includes("بطاقة")
  ) {

    const reply = language === "arabic"
      ? "نحن نقبل الدفع عند الاستلام والدفع بواسطة البطاقة البنكية."
      : "We accept Cash on Delivery and Bank Card payments.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("cancel") ||
    text.includes("cancellation") ||
    text.includes("إلغاء") ||
    text.includes("الغاء")
  ) {

    const reply = language === "arabic"
      ? "يمكنك إلغاء الطلب خلال ساعتين فقط من وقت تنفيذ الطلب. بعد مرور ساعتين لا يمكن إلغاء الطلب."
      : "You can cancel your order within 2 hours after placing it. After 2 hours, cancellation will no longer be available.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("location") ||
    text.includes("where") ||
    text.includes("address") ||
    text.includes("موقع") ||
    text.includes("عنوان") ||
    text.includes("أين")
  ) {

    const reply = language === "arabic"
      ? "يقع متجر WS Store في لبنان، البقاع، برالياس، الطريق العام."
      : "WS Store is located in Lebanon, Bekaa-Barleis, Main Road.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("phone") ||
    text.includes("number") ||
    text.includes("call") ||
    text.includes("رقم") ||
    text.includes("هاتف")
  ) {

    const reply = language === "arabic"
      ? "يمكنك التواصل معنا على الرقم: +961 70 465 429."
      : "You can contact WS Store by phone at +961 70 465 429.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("email") ||
    text.includes("support") ||
    text.includes("contact") ||
    text.includes("ايميل") ||
    text.includes("إيميل") ||
    text.includes("دعم")
  ) {

    const reply = language === "arabic"
      ? "يمكنك التواصل معنا عبر البريد الإلكتروني tradmohammad20@gmail.com أو من خلال نموذج Contact Us."
      : "You can contact support by email at tradmohammad20@gmail.com or by using the Contact Us form.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  if (
    text.includes("delivery") ||
    text.includes("shipping") ||
    text.includes("ship") ||
    text.includes("توصيل") ||
    text.includes("شحن")
  ) {

    const reply = language === "arabic"
      ? "بعد تأكيد الطلب، يمكن للإدارة تحديث حالة الطلب إلى تم الشحن، وسيصلك بريد إلكتروني عند شحن الطلب أو تسليمه."
      : "After your order is confirmed, the admin can update it to shipped. You will receive an email when your order is shipped or delivered.";

    saveChatbotMessage(reply);

    return res.json({ reply });
  }

  const stopWords = [
    "show", "me", "products", "product", "do", "you", "have", "any",
    "please", "i", "want", "need", "find", "search", "for", "about",
    "is", "there", "available", "availability", "price", "how", "much",
    "what", "are", "the", "a", "an", "in", "of", "with"
  ];

  let cleanWords = text
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word));

  const arabicMap = {
    "نايك": "nike",
    "اديداس": "adidas",
    "أديداس": "adidas",
    "بوما": "puma",
    "كرة": "football",
    "قدم": "football",
    "فوتبول": "football",
    "سلة": "basketball",
    "تنس": "tennis",
    "جري": "running",
    "ركض": "running",
    "سباحة": "swimming",
    "ملاكمة": "boxing",
    "دراجة": "cycling",
    "يوغا": "yoga",
    "حذاء": "shoes",
    "أحذية": "shoes",
    "جزمة": "shoes",
    "قميص": "kit",
    "طقم": "kit",
    "تيشيرت": "kit"
  };

  cleanWords = cleanWords.map(word => arabicMap[word] || word);

  if (cleanWords.length > 0) {

    const searchConditions = cleanWords.map(() => `
      (
        LOWER(p.name) LIKE ?
        OR LOWER(p.brand) LIKE ?
        OR LOWER(p.description) LIKE ?
        OR LOWER(c.name) LIKE ?
      )
    `).join(" AND ");

    const values = [];

    cleanWords.forEach(word => {
      const value = `%${word}%`;
      values.push(value, value, value, value);
    });

    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.brand,
        p.quantity,
        c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${searchConditions}
      ORDER BY p.name ASC
      LIMIT 8
    `;

    db.query(query, values, (err, results) => {

      if (err) {
        console.error("CHATBOT PRODUCT SEARCH ERROR:", err);

        const reply = language === "arabic"
          ? "حدث خطأ أثناء البحث عن المنتجات."
          : "Server error while searching products.";

        saveChatbotMessage(reply);

        return res.json({ reply });
      }

      if (!results || results.length === 0) {

        const reply = language === "arabic"
          ? "حالياً هذا المنتج غير متوفر في WS Store، ولكن يمكن أن نوفره قريباً. يمكنك التواصل معنا من صفحة Contact Us لطلبه."
          : "Currently, this product is not available in WS Store, but it may be added soon. You can contact us through the Contact Us form to request it.";

        saveChatbotMessage(reply);

        return res.json({ reply });
      }

      let reply = language === "arabic"
        ? "نعم، هذه بعض المنتجات المتوفرة لدينا:\n\n"
        : "Yes, here are some products available in our store:\n\n";

      results.forEach(product => {

        const stockText = Number(product.quantity) > 0
          ? (language === "arabic" ? "متوفر" : "In stock")
          : (language === "arabic" ? "غير متوفر حالياً" : "Currently out of stock");

        reply += `• ${product.name} - $${product.price} - ${stockText}\n`;
      });

      saveChatbotMessage(reply);

      return res.json({ reply });
    });

    return;
  }

  const reply = language === "arabic"
    ? "يمكنني مساعدتك في معرفة المنتجات المتوفرة، الأسعار، الطلبات، الدفع، التوصيل، والإلغاء."
    : "I can help you with available products, prices, orders, payment, delivery, and cancellation.";

  saveChatbotMessage(reply);

  res.json({ reply });
});
app.get("/api/admin/chatbot-messages", (req, res) => {

  const query = `
    SELECT *
    FROM chatbot_messages
    ORDER BY created_at DESC
  `;

  db.query(query, (err, results) => {

    if (err) {
      console.error("CHATBOT LOGS ERROR:", err);

      return res.status(500).json({
        message: "Failed to load chatbot messages",
        error: err.message
      });
    }

    res.json(results);

  });

});
app.get("/api/admin/stock-by-size", (req, res) => {
  const query = `
    SELECT 
      p.id AS product_id,
      p.name,
      p.image,
      p.brand,
      c.name AS category_name,
      ps.size,
      ps.quantity,
      ps.kit_variant
    FROM product_sizes ps
    JOIN products p ON ps.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name ASC,
             ps.kit_variant ASC,
             CASE 
               WHEN ps.size = 'S' THEN 1
               WHEN ps.size = 'M' THEN 2
               WHEN ps.size = 'L' THEN 3
               WHEN ps.size = 'XL' THEN 4
               WHEN ps.size = '2XL' THEN 5
               WHEN ps.size = '3XL' THEN 6
               ELSE CAST(ps.size AS UNSIGNED)
             END ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("ADMIN STOCK ERROR:", err);
      return res.status(500).json({
        message: "Failed to fetch stock by size",
        error: err.message
      });
    }

    res.status(200).json(results);
  });
});
app.get("/api/admin/chatbot-messages", (req, res) => {

    const query = `
        SELECT *
        FROM chatbot_messages
        ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.error("CHATBOT MESSAGES ERROR:", err);

            return res.status(500).json({
                message: "Failed to load chatbot messages"
            });
        }

        res.status(200).json(results);
    });
});
app.get("/api/admin/export-orders", async (req, res) => {
    try {

        const query = `
    SELECT 
        o.id AS order_id,
        o.user_email,
        o.total,
        o.payment_method,
        o.phone1,
        o.phone2,
        o.address,
        o.created_at,

        p.name AS product_name,

        oi.quantity,
        oi.size,
        oi.kit_variant,

        p.price,

        oi.status

    FROM orders o

    LEFT JOIN order_items oi 
        ON o.id = oi.order_id

    LEFT JOIN products p 
        ON oi.product_id = p.id

    ORDER BY o.created_at DESC
`;

        db.query(query, async (err, results) => {

            if (err) {
                console.error("EXPORT ORDERS ERROR:", err);

                return res.status(500).json({
                    message: "Failed to export orders"
                });
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Orders");

            worksheet.columns = [
                { header: "Order ID", key: "order_id", width: 12 },
                { header: "Customer Email", key: "user_email", width: 30 },
                { header: "Product", key: "product_name", width: 30 },
                { header: "Quantity", key: "quantity", width: 12 },
                { header: "Size", key: "size", width: 10 },
                { header: "Kit Type", key: "kit_variant", width: 15 },
                { header: "Price", key: "price", width: 12 },
                { header: "Total", key: "total", width: 12 },
                { header: "Payment", key: "payment_method", width: 20 },
                { header: "Phone 1", key: "phone1", width: 18 },
                { header: "Phone 2", key: "phone2", width: 18 },
                { header: "Address", key: "address", width: 30 },
                { header: "Status", key: "status", width: 15 },
                { header: "Order Date", key: "created_at", width: 25 }
            ];

            results.forEach(order => {
                worksheet.addRow(order);
            });

            worksheet.getRow(1).font = {
                bold: true
            };

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=orders.xlsx"
            );

            await workbook.xlsx.write(res);

            res.end();
        });

    } catch (error) {
        console.error("EXPORT ERROR:", error);

        res.status(500).json({
            message: "Server error while exporting orders"
        });
    }
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("✅ Connected to MySQL database");
});