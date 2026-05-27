console.log("script.js loaded");
let currentDetailProduct = null;
let selectedDetailQuantity = 0;
let availableDetailStock = 0;
let detailBaseAvailableStock = 0;
let editingReviewId = null;
let selectedKitVariant = "home";
let selectedKitOption = "full-kit";
let selectedClothingSize = null;
let isCustomizeEnabled = false;
let stripe = null;
let stripeElements = null;
let stripePaymentElement = null;
let stripeClientSecret = null;
let selectedReviewRating = 0;
/* SPLASH SCREEN REDIRECT */
const isIndexPage =
    window.location.pathname.toLowerCase().includes("index.html") ||
    window.location.pathname.endsWith("/");

if (document.body.classList.contains("splash-body") && isIndexPage) {
    setTimeout(function () {
        window.location.href = "home.html";
    }, 3500);
}

/* PREVENT SCROLL RESTORE AFTER REFRESH */
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

/* PRODUCT DATABASE */
const localProducts = [
    { id: 1, name: "Adidas Predator Black Elite", price: 120, image: "images/adidas-1.jpg", description: "Precision control boots designed for powerful shots and accuracy.", category: "Football", brand: "Adidas", hasSizes: true },
    { id: 2, name: "Adidas X Speedflow Red", price: 210, image: "images/adidas-2.jpg", description: "Ultra-light boots built for speed and explosive acceleration.", category: "Football", brand: "Adidas", hasSizes: true },
    { id: 3, name: "Adidas Copa Pure Control", price: 320, image: "images/adidas-3.jpg", description: "Classic design with modern comfort and superior ball control.", category: "Football", brand: "Adidas", hasSizes: true },
    { id: 4, name: "Adidas Predator Edge Black", price: 100, image: "images/adidas-4.jpg", description: "Enhanced grip and control for midfield dominance.", category: "Football", brand: "Adidas", hasSizes: true },
    { id: 5, name: "Adidas X Crazyfast Elite", price: 350, image: "images/adidas-5.jpg", description: "Engineered for maximum speed and agility on the pitch.", category: "Football", brand: "Adidas", hasSizes: true },
    { id: 6, name: "Adidas Predator Accuracy Pro", price: 420, image: "images/adidas-6.jpg", description: "Top-level performance boots for precision and power.", category: "Football", brand: "Adidas", hasSizes: true },

    { id: 7, name: "Mercurial Vapor", price: 440, image: "images/nike-1.jpg", description: "Professional football shoes for speed and control.", category: "Football", brand: "Nike", hasSizes: true },
    { id: 8, name: "Phantom GX", price: 170, image: "images/nike-2.jpg", description: "Football shoes built for touch and accuracy.", category: "Football", brand: "Nike", hasSizes: true },
    { id: 29, name: "Nike Tiempo Legend", price: 240, image: "images/nike-3.jpg", description: "Professional football shoes for matches and training.", category: "Football", brand: "Nike", hasSizes: true },
    { id: 30, name: "Nike Zoom Mercurial", price: 140, image: "images/nike-4.jpg", description: "Comfortable football shoes with responsive feel.", category: "Football", brand: "Nike", hasSizes: true },
    { id: 31, name: "Nike Phantom Luna", price: 150, image: "images/nike-5.jpg", description: "Football shoes with strong traction and fit.", category: "Football", brand: "Nike", hasSizes: true },
    { id: 32, name: "Nike Air Zoom GX", price: 190, image: "images/nike-6.jpg", description: "Performance football shoes for fast play.", category: "Football", brand: "Nike", hasSizes: true },

    { id: 33, name: "Puma Future Ultimate", price: 190, image: "images/puma-1.jpg", description: "Professional football shoes for matches.", category: "Football", brand: "Puma", hasSizes: true },
    { id: 34, name: "Puma Ultra Match", price: 190, image: "images/puma-2.jpg", description: "Light football shoes for training and matches.", category: "Football", brand: "Puma", hasSizes: true },
    { id: 35, name: "Puma King Pro", price: 290, image: "images/puma-3.jpg", description: "Classic football shoes with modern comfort.", category: "Football", brand: "Puma", hasSizes: true },
    { id: 36, name: "Puma Future Play", price: 90, image: "images/puma-4.jpg", description: "Comfortable football shoes for daily play.", category: "Football", brand: "Puma", hasSizes: true },
    { id: 37, name: "Football", price: 40, image: "images/football.jpg", description: "High-performance match-level football.", category: "Football", brand: "Nike", hasSizes: false },

    { id: 9, name: "Adidas Basketball Shoes", price: 130, image: "images/basket-adidas-2.jpg", description: "Comfortable basketball shoes with strong grip.", category: "Basketball", brand: "Adidas", hasSizes: true },
    { id: 10, name: "Nike Basketball Shoes", price: 155, image: "images/basket-2.jpg", description: "Premium basketball shoes for indoor and outdoor use.", category: "Basketball", brand: "Nike", hasSizes: true },
    { id: 11, name: "Puma Basketball Shoes", price: 160, image: "images/basket-puma-2.png", description: "Lightweight basketball shoes for daily training.", category: "Basketball", brand: "Puma", hasSizes: true },

    { id: 12, name: "Adidas Volleyball Shoes", price: 110, image: "images/adidas-volleyball.jpg", description: "Volleyball shoes designed for jumps and quick movement.", category: "Volleyball", brand: "Adidas", hasSizes: true },
    { id: 13, name: "Nike Volleyball Shoes", price: 145, image: "images/nike-volleyball.png", description: "Durable volleyball shoes for training and matches.", category: "Volleyball", brand: "Nike", hasSizes: true },
    { id: 14, name: "Puma Volleyball Shoes", price: 165, image: "images/puma-volleyball.jpg", description: "Volleyball shoes with comfortable support.", category: "Volleyball", brand: "Puma", hasSizes: true },

    { id: 15, name: "Adidas Tennis Shoes", price: 125, image: "images/tennis-adidas.jpg", description: "Tennis shoes designed for court stability.", category: "Tennis", brand: "Adidas", hasSizes: true },
    { id: 16, name: "Nike Tennis Shoes", price: 180, image: "images/tennis-nike.jpg", description: "Tennis shoes for fast movement and comfort.", category: "Tennis", brand: "Nike", hasSizes: true },
    { id: 17, name: "Puma Tennis Shoes", price: 175, image: "images/tennis-puma.jpg", description: "Comfortable tennis shoes for practice and matches.", category: "Tennis", brand: "Puma", hasSizes: true },

    { id: 18, name: "Adidas Running Shoes", price: 120, image: "images/adidas-running.jpg", description: "Running shoes made for comfort and endurance.", category: "Running", brand: "Adidas", hasSizes: true },
    { id: 19, name: "Nike Running Shoes", price: 115, image: "images/nike-running.jpg", description: "Running shoes designed for lightweight movement.", category: "Running", brand: "Nike", hasSizes: true },
    { id: 20, name: "Puma Running Shoes", price: 168, image: "images/puma-running.jpg", description: "Running shoes for daily training and comfort.", category: "Running", brand: "Puma", hasSizes: true },

    { id: 21, name: "Adidas Gym Gloves", price: 25, image: "images/adidas-gym.jpg", description: "Gym gloves for better grip and hand protection.", category: "Gym", brand: "Adidas", hasSizes: false },
    { id: 22, name: "Nike Water Bottle", price: 15, image: "images/nike-bottle.jpg", description: "Sports bottle suitable for gym sessions.", category: "Gym", brand: "Nike", hasSizes: false },
    { id: 23, name: "Puma Training Bag", price: 70, image: "images/puma-bag.jpg", description: "Training bag with enough space for gym essentials.", category: "Gym", brand: "Puma", hasSizes: false }
];

const localProductsById = {};
const localProductsByName = {};
localProducts.forEach(function (product) {
    localProductsById[String(product.id)] = product;
    localProductsByName[product.name] = product;
});

let currentProducts = [...localProducts];

/* PAGE LOAD */
document.addEventListener("DOMContentLoaded", async function () {
    window.scrollTo(0, 0);

    await syncCartFromDatabase();

    updateCartCounter();
    await updateWishlistCounter();
    await loadCartPage();
    await loadProductDetails();
    await loadWishlistPage();
    await markWishlistButtons();
    loadOrderSuccessPage();
    startCancelCountdown();
    loadOrdersPage();
    loadBrandsTitle();
    loadBrandsPage();
    updateAuthUI();
    setupContactForm();
    animateStatsOnScroll();
    loadProductsPage();
    autofillReviewName();
    await loadFeaturedProductsSlider();
});

/* DOM READY */
document.addEventListener("DOMContentLoaded", function () {
    const cardNumberInput = document.getElementById("cardNumber");
    const expiryDateInput = document.getElementById("expiryDate");
    const registerForm = document.getElementById("registerForm");
    const reviewNameText = document.getElementById("reviewNameText");
    const resetPasswordEmailInput = document.getElementById("resetPasswordEmail");

    if (window.location.pathname.includes("verify.html")) {
        startResendTimer();
    }

    if (resetPasswordEmailInput) {
        resetPasswordEmailInput.value =
            localStorage.getItem("resetPasswordEmail") || "";
    }

    if (reviewNameText) {
        const userName =
            localStorage.getItem("userFullName") ||
            localStorage.getItem("userName") ||
            localStorage.getItem("fullname") ||
            "Customer";

        reviewNameText.textContent = userName;
    }

    if (cardNumberInput) {
        cardNumberInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\D/g, "").substring(0, 16);
            value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
            e.target.value = value;
        });
    }

    if (expiryDateInput) {
        expiryDateInput.addEventListener("input", function (e) {
            let value = e.target.value.replace(/\D/g, "").substring(0, 4);

            if (value.length >= 3) {
                value = value.substring(0, 2) + "/" + value.substring(2);
            }

            e.target.value = value;
        });
    }

    document.querySelectorAll("#phone1, #phone2").forEach(function (input) {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/\D/g, "");
        });
    });

    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fullname = document.getElementById("fullname")?.value.trim();
            const email = document.getElementById("email")?.value.trim();
            const password = document.getElementById("password")?.value.trim();
            const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

            if (!fullname || !email || !password || !confirmPassword) {
                alert("❌ Please fill all fields");
                return;
            }

            if (!isValidEmail(email)) {
                alert("❌ Please enter a valid email");
                return;
            }

            if (password !== confirmPassword) {
                alert("❌ Passwords do not match");
                return;
            }

            try {
                const response = await fetch("http://localhost:5000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullname,
                        email,
                        password,
                        phone: "00000000"
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert("❌ " + data.message);
                    return;
                }

                alert("📧 Verification code sent to your email");
                localStorage.setItem("pendingVerificationEmail", email);
                window.location.href = "verify.html";

            } catch (error) {
                console.error(error);
                alert("❌ Server error");
            }
        });
    }
    const imageFileInput = document.getElementById("imageFile");

if (imageFileInput) {
    imageFileInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) return;

        document.getElementById("adminProductImage").value =
            "images/" + file.name;
    });
}
});

/* HELPERS */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return regex.test(email);
}

function normalizeProduct(product) {
    const localMatch = localProductsById[String(product.id)] || localProductsByName[product.name] || {};
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];

    return {
        id: Number(product.id),
        name: product.name,
        price: Number(product.price),
        image: product.image || localMatch.image || "images/no-image.png",
        description: product.description || localMatch.description || "No description available.",
        category: product.category || localMatch.category || "",
        brand: product.brand || localMatch.brand || "",
        quantity: typeof product.quantity !== "undefined" ? Number(product.quantity) : 0,
        sizes: sizes.map(function (sizeItem) {
            return {
                id: sizeItem.id,
                product_id: Number(sizeItem.product_id),
                size: String(sizeItem.size),
                quantity: Number(sizeItem.quantity || 0)
            };
        }),
        hasSizes: sizes.length > 0 || product.has_sizes === true || product.hasSizes === true || !!localMatch.hasSizes
    };
}

async function getAvailableProducts() {
    console.log("getAvailableProducts called");

    currentProducts = [...localProducts];

    try {
        const response = await fetch("http://localhost:5000/products");

        if (!response.ok) throw new Error("Failed");

        const products = await response.json();
        console.log("Products from DB:", products);

        if (Array.isArray(products) && products.length > 0) {
            currentProducts = products.map(normalizeProduct);
        }
    } catch (error) {
        console.log("Using local products (fallback)", error);
    }

    return currentProducts;
}

function getProductById(productId) {
    const idAsString = String(productId);
    return currentProducts.find(function (product) {
        return String(product.id) === idAsString;
    }) || localProductsById[idAsString] || null;
}

function getProductByNameAndPrice(productName, productPrice) {
    return currentProducts.find(function (product) {
        return product.name === productName && Number(product.price) === Number(productPrice);
    }) || localProducts.find(function (product) {
        return product.name === productName && Number(product.price) === Number(productPrice);
    }) || null;
}

function getFilteredProducts(products) {
    const selectedCategory = localStorage.getItem("selectedCategory");
    const selectedBrand = localStorage.getItem("selectedBrand");

    if (selectedCategory && selectedBrand) {
        return products.filter(function (product) {
            return product.category === selectedCategory && product.brand === selectedBrand;
        });
    }

    if (selectedCategory) {
        return products.filter(function (product) {
            return product.category === selectedCategory;
        });
    }

    return products;
}

function updateProductsTitle() {
    const pageTitle = document.getElementById("productsPageTitle");
    if (!pageTitle) return;

    const selectedCategory = localStorage.getItem("selectedCategory");
    const selectedBrand = localStorage.getItem("selectedBrand");

    if (selectedCategory && selectedBrand) {
        pageTitle.textContent = selectedCategory + " - " + selectedBrand;
        return;
    }

    if (selectedCategory) {
        pageTitle.textContent = selectedCategory;
        return;
    }

    pageTitle.textContent = "Our Products";
}

/* SCROLL TO CONTACT */
function scrollToContact() {
    let contact = document.getElementById("contact");
    if (!contact) return;

    contact.scrollIntoView({
        behavior: "smooth"
    });
}

/* CONTACT ANIMATION + BACK TO TOP */
window.addEventListener("scroll", function () {
    let contact = document.getElementById("contact");
    let address = document.getElementById("address");
    let backToTop = document.getElementById("backToTop");

    if (contact && address) {
        let position = contact.getBoundingClientRect().top;
        let screenPosition = window.innerHeight / 1.3;

        if (position < screenPosition) {
            address.classList.add("show");
        }
    }

    if (backToTop && contact) {
        let contactPosition = contact.getBoundingClientRect().top;
        let screenHeight = window.innerHeight;

        if (contactPosition < screenHeight) {
            backToTop.style.display = "block";
        } else {
            backToTop.style.display = "none";
        }
    }

    animateStatsOnScroll();
});

/* BACK TO TOP */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* SEARCH PRODUCTS */
function searchProducts() {
    let input = document.getElementById("searchInput");
    let productList = document.getElementById("productList");
    let suggestionsBox = document.getElementById("searchSuggestions");

    if (!input || !productList) return;

    let value = input.value.toLowerCase();
    let products = productList.querySelectorAll(".product-card");

    products.forEach(function (product) {
        let name = (product.getAttribute("data-name") || "").toLowerCase();
        product.style.display = name.includes(value) ? "block" : "none";
    });

    if (value === "" && suggestionsBox) {
        suggestionsBox.style.display = "none";
    }
}

function showSearchSuggestions() {
    const input = document.getElementById("searchInput");
    const suggestionsBox = document.getElementById("searchSuggestions");

    if (!input || !suggestionsBox) return;

    const searchValue = input.value.trim().toLowerCase();
    suggestionsBox.innerHTML = "";

    if (searchValue === "") {
        suggestionsBox.style.display = "none";
        return;
    }

    const filteredProducts = getFilteredProducts(currentProducts);
    const productNames = [...new Set(filteredProducts.map(function (product) {
        return product.name;
    }))];

    const matches = productNames.filter(function (name) {
        return name.toLowerCase().includes(searchValue);
    }).slice(0, 6);

    if (matches.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    matches.forEach(function (name) {
        const item = document.createElement("div");
        item.classList.add("search-suggestion-item");
        item.textContent = name;

        item.onclick = function () {
            input.value = name;
            suggestionsBox.style.display = "none";
            searchProducts();
        };

        suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = "block";
}

document.addEventListener("click", function (e) {
    const searchWrapper = document.querySelector(".search-wrapper");
    const suggestionsBox = document.getElementById("searchSuggestions");

    if (!searchWrapper || !suggestionsBox) return;

    if (!searchWrapper.contains(e.target)) {
        suggestionsBox.style.display = "none";
    }
});

/* SORT PRODUCTS */
async function sortProducts() {
    const sortOption = document.getElementById("sortOption");
    if (!sortOption) return;

    const sortValue = sortOption.value;

    let products = await getAvailableProducts();
    products = getFilteredProducts(products);

    if (sortValue === "default" || sortValue === "") {
        products.sort(function (a, b) {
            return Number(a.id) - Number(b.id);
        });
    }

    if (sortValue === "priceLowHigh") {
        products.sort(function (a, b) {
            return Number(a.price) - Number(b.price);
        });
    }

    if (sortValue === "priceHighLow") {
        products.sort(function (a, b) {
            return Number(b.price) - Number(a.price);
        });
    }

    if (sortValue === "nameAZ") {
        products.sort(function (a, b) {
            return a.name.localeCompare(b.name);
        });
    }

    if (sortValue === "nameZA") {
        products.sort(function (a, b) {
            return b.name.localeCompare(a.name);
        });
    }

    renderProductsList(products);
    await markWishlistButtons();
}

/* LOGIN SYSTEM */
function isLoggedIn() {
    return localStorage.getItem("userEmail")
}

function requireLogin() {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }

    return true;
}

/* ADD TO CART */
async function addToCart(productName, productPrice, quantityToAdd = 1) {
    const product = currentDetailProduct || getProductByNameAndPrice(productName, productPrice);

    if (!product) {
        showCartMessage("❌ Product not found.");
        return;
    }

    if (!requireLogin()) return;

    const kitProduct = isKitProduct(product);
    const shoeSizeRequired = isSizeRequiredProduct(product);
    const selectedShoeSize = localStorage.getItem("selectedSize");

    let finalPrice = Number(product.price || 0);
    let selectedSize = shoeSizeRequired ? selectedShoeSize : null;
    let selectedOption = null;
    let customName = null;
    let customNumber = null;
    let customizationText = null;

    if (kitProduct) {
        if (!selectedClothingSize) {
            showCartMessage("❌ You must choose a size first.");
            return;
        }

        selectedSize = selectedClothingSize;
        selectedOption = selectedKitOption === "full-kit" ? "Full Kit" : "T-Shirt Only";
        finalPrice = selectedKitOption === "full-kit"
            ? Number(product.price || 0) + 10
            : Number(product.price || 0);

        if (isCustomizeEnabled) {
            const customNameInput = document.getElementById("customName");
            const customNumberInput = document.getElementById("customNumber");

            customName = customNameInput ? customNameInput.value.trim() : "";
            customNumber = customNumberInput ? customNumberInput.value.trim() : "";

            if (!customName) {
                showCartMessage("❌ If you customize the kit, name is required.");
                return;
            }

            customizationText = customNumber
                ? `${customName} - ${customNumber}`
                : customName;
        }

        localStorage.setItem("selectedKitVariant", selectedKitVariant);
        localStorage.setItem("selectedKitOption", selectedOption || "");
        localStorage.setItem("selectedKitFinalPrice", String(finalPrice));
        localStorage.setItem("selectedKitCustomName", customName || "");
        localStorage.setItem("selectedKitCustomNumber", customNumber || "");
    }

    if (shoeSizeRequired && !selectedShoeSize) {
        showCartMessage("❌ You must choose a size first.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/cart/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: localStorage.getItem("userEmail"),
                product_id: product.id,
                quantity: quantityToAdd,
                size: selectedSize,
                price: finalPrice,
                kit_variant: kitProduct ? selectedKitVariant : null,
                kit_option: selectedOption,
                custom_name: customName,
                custom_number: customNumber,
                customization: customizationText
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showCartMessage("❌ " + (data.message || "Failed to add to cart"));
            return;
        }

        await syncCartFromDatabase();

        if (shoeSizeRequired) {
            localStorage.removeItem("selectedSize");
            document.querySelectorAll("#sizesContainer .size-btn").forEach(function (btn) {
                btn.classList.remove("active");
            });
        }

        if (kitProduct) {
            selectedClothingSize = null;
            isCustomizeEnabled = false;

            document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (btn) {
                btn.classList.remove("active");
            });

            const customizeFields = document.getElementById("customizeFields");
            const customNameInput = document.getElementById("customName");
            const customNumberInput = document.getElementById("customNumber");

            if (customizeFields) customizeFields.style.display = "none";
            if (customNameInput) customNameInput.value = "";
            if (customNumberInput) customNumberInput.value = "";
        }

        selectedDetailQuantity = 1;
        updateDetailQuantityUI();
        updateDetailStockUI();
        updateCartCounter();
        await loadCartPage();

        showCartMessage("✔ Product added to cart");
    } catch (error) {
        console.error("Add to cart error:", error);
        showCartMessage("❌ Server error");
    }
}

/* CART MESSAGE */
function showCartMessage(message) {
    const cartMessage = document.getElementById("cartMessage");
    if (!cartMessage) {
        alert(message);
        return;
    }

    cartMessage.textContent = message;
    cartMessage.classList.add("show");

    setTimeout(function () {
        cartMessage.classList.remove("show");
    }, 2500);
}

/* CART COUNTER */
function updateCartCounter() {
    const cartCount = document.getElementById("cartCount");
    if (!cartCount) return;

    const cart = getCart();

    cartCount.textContent = cart.length;
}
/* WISHLIST COUNTER */
async function updateWishlistCounter() {
    let wishlistCount = document.getElementById("wishlistCount");
    if (!wishlistCount) return;

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        wishlistCount.textContent = "0";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${encodeURIComponent(userEmail)}`);

        if (!response.ok) {
            wishlistCount.textContent = "0";
            return;
        }

        const data = await response.json();
        wishlistCount.textContent = Array.isArray(data) ? data.length : 0;
    } catch (error) {
        console.error("Wishlist count error:", error);
        wishlistCount.textContent = "0";
    }
}
function getCartItemImage(item) {
    if (item.kit_variant) {
        const product = getProductById(item.id) || item;
        const variants = getKitVariantsForProduct(product);

        if (item.kit_variant === "home" && variants.home) return variants.home;
        if (item.kit_variant === "away" && variants.away) return variants.away;
        if (item.kit_variant === "third" && variants.third) return variants.third;
    }

    return item.image || "images/no-image.png";
}

/* CART PAGE */
async function loadCartPage() {
    let cartContainer = document.getElementById("cartPageItems");
    let totalElement = document.getElementById("cartTotal");

    if (!cartContainer || !totalElement) return;

    let cart = await syncCartFromDatabase();

    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Your cart is empty.</p>";
        totalElement.textContent = 0;
        return;
    }

    let total = 0;

    cart.forEach(function (item, index) {
        let quantity = Number(item.quantity || 1);
        let itemPrice = Number(item.price || 0);
        let subtotal = itemPrice * quantity;
        total += subtotal;

        const customizeText =
            item.customization ||
            (
                item.custom_name
                    ? (item.custom_number ? `${item.custom_name} - ${item.custom_number}` : item.custom_name)
                    : ""
            );

        const cartItemImage = getCartItemImage(item);
        const kitTypeText = item.kit_variant
            ? item.kit_variant.charAt(0).toUpperCase() + item.kit_variant.slice(1)
            : "";

        const safeKitVariant = item.kit_variant ? item.kit_variant : "";

        let div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <div class="cart-item-left cart-item-clickable" onclick="goToProduct(${item.id}, '${safeKitVariant}')">
                <img src="${cartItemImage}" alt="${item.name}" class="cart-item-image" onerror="this.onerror=null;this.src='images/no-image.png';">
            </div>

            <div class="cart-item-info cart-item-clickable" onclick="goToProduct(${item.id}, '${safeKitVariant}')">
                <h3>${item.name}</h3>
                ${kitTypeText ? `<p class="cart-option">Kit Type: ${kitTypeText}</p>` : ""}
                ${item.kit_option ? `<p class="cart-option">Option: ${item.kit_option}</p>` : ""}
                ${item.size ? `<p class="cart-size">Size: ${item.size}</p>` : ""}
                ${customizeText ? `<p class="cart-customize">Customize: ${customizeText}</p>` : ""}
                <p class="cart-price">$${itemPrice}</p>

                <div class="quantity-controls" onclick="event.stopPropagation()">
                    <button onclick="event.stopPropagation(); decreaseQuantity(${index})">-</button>
                    <span>${quantity}</span>
                    <button onclick="event.stopPropagation(); increaseQuantity(${index})">+</button>
                </div>

                <p class="cart-subtotal">Subtotal: $${subtotal}</p>
            </div>

            <button onclick="event.stopPropagation(); removeFromCart(${index})">Remove</button>
        `;

        cartContainer.appendChild(div);
    });

    totalElement.textContent = total;
}

/* REMOVE CART ITEM */
async function removeFromCart(index) {
    const cart = getCart();
    const item = cart[index];
    if (!item) return;

    try {
        const response = await fetch(`http://localhost:5000/api/cart/item/${item.cart_item_id}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            showCartMessage("❌ " + (data.message || "Failed to remove item."));
            return;
        }

        await syncCartFromDatabase();
        updateCartCounter();
        await loadCartPage();
        loadProductsPage();
        updateDetailStockUI();
    } catch (error) {
        console.error("Remove cart item error:", error);
        showCartMessage("❌ Failed to connect to server.");
    }
}

function increaseQuantity(index) {
    changeCartItemQuantity(index, 1);
}

function decreaseQuantity(index) {
    changeCartItemQuantity(index, -1);
}

/* PRODUCT DETAILS PAGE */
async function loadProductDetails() {
    const detailImage = document.getElementById("detailImage");
    const detailName = document.getElementById("detailName");
    const detailPrice = document.getElementById("detailPrice");
    const detailDescription = document.getElementById("detailDescription");
    const detailCartBtn = document.getElementById("detailCartBtn");
    const detailWishBtn = document.getElementById("detailWishBtn");
    const sizesContainer = document.getElementById("sizesContainer");

    const kitVariantBox = document.getElementById("kitVariantBox");
    const kitOptionBox = document.getElementById("kitOptionBox");
    const clothingSizesContainer = document.getElementById("clothingSizesContainer");
    const customizeBox = document.getElementById("customizeBox");
    const customizeFields = document.getElementById("customizeFields");

    if (!detailImage || !detailName || !detailPrice || !detailDescription || !detailCartBtn || !detailWishBtn) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    const kitFromUrl = params.get("kit");
    if (!productId) return;

    let product = null;

    try {
        const response = await fetch(`http://localhost:5000/products/${productId}`);
        if (response.ok) {
            const dbProduct = await response.json();
            product = normalizeProduct(dbProduct);
        }
    } catch (error) {
        product = null;
    }

    if (!product) {
        product = getProductById(productId);
    }

    if (!product) {
        showDetailMessage("❌ Product not found.", false);
        return;
    }

    currentDetailProduct = product;
    localStorage.removeItem("selectedSize");

    const kitProduct = isKitProduct(product);
    const shoeSizeRequired = isSizeRequiredProduct(product) && !kitProduct;

    const hasSizeStock =
        Array.isArray(product.sizes) &&
        product.sizes.length > 0;

    if (kitProduct) {
        selectedDetailQuantity = 1;
    } else if (shoeSizeRequired && hasSizeStock) {
        selectedDetailQuantity = 0;
    } else {
        selectedDetailQuantity = Number(product.quantity || 0) > 0 ? 1 : 0;
    }

    detailBaseAvailableStock = Number(product.quantity || 0);

    resetKitSelections();

    detailImage.src = product.image;
    detailImage.alt = product.name;
    detailImage.onerror = function () {
        this.onerror = null;
        this.src = "images/no-image.png";
    };

    detailName.textContent = product.name;
    detailDescription.textContent = product.description || "No description available.";

    if (kitProduct) {
        if (kitVariantBox) kitVariantBox.style.display = "block";
        if (kitOptionBox) kitOptionBox.style.display = "block";
        if (clothingSizesContainer) clothingSizesContainer.style.display = "block";
        renderKitSizeButtons(product);
        if (customizeBox) customizeBox.style.display = "block";
        if (customizeFields) customizeFields.style.display = "none";

        if (sizesContainer) {
            sizesContainer.style.display = "none";
            sizesContainer.innerHTML = "";
        }

        updateKitPriceUI();

        const variants = getKitVariantsForProduct(product);

if (kitFromUrl && variants[kitFromUrl]) {
    detailImage.src = variants[kitFromUrl];

    setTimeout(function () {
        const kitButtons = document.querySelectorAll("#kitVariantBox button");

        kitButtons.forEach(function (btn) {
            if (btn.textContent.trim().toLowerCase() === kitFromUrl.toLowerCase()) {
                btn.click();
            }
        });
    }, 100);

} else if (variants.home) {
    detailImage.src = variants.home;
}
    } else {
        detailPrice.textContent = "$" + product.price;

        if (kitVariantBox) kitVariantBox.style.display = "none";
        if (kitOptionBox) kitOptionBox.style.display = "none";
        if (clothingSizesContainer) clothingSizesContainer.style.display = "none";
        if (customizeBox) customizeBox.style.display = "none";
        if (customizeFields) customizeFields.style.display = "none";

        if (sizesContainer) {
            sizesContainer.style.display = shoeSizeRequired ? "block" : "none";

            if (shoeSizeRequired && hasSizeStock) {
                renderShoeSizeButtons(product);
            } else {
                sizesContainer.innerHTML = "";
            }
        }
    }

    document.querySelectorAll("#sizesContainer .size-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (!shoeSizeRequired) {
        localStorage.removeItem("selectedSize");
    }

    updateDetailQuantityUI();
    updateDetailStockUI();

    detailCartBtn.onclick = function () {
        if (isSizeRequiredProduct(currentDetailProduct) && !isKitProduct(currentDetailProduct)) {
            const selectedSize = localStorage.getItem("selectedSize");
            if (!selectedSize) {
                showDetailMessage("❌ You must choose a size first.", false);
                return;
            }
        }

        if (isKitProduct(currentDetailProduct) && !selectedClothingSize) {
            showDetailMessage("❌ You must choose a size first.", false);
            return;
        }

        if (isKitProduct(currentDetailProduct) && isCustomizeEnabled) {
            const customName = document.getElementById("customName")?.value.trim() || "";
            if (!customName) {
                showDetailMessage("❌ If you customize the kit, name is required.", false);
                return;
            }
        }

        if (selectedDetailQuantity <= 0) {
            showDetailMessage("❌ Please choose quantity first.", false);
            return;
        }

        addToCart(
            currentDetailProduct.name,
            Number(currentDetailProduct.price),
            selectedDetailQuantity
        );
    };

    await updateDetailWishlistButton();

    detailWishBtn.onclick = async function () {
        await toggleWishlistByProductId(product.id);
    };

    loadReviews(productId);
}

/* REVIEWS */
async function addReview() {
    if (!requireLogin()) return;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    const nameText = document.getElementById("reviewNameText");
    const textInput = document.getElementById("reviewText");
    const submitBtn = document.getElementById("reviewSubmitBtn");

    if (!productId || !nameText || !textInput) return;

    const userName = nameText.textContent.trim();
    const reviewText = textInput.value.trim();
    const userEmail = localStorage.getItem("userEmail");

    if (reviewText === "" && selectedReviewRating === 0) {
        alert("Please write a comment or choose a star rating.");
        return;
    }

    const ratingValue = selectedReviewRating > 0 ? selectedReviewRating : null;
    const kitVariantValue = isKitProduct(currentDetailProduct) ? selectedKitVariant : null;

    try {
        let response;

        if (editingReviewId) {
            response = await fetch(`http://localhost:5000/api/reviews/${editingReviewId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_email: userEmail,
                    review_text: reviewText,
                    rating: ratingValue
                })
            });
        } else {
            response = await fetch("http://localhost:5000/api/reviews/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product_id: Number(productId),
                    user_name: userName,
                    user_email: userEmail,
                    review_text: reviewText,
                    rating: ratingValue,
                    kit_variant: kitVariantValue
                })
            });
        }

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to save review");
            return;
        }

        textInput.value = "";
        editingReviewId = null;
        selectedReviewRating = 0;
        selectReviewRating(0);

        if (submitBtn) {
            submitBtn.textContent = "Submit Review";
        }

        await loadReviews(productId);

    } catch (error) {
        console.error("Review save error:", error);
        alert("Server error");
    }
}

async function loadReviews(productId) {
    const reviewList = document.getElementById("reviewList");
    if (!reviewList) return;

    const currentUserEmail = localStorage.getItem("userEmail");

    let reviewsUrl = `http://localhost:5000/api/reviews/${productId}`;

    if (isKitProduct(currentDetailProduct)) {
        reviewsUrl += `?kit_variant=${encodeURIComponent(selectedKitVariant)}`;
    }

    try {
        const response = await fetch(reviewsUrl);
        const reviews = await response.json();

        renderAverageRating(reviews);

        reviewList.innerHTML = "";

        if (!Array.isArray(reviews) || reviews.length === 0) {
            reviewList.innerHTML = "<p>No reviews yet.</p>";
            return;
        }

        reviews.forEach(function (review) {
            const isOwner = currentUserEmail && review.user_email === currentUserEmail;

            let div = document.createElement("div");
            div.classList.add("review-item");

            div.innerHTML = `
                <div class="review-top">
                    <h4>${review.user_name}</h4>

                    ${isOwner ? `
                        <div class="review-menu-wrapper">
                            <button class="review-menu-btn" onclick="toggleReviewMenu(${review.id})">⋮</button>

                            <div class="review-menu" id="reviewMenu-${review.id}" style="display: none;">
                                <button onclick="editReview(${review.id}, \`${(review.review_text || "").replace(/`/g, "\\`")}\`, ${review.rating || 0})">Edit</button>
                                <button onclick="deleteReview(${review.id})">Delete</button>
                                <button onclick="closeReviewMenu(${review.id})">Close</button>
                            </div>
                        </div>
                    ` : ""}
                </div>

                ${review.rating ? getStarsHtml(review.rating) : ""}
                ${review.review_text ? `<p>${review.review_text}</p>` : ""}
            `;

            reviewList.appendChild(div);
        });

    } catch (error) {
        console.error("Load reviews error:", error);
        reviewList.innerHTML = "<p>Failed to load reviews.</p>";
    }
}
function toggleReviewMenu(reviewId) {
    const menu = document.getElementById(`reviewMenu-${reviewId}`);
    if (!menu) return;

    const isVisible = menu.style.display === "block";

    document.querySelectorAll(".review-menu").forEach(function (m) {
        m.style.display = "none";
    });

    menu.style.display = isVisible ? "none" : "block";
}

function closeReviewMenu(reviewId) {
    const menu = document.getElementById(`reviewMenu-${reviewId}`);
    if (menu) menu.style.display = "none";
}

function editReview(reviewId, reviewText) {
    const textInput = document.getElementById("reviewText");
    const nameInput = document.getElementById("reviewName");
    const submitBtn = document.getElementById("reviewSubmitBtn");

    if (!textInput || !nameInput) return;

    editingReviewId = reviewId;

    textInput.value = reviewText;

    // 🔒 LOCK name field
    nameInput.disabled = true;

    if (submitBtn) {
        submitBtn.textContent = "Update Review";
    }

    textInput.focus();

    window.scrollTo({
        top: textInput.getBoundingClientRect().top + window.scrollY - 120,
        behavior: "smooth"
    });

    closeReviewMenu(reviewId);
}

async function deleteReview(reviewId) {
    const userEmail = localStorage.getItem("userEmail");
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    try {
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete review");
            return;
        }

        await loadReviews(productId);
    } catch (error) {
        console.error("Delete review error:", error);
        alert("Server error");
    }
}

/* WISHLIST BUTTONS */
async function toggleWishlist(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    if (!requireLogin()) return;

    const userEmail = localStorage.getItem("userEmail");

    try {
        const exists = await isProductInWishlist(productId);

        const url = exists
            ? "http://localhost:5000/api/wishlist/remove"
            : "http://localhost:5000/api/wishlist/add";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail,
                product_id: productId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data.message || "Wishlist action failed");
            return;
        }

        await updateWishlistCounter();
        await loadWishlistPage();
        await markWishlistButtons();

    } catch (error) {
        console.error("Wishlist error:", error);
    }
}

async function markWishlistButtons() {
    const wishlist = await getWishlistFromDatabase();
    const wishlistIds = wishlist.map(item => Number(item.id));
    let buttons = document.querySelectorAll(".wishlist-btn");

    buttons.forEach(function (button) {
        const productId = Number(button.getAttribute("data-product-id"));

        if (wishlistIds.includes(productId)) {
            button.classList.add("active");
            button.textContent = "♥";
        } else {
            button.classList.remove("active");
            button.textContent = "♡";
        }
    });
}

/* WISHLIST PAGE */
async function loadWishlistPage() {
    const wishlistContainer =
        document.getElementById("wishlistItems") ||
        document.getElementById("wishlistContainer") ||
        document.getElementById("wishlistPageItems");

    if (!wishlistContainer) return;

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        wishlistContainer.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
            return;
        }

        data.forEach(function (item) {
            const div = document.createElement("div");
            div.classList.add("cart-item");

            const kitVariant = item.kit_variant || "";
            const variants = getKitVariantsForProduct(item);
            const wishlistImage = kitVariant && variants[kitVariant]
                ? variants[kitVariant]
                : (item.image || "images/no-image.png");

            const productUrl = kitVariant
                ? `product-details.html?id=${item.id}&kit=${encodeURIComponent(kitVariant)}`
                : `product-details.html?id=${item.id}`;

            div.innerHTML = `
                <div class="wishlist-clickable" onclick="window.location.href='${productUrl}'">
                    <img src="${wishlistImage}"
                         class="wishlist-image"
                         alt="${item.name}"
                         onerror="this.onerror=null;this.src='images/no-image.png';">

                    <div class="wishlist-info">
                        <h3>${item.name}</h3>
                        ${kitVariant ? `<p>Kit Type: ${kitVariant.charAt(0).toUpperCase() + kitVariant.slice(1)}</p>` : ""}
                        <p>$${item.price}</p>
                    </div>
                </div>

                <button onclick="event.stopPropagation(); removeFromWishlist(${item.id}, '${kitVariant}')">Remove</button>
            `;

            wishlistContainer.appendChild(div);
        });
    } catch (error) {
        console.error("Load wishlist error:", error);
        wishlistContainer.innerHTML = "<p>Failed to load wishlist.</p>";
    }
}

async function removeFromWishlist(productId, kitVariant = null) {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) return;

    try {
        await fetch("http://localhost:5000/api/wishlist/remove", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail,
                product_id: productId,
                kit_variant: kitVariant || null
            })
        });

        await loadWishlistPage();
        await updateWishlistCounter();
        await markWishlistButtons();
        await updateDetailWishlistButton();
    } catch (error) {
        console.error("Remove wishlist error:", error);
    }
}

/* CHECKOUT MODAL */
function openCheckoutModal() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const modal = document.getElementById("checkoutModal");
    if (!modal) return;

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkoutModal");
    if (!modal) return;

    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

async function toggleCardFields() {
    const paymentMethod = document.getElementById("paymentMethod");
    const cardFields = document.getElementById("cardFields");

    if (!paymentMethod || !cardFields) return;

    if (paymentMethod.value === "Bank Card") {
        cardFields.style.display = "block";
        await setupStripePaymentElement();
    } else {
        cardFields.style.display = "none";

        const paymentElementContainer = document.getElementById("payment-element");
        const stripeMessage = document.getElementById("stripePaymentMessage");

        if (paymentElementContainer) paymentElementContainer.innerHTML = "";
        if (stripeMessage) stripeMessage.textContent = "";

        stripePaymentElement = null;
        stripeElements = null;
        stripeClientSecret = null;
    }
}

function updatePurchasedStockFromCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let purchasedStock = JSON.parse(localStorage.getItem("purchasedStock")) || {};

    cart.forEach(item => {
        const productId = item.id;
        const qty = Number(item.quantity || 0);

        if (!purchasedStock[productId]) {
            purchasedStock[productId] = 0;
        }

        purchasedStock[productId] += qty;
    });

    localStorage.setItem("purchasedStock", JSON.stringify(purchasedStock));
}

function showCheckoutMessage(message, isSuccess = true) {
    const msg = document.getElementById("checkoutMessage");
    if (!msg) return;

    msg.textContent = message;
    msg.classList.remove("show", "success", "error");
    msg.classList.add(isSuccess ? "success" : "error", "show");

    setTimeout(() => {
        msg.classList.remove("show");
    }, 2500);
}
async function setupStripePaymentElement() {
    const paymentBox = document.getElementById("payment-element");
    const msg = document.getElementById("stripePaymentMessage");

    if (!paymentBox) return;

    paymentBox.innerHTML = "";
    if (msg) msg.textContent = "";

    try {
        const configRes = await fetch("http://localhost:5000/api/stripe/config");
        const config = await configRes.json();

        stripe = Stripe(config.publishableKey);

        const intentRes = await fetch("http://localhost:5000/api/stripe/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: localStorage.getItem("userEmail")
            })
        });

        const intentData = await intentRes.json();

        stripeClientSecret = intentData.clientSecret;

        stripeElements = stripe.elements({
            clientSecret: stripeClientSecret
        });

        stripePaymentElement = stripeElements.create("payment");

        stripePaymentElement.mount("#payment-element");

    } catch (error) {
        console.error(error);

        if (msg) {
            msg.textContent = "❌ Failed to load card payment.";
        }
    }
}

async function confirmPurchase() {
    const cart = await syncCartFromDatabase();

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    const paymentMethod = document.getElementById("paymentMethod")?.value;
    const phone1 = document.getElementById("phone1")?.value.trim();
    const phone2 = document.getElementById("phone2")?.value.trim();
    const address = document.getElementById("checkoutAddress")?.value.trim();

    if (!paymentMethod) {
        alert("Please choose a payment method.");
        return;
    }

    if (!phone1 || !address) {
    alert("Please fill all required fields.");
    return;
}

    const total = cart.reduce(function (sum, item) {
        return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    try {
        if (paymentMethod === "Bank Card") {
            if (!stripe || !stripeElements || !stripeClientSecret) {
                showCheckoutMessage("❌ Card payment form is not ready.", false);
                return;
            }

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements: stripeElements,
                redirect: "if_required"
            });

            if (error) {
                showCheckoutMessage("❌ " + error.message, false);
                return;
            }

            if (!paymentIntent || paymentIntent.status !== "succeeded") {
                showCheckoutMessage("❌ Payment was not completed.", false);
                return;
            }
        }

        const response = await fetch("http://localhost:5000/api/orders/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: localStorage.getItem("userEmail"),
                items: cart,
                total: total,
                payment_method: paymentMethod,
                phone1: phone1,
                phone2: phone2 || null,
                address: address
            })
        });

        const data = await response.json();

        if (!response.ok) {
            showCheckoutMessage("❌ " + (data.message || "Failed to create order"), false);
            return;
        }

        localStorage.setItem("lastOrder", JSON.stringify({
            items: cart,
            total: total,
            paymentMethod: paymentMethod,
            phone1: phone1,
            phone2: phone2 || null,
            address: address,
            purchaseTime: new Date().toISOString(),
            isCanceled: false
        }));

        await syncCartFromDatabase();
        updateCartCounter();
        closeCheckoutModal();
        window.location.href = "order-success.html";
    } catch (error) {
        console.error("CONFIRM PURCHASE ERROR:", error);
        showCheckoutMessage("❌ Server error while confirming purchase.", false);
    }
}

function sendLocationToWhatsApp() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function (position) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
            const message = `Hello, this is my current location: ${locationLink}`;
            const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappURL, "_blank");
        },
        function () {
            alert("Unable to get your current location.");
        }
    );
}

window.addEventListener("click", function (e) {
    const modal = document.getElementById("checkoutModal");

    if (modal && e.target === modal) {
        closeCheckoutModal();
    }
});
/* ORDER SUCCESS PAGE */
function loadOrderSuccessPage() {
    const orderDateText = document.getElementById("orderDateText");
    const cancelOrderBtn = document.getElementById("cancelOrderBtn");
    const cancelStatusMessage = document.getElementById("cancelStatusMessage");

    if (!orderDateText || !cancelOrderBtn || !cancelStatusMessage) return;

    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

    if (!lastOrder || !lastOrder.purchaseTime) {
        orderDateText.textContent = "No recent order found.";
        cancelOrderBtn.style.display = "none";
        return;
    }

    const purchaseDate = new Date(lastOrder.purchaseTime);
    const now = new Date();
    const diffInMs = now - purchaseDate;
    const hoursPassed = diffInMs / (1000 * 60 * 60);

    orderDateText.textContent = "Purchase Date: " + purchaseDate.toLocaleString();

    if (lastOrder.isCanceled) {
        cancelStatusMessage.textContent = "This order has already been canceled.";
        cancelStatusMessage.style.color = "crimson";
        cancelOrderBtn.disabled = true;
        cancelOrderBtn.textContent = "Order Canceled";
        return;
    }

    if (hoursPassed >= 2) {
        cancelStatusMessage.textContent = "Cancellation period has expired.";
        cancelStatusMessage.style.color = "gray";
        cancelOrderBtn.disabled = true;
        cancelOrderBtn.textContent = "Cancellation Expired";
    }
}

function startCancelCountdown() {
    const countdownElement = document.getElementById("cancelCountdown");
    const cancelOrderBtn = document.getElementById("cancelOrderBtn");
    const cancelStatusMessage = document.getElementById("cancelStatusMessage");

    if (!countdownElement || !cancelOrderBtn || !cancelStatusMessage) return;

    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));

    if (!lastOrder || !lastOrder.purchaseTime) {
        countdownElement.textContent = "No recent order found.";
        cancelOrderBtn.style.display = "none";
        return;
    }

    function updateCountdown() {
        const purchaseTime = new Date(lastOrder.purchaseTime).getTime();
        const now = new Date().getTime();
        const deadline = purchaseTime + 2 * 60 * 60 * 1000;
        const distance = deadline - now;

        if (lastOrder.isCanceled) {
            countdownElement.textContent = "Order canceled.";
            cancelOrderBtn.disabled = true;
            cancelOrderBtn.textContent = "Order Canceled";
            cancelStatusMessage.textContent = "This order has already been canceled.";
            cancelStatusMessage.style.color = "crimson";
            return;
        }

        if (distance <= 0) {
            countdownElement.textContent = "00h 00m 00s";
            cancelOrderBtn.disabled = true;
            cancelOrderBtn.textContent = "Cancellation Expired";
            cancelStatusMessage.textContent = "Cancellation period has expired.";
            cancelStatusMessage.style.color = "gray";
            return;
        }

        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);

        countdownElement.textContent =
            String(hours).padStart(2, "0") + "h " +
            String(minutes).padStart(2, "0") + "m " +
            String(seconds).padStart(2, "0") + "s";
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function cancelOrder() {
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    const cancelStatusMessage = document.getElementById("cancelStatusMessage");
    const cancelOrderBtn = document.getElementById("cancelOrderBtn");

    if (!lastOrder || !lastOrder.purchaseTime) {
        if (cancelStatusMessage) {
            cancelStatusMessage.textContent = "No recent order found.";
            cancelStatusMessage.style.color = "gray";
        }
        return;
    }

    if (lastOrder.isCanceled) {
        if (cancelStatusMessage) {
            cancelStatusMessage.textContent = "This order has already been canceled.";
            cancelStatusMessage.style.color = "crimson";
        }
        if (cancelOrderBtn) {
            cancelOrderBtn.disabled = true;
            cancelOrderBtn.textContent = "Order Canceled";
        }
        return;
    }

    const purchaseDate = new Date(lastOrder.purchaseTime);
    const now = new Date();
    const diffInMs = now - purchaseDate;
    const hoursPassed = diffInMs / (1000 * 60 * 60);

    if (hoursPassed >= 22) {
        if (cancelStatusMessage) {
            cancelStatusMessage.textContent = "Cancellation period has expired.";
            cancelStatusMessage.style.color = "gray";
        }
        if (cancelOrderBtn) {
            cancelOrderBtn.disabled = true;
            cancelOrderBtn.textContent = "Cancellation Expired";
        }
        return;
    }

    lastOrder.isCanceled = true;
    lastOrder.canceledAt = new Date().toISOString();

    localStorage.setItem("lastOrder", JSON.stringify(lastOrder));

    if (cancelStatusMessage) {
        cancelStatusMessage.textContent = "Your order has been canceled successfully.";
        cancelStatusMessage.style.color = "crimson";
    }

    if (cancelOrderBtn) {
        cancelOrderBtn.disabled = true;
        cancelOrderBtn.textContent = "Order Canceled";
    }
}

async function loadOrdersPage() {
    const ordersContainer = document.getElementById("ordersContainer");
    if (!ordersContainer) return;

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        ordersContainer.innerHTML = "<p>No orders found.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/orders/${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (!response.ok || !Array.isArray(data) || data.length === 0) {
            ordersContainer.innerHTML = "<p>No orders found.</p>";
            return;
        }

        let html = `<h2 class="orders-main-title">Your Orders</h2>`;

        data.forEach(function (item) {
            const quantity = Number(item.quantity || 1);
            const price = Number(item.price || 0);
            const total = quantity * price;

            const purchaseTime = new Date(item.created_at);
            const canceledTime = item.canceled_at ? new Date(item.canceled_at) : null;
            const deadline = new Date(purchaseTime.getTime() + 2 * 60 * 60 * 1000);
            const now = new Date();
            const expired = now >= deadline;

            let cancelSection = "";

            if (item.status === "Canceled") {
                cancelSection = `
                    <div class="order-cancel-row">
                        <div class="order-time-info">
                            <p class="countdown-text"><strong>Purchase Time:</strong> ${purchaseTime.toLocaleString()}</p>
                            <p class="countdown-text"><strong>Canceled Time:</strong> ${canceledTime ? canceledTime.toLocaleString() : "Unknown"}</p>
                        </div>
                        <button class="cancel-order-btn" disabled>Item Canceled</button>
                    </div>
                `;
            } else if (expired) {
                cancelSection = `
                    <div class="order-cancel-row">
                        <div class="order-time-info">
                            <p class="countdown-text"><strong>Purchase Time:</strong> ${purchaseTime.toLocaleString()}</p>
                            <p class="countdown-text">Cancellation period expired.</p>
                        </div>
                        <button class="cancel-order-btn" disabled>Cancellation Expired</button>
                    </div>
                `;
            } else {
                cancelSection = `
                    <div class="order-cancel-row">
                        <p id="orderCountdown-${item.order_item_id}" class="countdown-text"></p>
                        <button class="cancel-order-btn" onclick="cancelSingleOrderItem(${item.order_item_id})">Cancel Item</button>
                    </div>
                `;
            }

            html += `
                <div class="order-item-card">
                    <div class="order-item-image-wrap">
                        <img src="${getCartItemImage(item)}"
                             alt="${item.name || "Product"}"
                             class="order-item-image"
                             onerror="this.onerror=null;this.src='images/no-image.png';">
                    </div>

                    <div class="order-item-details">
                        <h3>${item.name || "Product"}</h3>

                        <div class="order-meta-grid">
                            <p><strong>Price:</strong> $${price}</p>
                            <p><strong>Quantity:</strong> ${quantity}</p>
                            ${item.kit_variant ? `<p><strong>Kit Type:</strong> ${item.kit_variant.charAt(0).toUpperCase() + item.kit_variant.slice(1)}</p>` : ""}
                            ${item.size ? `<p><strong>Size:</strong> ${item.size}</p>` : ""}
                            ${item.customization ? `<p><strong>Customize:</strong> ${item.customization}</p>` : ""}
                            <p><strong>Status:</strong> ${item.status || "Placed"}</p>
                        </div>

                        <div class="order-total-box">
                            <span>Total Price</span>
                            <strong>$${total}</strong>
                        </div>

                        ${cancelSection}
                    </div>
                </div>
            `;
        });

        ordersContainer.innerHTML = html;

        startAllOrderItemCountdowns(data);

    } catch (error) {
        console.error("LOAD ORDERS ERROR:", error);
        ordersContainer.innerHTML = "<p>Failed to load orders.</p>";
    }
}
function startOrdersCountdown() {
    const countdownElement = document.getElementById("orderCountdown");
    if (!countdownElement) return;

    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    if (!lastOrder || !lastOrder.purchaseTime || lastOrder.isCanceled) return;

    function updateCountdown() {
        const purchaseTime = new Date(lastOrder.purchaseTime).getTime();
        const now = new Date().getTime();
        const deadline = purchaseTime + 2 * 60 * 60 * 1000;
        const distance = deadline - now;

        if (distance <= 0) {
            countdownElement.textContent = "Cancellation period expired.";

            const cancelBtn = document.querySelector(".cancel-order-btn");
            if (cancelBtn) {
                cancelBtn.disabled = true;
                cancelBtn.textContent = "Cancellation Expired";
            }
            return;
        }

        const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((distance / (1000 * 60)) % 60);
        const seconds = Math.floor((distance / 1000) % 60);

        countdownElement.textContent =
            "Cancel available for: " +
            String(hours).padStart(2, "0") + "h " +
            String(minutes).padStart(2, "0") + "m " +
            String(seconds).padStart(2, "0") + "s";
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}
function cancelOrderFromOrdersPage() {
    const lastOrder = JSON.parse(localStorage.getItem("lastOrder"));
    if (!lastOrder || !lastOrder.purchaseTime) return;

    if (lastOrder.isCanceled) {
        loadOrdersPage();
        return;
    }

    const purchaseTime = new Date(lastOrder.purchaseTime).getTime();
    const now = new Date().getTime();
    const deadline = purchaseTime + 2 * 60 * 60 * 1000;

    if (now > deadline) {
        loadOrdersPage();
        return;
    }

    lastOrder.isCanceled = true;
    lastOrder.canceledAt = new Date().toISOString();

    localStorage.setItem("lastOrder", JSON.stringify(lastOrder));
    loadOrdersPage();
}

function selectCategory(categoryName) {
    localStorage.setItem("selectedCategory", categoryName);
    localStorage.removeItem("selectedBrand");
    window.location.href = "brands.html";
}

function selectBrand(brandName) {
    localStorage.setItem("selectedBrand", brandName);
    window.location.href = "products.html";
}

function loadBrandsTitle() {
    const title = document.getElementById("brandsTitle");
    const category = localStorage.getItem("selectedCategory");

    if (!title || !category) return;
    title.textContent = category + " Brands";
}

async function loadProductsPage() {
    console.log("loadProductsPage called");

    const productList = document.getElementById("productList");
    if (!productList) return;

    if (window.location.pathname.toLowerCase().includes("products.html")) {
        const ref = document.referrer.toLowerCase();
        const fromBrandSelection = ref.includes("brands.html") || ref.includes("categories.html");

        if (!fromBrandSelection) {
            localStorage.removeItem("selectedCategory");
            localStorage.removeItem("selectedBrand");
        }
    }

    const selectedCategory = localStorage.getItem("selectedCategory");
    const selectedBrand = localStorage.getItem("selectedBrand");

    updateProductsTitle();

    let products = [...localProducts];

    if (selectedCategory && selectedBrand) {
        products = products.filter(function (product) {
            return product.category === selectedCategory && product.brand === selectedBrand;
        });
    } else if (selectedCategory) {
        products = products.filter(function (product) {
            return product.category === selectedCategory;
        });
    }

    renderProductsList(products);

    try {
        const dbProducts = await getAvailableProducts();

        let filteredDbProducts = [...dbProducts];

        if (selectedCategory && selectedBrand) {
            filteredDbProducts = filteredDbProducts.filter(function (product) {
                return product.category === selectedCategory && product.brand === selectedBrand;
            });
        } else if (selectedCategory) {
            filteredDbProducts = filteredDbProducts.filter(function (product) {
                return product.category === selectedCategory;
            });
        }

        renderProductsList(filteredDbProducts);
    } catch (error) {
        console.log("DB refresh failed", error);
    }
}

function loadBrandsPage() {
    const brandsContainer = document.getElementById("brandsContainer");
    const brandsTitle = document.getElementById("brandsTitle");
    const selectedCategory = localStorage.getItem("selectedCategory");

    if (!brandsContainer || !selectedCategory) return;

    if (brandsTitle) {
        brandsTitle.textContent = selectedCategory + " Brands";
    }

    const brandImages = {
        Football: {
            Adidas: "images/adidas-1.jpg",
            Nike: "images/nike-1.jpg",
            Puma: "images/puma.jpg"
        },
        Basketball: {
            Adidas: "images/adidas-basket.jpg",
            Nike: "images/basket-nike.jpg",
            Puma: "images/puma-basket.jpg"
        },
        Volleyball: {
            Adidas: "images/adidas-volleyball.jpg",
            Nike: "images/nike-volleyball.png",
            Puma: "images/puma-volleyball.jpg"
        },
        Tennis: {
            Adidas: "images/tennis-adidas.jpg",
            Nike: "images/tennis-nike.jpg",
            Puma: "images/tennis-puma.jpg"
        },
        Running: {
            Adidas: "images/adidas-running.jpg",
            Nike: "images/nike-running.jpg",
            Puma: "images/puma-running.jpg"
        },
        Gym: {
            Adidas: "images/adidas-gym.jpg",
            Nike: "images/nike-bottle.jpg",
            Puma: "images/puma-bag.jpg"
        }
    };

    const currentBrands = brandImages[selectedCategory];

    if (!currentBrands) {
        brandsContainer.innerHTML = "<p>No brands found for this category.</p>";
        return;
    }

    brandsContainer.innerHTML = `
        <div class="category-card" onclick="selectBrand('Adidas')">
            <img src="${currentBrands.Adidas}" alt="Adidas">
            <h3>Adidas</h3>
        </div>

        <div class="category-card" onclick="selectBrand('Nike')">
            <img src="${currentBrands.Nike}" alt="Nike">
            <h3>Nike</h3>
        </div>

        <div class="category-card" onclick="selectBrand('Puma')">
            <img src="${currentBrands.Puma}" alt="Puma">
            <h3>Puma</h3>
        </div>
    `;
}

function updateAuthUI() {
    const userEmail = localStorage.getItem("userEmail");

    const loginLinks = document.querySelectorAll('a[href="login.html"]');
    const registerLinks = document.querySelectorAll('a[href="register.html"]');
    const logoutItem = document.getElementById("logoutItem");

    if (userEmail) {
        loginLinks.forEach(link => {
            if (link.parentElement) link.parentElement.style.display = "none";
        });

        registerLinks.forEach(link => {
            if (link.parentElement) link.parentElement.style.display = "none";
        });

        if (logoutItem) {
            logoutItem.style.display = "block";
        }
    } else {
        loginLinks.forEach(link => {
            if (link.parentElement) link.parentElement.style.display = "block";
        });

        registerLinks.forEach(link => {
            if (link.parentElement) link.parentElement.style.display = "block";
        });

        if (logoutItem) {
            logoutItem.style.display = "none";
        }
    }
}
function autofillReviewName() {
    const reviewNameInput = document.getElementById("reviewName");
    const userFullName = localStorage.getItem("userFullName");

    if (reviewNameInput && userFullName) {
        reviewNameInput.value = userFullName;
    }
}

function logoutUser() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userFullName");

    window.location.href = "login.html";
}

/* CONTACT FORM */
async function setupContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    const nameInput = document.getElementById("contactName");
    const emailInput = document.getElementById("contactEmail");
    const messageInput = document.getElementById("contactMessage");
    const successMessage = document.getElementById("contactSuccessMessage");
    const addressBox = document.getElementById("address");

    if (addressBox) {
        addressBox.classList.add("show");
    }

    const userEmail = localStorage.getItem("userEmail") || "";
    const userFullName = localStorage.getItem("userFullName") || "";

    if (!userEmail || !userFullName) {
        if (nameInput) {
            nameInput.value = "";
            nameInput.placeholder = "Login required";
            nameInput.disabled = true;
        }

        if (emailInput) {
            emailInput.value = "";
            emailInput.placeholder = "Login required";
            emailInput.disabled = true;
        }

        if (messageInput) {
            messageInput.disabled = true;
            messageInput.placeholder = "Please login first to contact us.";
        }

        const sendBtn = form.querySelector("button[type='submit']");
        if (sendBtn) {
            sendBtn.textContent = "Login to Contact Us";
            sendBtn.onclick = function (e) {
                e.preventDefault();
                window.location.href = "login.html";
            };
        }

        return;
    }

    if (nameInput) {
        nameInput.value = userFullName;
        nameInput.disabled = false;
        nameInput.readOnly = false;
    }

    if (emailInput) {
        emailInput.value = userEmail;
        emailInput.disabled = false;
        emailInput.readOnly = false;
    }

    if (messageInput) {
        messageInput.disabled = false;
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();

        if (!name) {
            alert("Please enter your name.");
            return;
        }

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Please enter a valid email.");
            return;
        }

        if (!message) {
            alert("Please write your message.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to send message.");
                return;
            }

            messageInput.value = "";

            if (successMessage) {
                successMessage.style.display = "block";
                successMessage.textContent = "✔ Message sent successfully";
            }

            setTimeout(function () {
                if (successMessage) {
                    successMessage.style.display = "none";
                }
            }, 3000);

        } catch (error) {
            console.error("CONTACT FORM ERROR:", error);
            alert("Server error while sending message.");
        }
    });
}
/* STATS ANIMATION */
function animateStatsOnScroll() {
    const statBoxes = document.querySelectorAll(".stat-box");
    if (!statBoxes.length) return;

    statBoxes.forEach(function (box) {
        const boxTop = box.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight - 80;

        if (boxTop < triggerPoint) {
            box.classList.add("show");

            if (!box.classList.contains("counted")) {
                box.classList.add("counted");

                const numberElement = box.querySelector(".stat-number");
                if (!numberElement) return;

                const target = parseInt(numberElement.getAttribute("data-target"), 10);
                let current = 0;
                const increment = Math.max(1, Math.ceil(target / 100));

                const counter = setInterval(function () {
                    current += increment;

                    if (current >= target) {
                        numberElement.textContent = target.toLocaleString() + "+";
                        clearInterval(counter);
                    } else {
                        numberElement.textContent = current.toLocaleString();
                    }
                }, 20);
            }
        }
    });
}

/* SIZE SELECTION */
/* SIZE SELECTION */
document.addEventListener("click", function (e) {
    if (!e.target.classList.contains("size-btn")) return;

    if (e.target.disabled || e.target.classList.contains("sold-out-size")) {
        return;
    }

    const isShoeSize = e.target.closest("#sizesContainer");
    const isClothingSize = e.target.closest("#clothingSizesContainer");

    if (isShoeSize) {
        document.querySelectorAll("#sizesContainer .size-btn").forEach(function (btn) {
            btn.classList.remove("active");
        });

        e.target.classList.add("active");
        localStorage.setItem("selectedSize", e.target.getAttribute("data-size") || e.target.textContent.trim());

        selectedDetailQuantity = 1;
        updateDetailQuantityUI();
        updateDetailStockUI();
        return;
    }

    if (isClothingSize) {
        document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (btn) {
            btn.classList.remove("active");
        });

        e.target.classList.add("active");
        selectedClothingSize = e.target.textContent.trim();

        selectedDetailQuantity = 1;
        updateDetailQuantityUI();
        updateDetailStockUI();
    }
});

function goToProduct(productId, kitVariant = "") {
    if (!productId) return;

    let url = `product-details.html?id=${productId}`;

    if (kitVariant) {
        url += `&kit=${encodeURIComponent(kitVariant)}`;
    }

    window.location.href = url;
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");

            if (response.status === 403) {
                localStorage.setItem("pendingVerificationEmail", email);
                window.location.href = "verify.html";
            }

            return;
        }

        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userFullName", data.user.fullname);

        window.location.href = "products.html";

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        alert("Server error");
    }
}

function renderProductsList(products) {
    const productList = document.getElementById("productList");
    if (!productList) return;

    productList.innerHTML = "";

    if (!products || products.length === 0) {
        productList.innerHTML = "<p>No products found.</p>";
        return;
    }

    products.forEach(function (product) {
        const div = document.createElement("div");
        const remainingStock = getRemainingStockConsideringCart(product);
        const isSoldOut = remainingStock <= 0;

        div.classList.add("product-card");
        div.setAttribute("data-name", product.name);
        div.setAttribute("data-price", product.price);

        let stockText = "";
        let stockClass = "";

      const isVariantStockProduct =
    isSizeRequiredProduct(product) || isKitProduct(product);

if (!isVariantStockProduct) {
    if (remainingStock <= 0) {
        stockText = "Sold Out";
        stockClass = "sold-out-text";
    } else if (remainingStock <= 10) {
        stockText = `In Stock: ${remainingStock}`;
        stockClass = "in-stock-text";
    }
}

        const buttonText = isSoldOut ? "Sold Out" : "Add to Cart";
        const buttonClass = isSoldOut ? "cart-btn sold-out-btn" : "cart-btn";

        div.innerHTML = `
            <a href="product-details.html?id=${product.id}" class="product-link">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/no-image.png';">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                ${stockText ? `<p class="stock-text ${stockClass}">${stockText}</p>` : ""}
            </a>
            <div class="product-actions">
                <button class="${buttonClass}" ${isSoldOut ? "disabled" : ""}>${buttonText}</button>
                <button class="wishlist-btn" data-product-id="${product.id}">♡</button>
            </div>
        `;

        const cartBtn = div.querySelector(".cart-btn");
        if (!isSoldOut && cartBtn) {
            cartBtn.addEventListener("click", function () {
                addToCart(product.name, Number(product.price));
            });
        }

        const wishlistBtn = div.querySelector(".wishlist-btn");
        if (wishlistBtn) {
            wishlistBtn.addEventListener("click", function (event) {
                toggleWishlist(event, product.id);
            });
        }

        productList.appendChild(div);
    });

    markWishlistButtons();
}

const verifyForm = document.getElementById("verifyForm");

if (verifyForm) {
    const verifyEmailInput = document.getElementById("verifyEmail");
    const savedEmail = localStorage.getItem("pendingVerificationEmail");

    if (!savedEmail) {
        alert("❌ No email found for verification. Please register first.");
        window.location.href = "register.html";
    } else if (verifyEmailInput) {
        verifyEmailInput.value = savedEmail;
        verifyEmailInput.setAttribute("readonly", true);
    }

    verifyForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("verifyEmail")?.value.trim();
        const code = document.getElementById("verifyCode")?.value.trim();

        if (!email || !code) {
            alert("❌ Please fill all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/verify", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

           if (response.ok) {
    alert("✅ Account verified successfully!");

    if (data.user) {
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userFullName", data.user.fullname);
    }

    localStorage.removeItem("pendingVerificationEmail");
    window.location.href = "products.html";

            } else {
                alert("❌ " + data.message);
            }
        } catch (error) {
            console.error(error);
            alert("❌ Server error");
        }
    });
}

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getCurrentUserEmail() {
    return localStorage.getItem("userEmail");
}

async function syncCartFromDatabase() {
    const userEmail = getCurrentUserEmail();

    if (!userEmail) {
        saveCart([]);
        return [];
    }

    try {
        const response = await fetch(`http://localhost:5000/api/cart/${encodeURIComponent(userEmail)}`);

        if (!response.ok) {
            throw new Error("Failed to fetch cart");
        }

        const cartItems = await response.json();

        const formattedCart = cartItems.map(function (item) {
            return {
                cart_item_id: item.cart_item_id,
                cart_id: item.cart_id,
                id: item.id,
                name: item.name,
                price: Number(item.price),
                image: item.image || "images/no-image.png",
                size: item.size || null,
                quantity: Number(item.quantity || 1),
                stock: Number(item.stock || 0),

                kit_variant: item.kit_variant || null,
                kit_option: item.kit_option || null,
                custom_name: item.custom_name || null,
                custom_number: item.custom_number || null,
                customization: item.customization || null
            };
        });

        saveCart(formattedCart);
        return formattedCart;
    } catch (error) {
        console.error("Cart sync error:", error);
        return getCart();
    }
}

function getPurchasedStockData() {
    return JSON.parse(localStorage.getItem("purchasedStock")) || {};
}

function savePurchasedStockData(data) {
    localStorage.setItem("purchasedStock", JSON.stringify(data));
}

function getPurchasedQuantityForProduct(productId) {
    const purchasedStock = getPurchasedStockData();
    return Number(purchasedStock[productId] || 0);
}

function getCartQuantityForProduct(productId) {
    const cart = getCart();

    return cart
        .filter(function (item) {
            return Number(item.id) === Number(productId);
        })
        .reduce(function (sum, item) {
            return sum + Number(item.quantity || 0);
        }, 0);
}

function getRemainingStock(product) {
    if (!product) return 0;

    const originalStock = Number(product.quantity || 0);
    const purchasedQty = getPurchasedQuantityForProduct(product.id);

    return Math.max(0, originalStock - purchasedQty);
}

function getRemainingStockConsideringCart(product, excludeCartIndex = -1) {
    if (!product) return 0;

    const remainingAfterPurchase = getRemainingStock(product);
    const cart = getCart();

    const cartQty = cart.reduce(function (sum, item, index) {
        if (index === excludeCartIndex) return sum;
        if (Number(item.id) !== Number(product.id)) return sum;
        return sum + Number(item.quantity || 0);
    }, 0);

    return Math.max(0, remainingAfterPurchase - cartQty);
}

function getDetailSelectedSize() {
    const activeSize = document.querySelector(".size-btn.active");
    return activeSize ? activeSize.textContent.trim() : null;
}

function getProductQuantityInCart(productId, selectedSize = null) {
    const cart = getCart();

    return cart.reduce(function (total, item) {
        if (Number(item.id) !== Number(productId)) return total;

        if (selectedSize === null) {
            return total + Number(item.quantity || 0);
        }

        if ((item.size || null) === selectedSize) {
            return total + Number(item.quantity || 0);
        }

        return total;
    }, 0);
}

function showDetailMessage(message, isSuccess = true) {
    const msg = document.getElementById("detailMessage");
    if (!msg) {
        alert(message);
        return;
    }

    msg.textContent = message;
    msg.className = "detail-message " + (isSuccess ? "success show" : "error show");

    clearTimeout(msg.hideTimeout);

    msg.hideTimeout = setTimeout(function () {
        msg.classList.remove("show");
        msg.textContent = "";
    }, 4000);
}
function getSelectedSizeStock(product, selectedSize) {
    if (!product || !Array.isArray(product.sizes) || !selectedSize) return 0;

    const sizeRow = product.sizes.find(function (item) {
        return String(item.size) === String(selectedSize);
    });

    return sizeRow ? Number(sizeRow.quantity || 0) : 0;
}

function getAvailableStockForDetailProduct() {
    if (!currentDetailProduct) return 0;

    const needsSize = isSizeRequiredProduct(currentDetailProduct) || isKitProduct(currentDetailProduct);

    if (needsSize && Array.isArray(currentDetailProduct.sizes) && currentDetailProduct.sizes.length > 0) {
        const selectedSize = isKitProduct(currentDetailProduct)
            ? selectedClothingSize
            : localStorage.getItem("selectedSize");

        if (!selectedSize) return 0;

        const sizeStock = getSelectedSizeStock(currentDetailProduct, selectedSize);
        const cartQty = getProductQuantityInCart(currentDetailProduct.id, selectedSize);

        return Math.max(0, sizeStock - cartQty);
    }

    const totalStock = Number(currentDetailProduct.quantity || 0);
    const cartQty = getCartQuantityForProduct(currentDetailProduct.id);

    return Math.max(0, totalStock - cartQty);
}

function renderShoeSizeButtons(product) {
    const sizesContainer = document.getElementById("sizesContainer");
    if (!sizesContainer) return;

    sizesContainer.innerHTML = "";

    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
        sizesContainer.style.display = "none";
        return;
    }

    product.sizes.forEach(function (sizeItem) {
        const dbQuantity = Number(sizeItem.quantity || 0);

        const cartQty = getProductQuantityInCart(product.id, sizeItem.size);
        const availableStock = Math.max(0, dbQuantity - cartQty);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn";
        btn.textContent = sizeItem.size;
        btn.setAttribute("data-size", sizeItem.size);
        btn.setAttribute("data-stock", availableStock);

        // ❗ Disable if no stock left
        if (availableStock <= 0) {
            btn.disabled = true;
            btn.classList.add("sold-out-size");
            btn.title = "Sold Out";
        }

        btn.onclick = function () {
            if (btn.disabled) return;

            document.querySelectorAll("#sizesContainer .size-btn").forEach(function (button) {
                button.classList.remove("active");
            });

            btn.classList.add("active");

            localStorage.setItem("selectedSize", sizeItem.size);

            // ✅ Use REAL available stock
            selectedDetailQuantity = availableStock > 0 ? 1 : 0;

            updateDetailQuantityUI();
            updateDetailStockUI();
        };

        sizesContainer.appendChild(btn);
    });
}
function renderKitSizeButtons(product) {
    const clothingSizesContainer = document.getElementById("clothingSizesContainer");
    if (!clothingSizesContainer) return;

    clothingSizesContainer.innerHTML = "";

    const defaultKitSizes = ["S", "M", "L", "XL", "2XL", "3XL"];

    const sizesFromDB = Array.isArray(product.sizes) && product.sizes.length > 0
        ? product.sizes.filter(function (sizeItem) {
            return defaultKitSizes.includes(String(sizeItem.size));
        })
        : defaultKitSizes.map(function (size) {
            return {
                size: size,
                quantity: Number(product.quantity || 0)
            };
        });

    sizesFromDB.forEach(function (sizeItem) {
        const dbQuantity = Number(sizeItem.quantity || 0);
        const cartQty = getProductQuantityInCart(product.id, sizeItem.size);
        const availableStock = Math.max(0, dbQuantity - cartQty);

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "size-btn";
        btn.textContent = sizeItem.size;
        btn.setAttribute("data-size", sizeItem.size);
        btn.setAttribute("data-stock", availableStock);

        if (availableStock <= 0) {
            btn.disabled = true;
            btn.classList.add("sold-out-size");
            btn.title = "Sold Out";
        }

        btn.onclick = function () {
            if (btn.disabled) return;

            document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (button) {
                button.classList.remove("active");
            });

            btn.classList.add("active");

            selectedClothingSize = sizeItem.size;
            localStorage.setItem("selectedSize", sizeItem.size);

            selectedDetailQuantity = availableStock > 0 ? 1 : 0;

            updateDetailQuantityUI();
            updateDetailStockUI();
        };

        clothingSizesContainer.appendChild(btn);
    });
}

function updateDetailQuantityUI() {
    const quantityElement = document.getElementById("detailQuantity");
    if (quantityElement) {
        quantityElement.textContent = selectedDetailQuantity;
    }
}

function updateDetailStockUI() {
    const detailStock = document.getElementById("detailStock");
    const detailCartBtn = document.getElementById("detailCartBtn");

    if (!detailStock || !currentDetailProduct) return;

    const needsSize = isSizeRequiredProduct(currentDetailProduct) || isKitProduct(currentDetailProduct);
    const selectedSize = isKitProduct(currentDetailProduct)
        ? selectedClothingSize
        : localStorage.getItem("selectedSize");

    let availableStock = 0;

    if (needsSize && Array.isArray(currentDetailProduct.sizes) && currentDetailProduct.sizes.length > 0) {
        if (!selectedSize) {
            detailStock.textContent = "Choose a size to see stock.";
            detailStock.className = "stock-info";

            if (detailCartBtn) {
                detailCartBtn.disabled = false;
                detailCartBtn.textContent = "Add to Cart";
                detailCartBtn.classList.remove("sold-out-btn");
            }

            return;
        }

        availableStock = getAvailableStockForDetailProduct();
    } else {
        availableStock = getAvailableStockForDetailProduct();
    }

    const visibleStock = Math.max(0, availableStock - selectedDetailQuantity);

    const stockInfo = getStockLabel(visibleStock);

    detailStock.textContent = stockInfo.text;
    detailStock.className = stockInfo.className;

    if (detailCartBtn) {
        if (availableStock <= 0) {
            detailCartBtn.disabled = true;
            detailCartBtn.textContent = "Sold Out";
            detailCartBtn.classList.add("sold-out-btn");
        } else {
            detailCartBtn.disabled = false;
            detailCartBtn.textContent = "Add to Cart";
            detailCartBtn.classList.remove("sold-out-btn");
        }
    }
}
function increaseDetailQuantity() {
    if (!currentDetailProduct) return;

    const needsSize = isSizeRequiredProduct(currentDetailProduct) || isKitProduct(currentDetailProduct);
    const selectedSize = isKitProduct(currentDetailProduct)
        ? selectedClothingSize
        : localStorage.getItem("selectedSize");

    if (needsSize && Array.isArray(currentDetailProduct.sizes) && currentDetailProduct.sizes.length > 0 && !selectedSize) {
        showDetailMessage("❌ You must choose a size first.", false);
        return;
    }

    const availableStock = getAvailableStockForDetailProduct();

    if (selectedDetailQuantity < availableStock) {
        selectedDetailQuantity++;
        updateDetailQuantityUI();
        updateDetailStockUI();
    } else {
        showDetailMessage("❌ No more stock available for this size.", false);
    }
}

function decreaseDetailQuantity() {
    if (selectedDetailQuantity > 1) {
        selectedDetailQuantity--;
        updateDetailQuantityUI();
        updateDetailStockUI();
    }
}

async function changeCartItemQuantity(cartIndex, change) {
    let cart = getCart();
    const item = cart[cartIndex];
    if (!item) return;

    const currentQty = Number(item.quantity || 0);
    let newQuantity = currentQty;

    if (change === -1) {
        newQuantity = currentQty - 1;

        if (newQuantity < 1) {
            await removeFromCart(cartIndex);
            return;
        }
    }

    if (change === 1) {
        let maxStock = Number(item.stock || item.quantity || 0);

        if (item.size) {
            try {
                const productResponse = await fetch(`http://localhost:5000/products/${item.id || item.product_id}`);
                const product = await productResponse.json();

                if (productResponse.ok && Array.isArray(product.sizes)) {
                    const sizeStock = product.sizes.find(function (sizeItem) {
                        return String(sizeItem.size) === String(item.size);
                    });

                    if (sizeStock) {
                        maxStock = Number(sizeStock.quantity || 0);
                    }
                }
            } catch (error) {
                console.error("SIZE STOCK CHECK ERROR:", error);
            }
        }

        if (currentQty >= maxStock) {
            showCartMessage("❌ No more stock available for this size.");
            return;
        }

        newQuantity = currentQty + 1;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/cart/item/${item.cart_item_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quantity: newQuantity
            })
        });

        if (!response.ok) {
            console.error("Failed to update quantity");
            return;
        }

        await syncCartFromDatabase();
        updateCartCounter();
        await loadCartPage();
        loadProductsPage();
        updateDetailStockUI();

    } catch (error) {
        console.error("Update cart quantity error:", error);
    }
}

function selectSize(size, button) {
    localStorage.setItem("selectedSize", size);

    document.querySelectorAll(".size-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}

function isSizeRequiredProduct(product) {
    if (!product) return false;

    if (isKitProduct(product)) {
        return false;
    }

    const category = (product.category || "").toLowerCase();
    const name = (product.name || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const text = name + " " + description;

    if (
        category === "gym" ||
        text.includes("gloves") ||
        text.includes("bottle") ||
        text.includes("bag") ||
        text.includes("football ball") ||
        text === "football"
    ) {
        return false;
    }

    if (
        category === "football" ||
        category === "basketball" ||
        category === "volleyball" ||
        category === "tennis" ||
        category === "running"
    ) {
        return true;
    }

    return (
        text.includes("shoe") ||
        text.includes("shoes") ||
        text.includes("boot") ||
        text.includes("boots") ||
        text.includes("cleat") ||
        text.includes("cleats") ||
        text.includes("predator") ||
        text.includes("mercurial") ||
        text.includes("phantom") ||
        text.includes("copa") ||
        text.includes("speedflow") ||
        text.includes("crazyfast") ||
        text.includes("tiempo") ||
        text.includes("luna") ||
        text.includes("future") ||
        text.includes("ultra")
    );
}
function isKitProduct(product) {
    if (!product) return false;

    const name = (product.name || "").toLowerCase();
    const description = (product.description || "").toLowerCase();
    const text = name + " " + description;

    return text.includes("kit") || text.includes("jersey");
}

function getKitVariantsForProduct(product) {
    const name = (product?.name || "").toLowerCase();

    const variantsMap = {
        "real madrid kit": {
            home: "images/real-madrid-home.jpg",
            away: "images/real-madrid-away.jpg",
            third: "images/real-madrid-third.jpg"
        },
        "barcelona kit": {
            home: "images/barcelona-home.jpg",
            away: "images/barcelona-away.jpg",
            third: "images/barcelona-third.jpg"
        },
        "chelsea kit": {
            home: "images/chelsea-home.jpg",
            away: "images/chelsea-away.jpg",
            third: "images/chelsea-third.jpg"
        },
        "man city kit": {
            home: "images/man-city-home.jpg",
            away: "images/man-city-away.jpg",
            third: "images/man-city-third.jpg"
        },
        "man united kit": {
            home: "images/man-united-home.jpg",
            away: "images/man-united-away.jpg",
            third: "images/man-united-third.jpg"
        },
        "liverpool kit": {
            home: "images/liverpool-home.jpg",
            away: "images/liverpool-away.jpg",
            third: "images/liverpool-third.jpg"
        },
        "psg kit": {
            home: "images/psg-home.jpg",
            away: "images/psg-away.jpg",
            third: "images/psg-third.jpg"
        },
        "bayern kit": {
            home: "images/bayern-home.jpg",
            away: "images/bayern-away.jpg",
            third: "images/bayern-third.jpg"
        },
        "dortmund kit": {
            home: "images/dortmund-home.jpg",
            away: "images/dortmund-away.jpg",
            third: "images/dortmund-third.jpg"
        },
        "nejmeh kit": {
            home: "images/nejmeh-home.jpg",
            away: "images/nejmeh-away.jpg",
            third: "images/nejmeh-third.jpg"
        },
        "ansar kit": {
            home: "images/ansar-home.jpg",
            away: "images/ansar-away.jpg",
            third: "images/ansar-third.jpg"
        },
        "ahed kit": {
            home: "images/ahed-home.jpg",
            away: "images/ahed-away.jpg",
            third: "images/ahed-third.jpg"
        },
        "atletico madrid kit": {
            home: "images/atletico-madrid-home.jpg",
            away: "images/atletico-madrid-away.jpg",
            third: "images/atletico-madrid-third.jpg"
        }
    };

    return variantsMap[name] || {
        home: product.image,
        away: product.image,
        third: product.image
    };
}

function resetKitSelections() {
    selectedKitVariant = "home";
    selectedKitOption = "full-kit";
    selectedClothingSize = null;
    isCustomizeEnabled = false;

    const customName = document.getElementById("customName");
    const customNumber = document.getElementById("customNumber");

    if (customName) customName.value = "";
    if (customNumber) customNumber.value = "";

    document.querySelectorAll(".kit-variant-btn").forEach(function (btn, index) {
        btn.classList.toggle("active", index === 0);
    });

    document.querySelectorAll(".kit-option-btn").forEach(function (btn, index) {
        btn.classList.toggle("active", index === 0);
    });

    document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });
}

function selectKitVariant(variant, button) {
    selectedKitVariant = variant;

    document.querySelectorAll(".kit-variant-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    if (!currentDetailProduct) return;

    const detailImage = document.getElementById("detailImage");
    const variants = getKitVariantsForProduct(currentDetailProduct);

    if (detailImage && variants[variant]) {
        detailImage.src = variants[variant];
    }

    loadReviews(currentDetailProduct.id);

    updateDetailWishlistButton();
}

function selectKitOption(option, button) {
    selectedKitOption = option;

    document.querySelectorAll(".kit-option-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    updateKitPriceUI();
}

function selectClothingSize(size, button) {
    if (button && (button.disabled || button.classList.contains("sold-out-size"))) {
        return;
    }

    selectedClothingSize = size;
    localStorage.setItem("selectedSize", size);

    document.querySelectorAll("#clothingSizesContainer .size-btn").forEach(function (btn) {
        btn.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }

    selectedDetailQuantity = 1;
    updateDetailQuantityUI();
    updateDetailStockUI();
}

function toggleCustomizeFields() {
    const fields = document.getElementById("customizeFields");
    if (!fields) return;

    isCustomizeEnabled = !isCustomizeEnabled;
    fields.style.display = isCustomizeEnabled ? "block" : "none";

    if (!isCustomizeEnabled) {
        const customName = document.getElementById("customName");
        const customNumber = document.getElementById("customNumber");
        if (customName) customName.value = "";
        if (customNumber) customNumber.value = "";
    }
}

function updateKitPriceUI() {
    const detailPrice = document.getElementById("detailPrice");
    if (!detailPrice || !currentDetailProduct) return;

    const basePrice = Number(currentDetailProduct.price || 0);
    const finalPrice = selectedKitOption === "full-kit" ? basePrice + 10 : basePrice;

    detailPrice.textContent = "$" + finalPrice;
}
function clearProductFilters() {
    localStorage.removeItem("selectedCategory");
    localStorage.removeItem("selectedBrand");
}
function getStockLabel(stock) {
    if (stock <= 0) {
        return {
            text: "Sold Out",
            className: "sold-out-text",
            soldOut: true
        };
    }

    if (stock <= 10) {
        return {
            text: "In Stock: " + stock,
            className: "in-stock-text",
            soldOut: false
        };
    }

    return {
        text: "",
        className: "",
        soldOut: false
    };
}
async function cancelSingleOrderItem(orderItemId) {
    try {
        const response = await fetch(`http://localhost:5000/api/order-items/cancel/${orderItemId}`, {
            method: "PUT"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to cancel item");
            await loadOrdersPage();
            return;
        }

        alert("Item canceled successfully");
        await loadOrdersPage();
    } catch (error) {
        console.error("CANCEL ITEM ERROR:", error);
        alert("Server error");
    }
}
let orderCountdownInterval = null;

function startAllOrderItemCountdowns(orderItems) {
    if (orderCountdownInterval) {
        clearInterval(orderCountdownInterval);
        orderCountdownInterval = null;
    }

    function updateCountdowns() {
        const now = new Date();

        orderItems.forEach(function (item) {
            if (item.status === "Canceled") return;

            const purchaseTime = new Date(item.created_at);
            const deadline = new Date(purchaseTime.getTime() + 2 * 60 * 60 * 1000);
            const countdownElement = document.getElementById(`orderCountdown-${item.order_item_id}`);

            if (!countdownElement) return;

            const diff = deadline - now;

            if (diff <= 0) {
                countdownElement.textContent = "Cancellation period expired.";
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            countdownElement.textContent = `Cancel available for: ${hours}h ${minutes}m ${seconds}s`;
        });
    }

    updateCountdowns();
    orderCountdownInterval = setInterval(updateCountdowns, 1000);
}
async function cancelItem(id) {
    try {
        const res = await fetch(`http://localhost:5000/api/order-items/cancel/${id}`, {
            method: "PUT"
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        alert("Item canceled successfully ✅");

        // 🔥 reload page from DB (not localStorage)
        loadOrdersPage();

    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}
async function addToWishlist(productId) {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${userEmail}`);
        const wishlist = await response.json();

        const alreadySaved = wishlist.some(item => Number(item.id) === Number(productId));

        let url = alreadySaved
            ? "http://localhost:5000/api/wishlist/remove"
            : "http://localhost:5000/api/wishlist/add";

        const actionResponse = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail,
                product_id: productId
            })
        });

        const data = await actionResponse.json();

        if (!actionResponse.ok) {
            alert(data.message || "Wishlist action failed");
            return;
        }

        await loadWishlistCount();

        if (typeof updateWishlistButtons === "function") {
            await updateWishlistButtons();
        }

        if (typeof updateDetailWishlistButton === "function") {
            await updateDetailWishlistButton();
        }

        if (document.getElementById("wishlistItems")) {
            await loadWishlistPage();
        }

    } catch (error) {
        console.error("Wishlist toggle error:", error);
        alert("Server error");
    }
}
async function loadWishlistCount() {
    const wishlistCount = document.getElementById("wishlistCount");
    if (!wishlistCount) return;

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        wishlistCount.textContent = "0";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        wishlistCount.textContent = Array.isArray(data) ? data.length : 0;
    } catch (error) {
        console.error("Wishlist count error:", error);
        wishlistCount.textContent = "0";
    }
}

async function getWishlistFromDatabase() {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) return [];

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${encodeURIComponent(userEmail)}`);

        if (!response.ok) return [];

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Get wishlist error:", error);
        return [];
    }
}

async function isProductInWishlist(productId, kitVariant = null) {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return false;

    try {
        const response = await fetch(`http://localhost:5000/api/wishlist/${encodeURIComponent(userEmail)}`);
        const wishlist = await response.json();

        return wishlist.some(item =>
            Number(item.id) === Number(productId) &&
            String(item.kit_variant || "") === String(kitVariant || "")
        );
    } catch (error) {
        console.error("Check wishlist error:", error);
        return false;
    }
}

async function toggleWishlistByProductId(productId) {
    const userEmail = localStorage.getItem("userEmail");

    if (!requireLogin()) return;

    const kitVariant =
        currentDetailProduct && isKitProduct(currentDetailProduct)
            ? selectedKitVariant
            : null;

    try {
        const exists = await isProductInWishlist(productId, kitVariant);

        const url = exists
            ? "http://localhost:5000/api/wishlist/remove"
            : "http://localhost:5000/api/wishlist/add";

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: userEmail,
                product_id: productId,
                kit_variant: kitVariant
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Wishlist action failed");
            return;
        }

        await updateWishlistCounter();

        if (typeof markWishlistButtons === "function") {
            await markWishlistButtons();
        }

        if (typeof updateDetailWishlistButton === "function") {
            await updateDetailWishlistButton();
        }

        if (document.getElementById("wishlistItems") ||
            document.getElementById("wishlistContainer") ||
            document.getElementById("wishlistPageItems")) {
            await loadWishlistPage();
        }

    } catch (error) {
        console.error("Wishlist toggle error:", error);
        alert("Server error");
    }
}

async function loadWishlistCount() {
    const wishlistCount = document.getElementById("wishlistCount");
    if (!wishlistCount) return;

    const wishlist = await getWishlistFromDatabase();
    wishlistCount.textContent = wishlist.length;
}
async function updateWishlistButtons() {
    const wishlist = await getWishlistFromDatabase();
    const wishlistIds = wishlist.map(item => Number(item.id));

    document.querySelectorAll(".wishlist-btn").forEach(button => {
        const productId = Number(button.dataset.productId);

        if (wishlistIds.includes(productId)) {
            button.classList.add("active");
            button.innerHTML = "♥";
        } else {
            button.classList.remove("active");
            button.innerHTML = "♡";
        }
    });
}

async function updateDetailWishlistButton() {
    const detailWishBtn = document.getElementById("detailWishBtn");

    if (!detailWishBtn || !currentDetailProduct) return;

    const kitVariant =
        isKitProduct(currentDetailProduct)
            ? selectedKitVariant
            : null;

    const exists = await isProductInWishlist(currentDetailProduct.id, kitVariant);

    if (exists) {
        detailWishBtn.classList.add("active");
        detailWishBtn.innerHTML = "♥ Saved";
    } else {
        detailWishBtn.classList.remove("active");
        detailWishBtn.innerHTML = "♡";
    }
}
async function adminLogin(event) {
    event.preventDefault();

    const email = document.getElementById("adminEmail")?.value.trim();
    const password = document.getElementById("adminPassword")?.value.trim();
    const message = document.getElementById("adminLoginMessage");

    if (!email || !password) return;

    try {
        const response = await fetch("http://localhost:5000/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            if (message) {
                message.style.color = "red";
                message.textContent = data.message || "Admin login failed";
            }
            return;
        }

        localStorage.setItem("adminId", data.admin.id);
        localStorage.setItem("adminEmail", data.admin.email);
        localStorage.setItem("adminFullName", data.admin.fullname);

        window.location.href = "admin.html";
    } catch (error) {
        console.error("ADMIN LOGIN ERROR:", error);
        if (message) {
            message.style.color = "red";
            message.textContent = "Server error";
        }
    }
}
function requireAdmin() {
    const adminEmail = localStorage.getItem("adminEmail");

    if (!adminEmail) {
        window.location.href = "admin-login.html";
        return false;
    }

    return true;
}

function adminLogout() {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("adminFullName");

    window.location.href = "admin-login.html";
}

function loadAdminPage() {
    if (!requireAdmin()) return;
}
let editingAdminProductId = null;

function loadAdminProductsPage() {
    if (!requireAdmin()) return;
    loadAdminProducts();
}

async function loadAdminProducts() {
    const list = document.getElementById("adminProductsList");
    if (!list) return;

    try {
        const response = await fetch("http://localhost:5000/api/admin/products");
        const products = await response.json();

        if (!response.ok) {
            list.innerHTML = "<p>Failed to load products.</p>";
            return;
        }

        list.innerHTML = "";

        if (!products.length) {
            list.innerHTML = "<p>No products found.</p>";
            return;
        }

        products.forEach(product => {
            const item = document.createElement("div");
            item.className = "admin-product-card";

            item.innerHTML = `
                <div class="admin-product-card-left">
                    <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/no-image.png';">
                </div>
                <div class="admin-product-card-middle">
                    <h3>${product.name}</h3>
                    <p><strong>ID:</strong> ${product.id}</p>
                    <p><strong>Price:</strong> $${product.price}</p>
                    <p><strong>Brand:</strong> ${product.brand}</p>
                    ${(isKitProduct(product) || isSizeRequiredProduct(product)) 
                      ? "" 
                   : `<p><strong>Quantity:</strong> ${product.quantity}</p>`
                      }
                    <p><strong>Category:</strong> ${product.category_name || "Unknown"}</p>
                    <p><strong>Description:</strong> ${product.description}</p>
                </div>
                <div class="admin-product-card-right">
                    <button class="admin-btn" onclick="editAdminProduct(${product.id}, \`${product.name.replace(/`/g, "\\`")}\`, \`${product.description.replace(/`/g, "\\`")}\`, '${product.price}', \`${product.image.replace(/`/g, "\\`")}\`, \`${product.brand.replace(/`/g, "\\`")}\`, '${product.quantity}', '${product.category_id}')">Edit</button>
                    <button class="admin-btn delete-btn" onclick="deleteAdminProduct(${product.id})">Delete</button>
                </div>
            `;

            list.appendChild(item);
        });
    } catch (error) {
        console.error("LOAD ADMIN PRODUCTS ERROR:", error);
        list.innerHTML = "<p>Server error while loading products.</p>";
    }
}

function editAdminProduct(id, name, description, price, image, brand, quantity, categoryId) {
    editingAdminProductId = id;

    document.getElementById("adminProductName").value = name;
    document.getElementById("adminProductDescription").value = description;
    document.getElementById("adminProductPrice").value = price;
    document.getElementById("adminProductImage").value = image;
    document.getElementById("adminProductBrand").value = brand;
    document.getElementById("adminProductQuantity").value = quantity;
    document.getElementById("adminProductCategoryId").value = categoryId;

    const title = document.getElementById("adminProductFormTitle");
    if (title) title.textContent = "Edit Product";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function resetAdminProductForm() {
    editingAdminProductId = null;

    const form = document.getElementById("adminProductForm");
    const title = document.getElementById("adminProductFormTitle");
    const message = document.getElementById("adminProductMessage");

    if (form) form.reset();
    if (title) title.textContent = "Add Product";
    if (message) message.textContent = "";
}

async function saveAdminProduct(event) {
    event.preventDefault();

    const name = document.getElementById("adminProductName")?.value.trim();
    const description = document.getElementById("adminProductDescription")?.value.trim();
    const price = document.getElementById("adminProductPrice")?.value.trim();
    const image = document.getElementById("adminProductImage")?.value.trim();
    const brand = document.getElementById("adminProductBrand")?.value.trim();
    const quantity = document.getElementById("adminProductQuantity")?.value.trim();
    const categoryId = document.getElementById("adminProductCategoryId")?.value.trim();
    const message = document.getElementById("adminProductMessage");

    if (!name || !description || !price || !image || !brand || quantity === "" || !categoryId) {
        if (message) {
            message.textContent = "Please fill all fields.";
            message.style.color = "#ff4d4d";
        }
        return;
    }

    const payload = {
        name,
        description,
        price: Number(price),
        image,
        brand,
        quantity: Number(quantity),
        category_id: Number(categoryId)
    };

    try {
        let response;

        if (editingAdminProductId) {
            response = await fetch(`http://localhost:5000/api/admin/products/${editingAdminProductId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch("http://localhost:5000/api/admin/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
        }

        const data = await response.json();

        if (!response.ok) {
            if (message) {
                message.textContent = data.message || "Failed to save product.";
                message.style.color = "#ff4d4d";
            }
            return;
        }

        if (message) {
            message.textContent = editingAdminProductId ? "Product updated successfully." : "Product added successfully.";
            message.style.color = "#4CAF50";
        }

        resetAdminProductForm();
        await loadAdminProducts();
    } catch (error) {
        console.error("SAVE ADMIN PRODUCT ERROR:", error);
        if (message) {
            message.textContent = "Server error.";
            message.style.color = "#ff4d4d";
        }
    }
}

async function deleteAdminProduct(productId) {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    try {
        const response = await fetch(`http://localhost:5000/api/admin/products/${productId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete product");
            return;
        }

        await loadAdminProducts();
        resetAdminProductForm();
    } catch (error) {
        console.error("DELETE ADMIN PRODUCT ERROR:", error);
        alert("Server error");
    }
}
function loadAdminOrdersPage() {
    if (!requireAdmin()) return;
    loadAdminOrders();
}

async function loadAdminOrders() {
    const container = document.getElementById("adminOrdersList");
    if (!container) return;

    try {
        const response = await fetch("http://localhost:5000/api/admin/orders");
        const data = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p>Failed to load orders.</p>";
            return;
        }

        if (!data.length) {
            container.innerHTML = "<p>No orders found.</p>";
            return;
        }

        const groupedOrders = {};

        data.forEach(item => {
            if (!groupedOrders[item.order_id]) {
                groupedOrders[item.order_id] = {
                    order_id: item.order_id,
                    user_email: item.user_email,
                    total: item.total,
                    payment_method: item.payment_method,
                    phone1: item.phone1,
                    phone2: item.phone2,
                    address: item.address,
                    order_created_at: item.order_created_at,
                    items: []
                };
            }

            groupedOrders[item.order_id].items.push(item);
        });

        container.innerHTML = "";

        Object.values(groupedOrders).forEach(order => {
            const orderBox = document.createElement("div");
            orderBox.className = "admin-order-card";

            let itemsHtml = "";

            order.items.forEach(item => {
                const customizeText =
                    item.customization ||
                    (
                        item.custom_name
                            ? (item.custom_number ? `${item.custom_name} - ${item.custom_number}` : item.custom_name)
                            : ""
                    );

                const adminItemImage = getCartItemImage(item);

                const kitTypeText = item.kit_variant
                    ? item.kit_variant.charAt(0).toUpperCase() + item.kit_variant.slice(1)
                    : "";

                itemsHtml += `
                    <div class="admin-order-item">
                        <div class="admin-order-item-left">
                            <img src="${adminItemImage}"
                                 alt="${item.name || 'Product'}"
                                 onerror="this.onerror=null;this.src='images/no-image.png';">
                        </div>

                        <div class="admin-order-item-right">
                            <h3>${item.name || "Deleted Product"}</h3>
                            <p><strong>Quantity:</strong> ${item.quantity}</p>
                            <p><strong>Size:</strong> ${item.size || "-"}</p>
                            ${kitTypeText ? `<p><strong>Kit Type:</strong> ${kitTypeText}</p>` : ""}
                            ${item.kit_option ? `<p><strong>Option:</strong> ${item.kit_option}</p>` : ""}
                            ${customizeText ? `<p><strong>Customize:</strong> ${customizeText}</p>` : ""}
                            <p><strong>Price:</strong> $${item.price}</p>

                            <div class="admin-order-status-row">
                                <label><strong>Status:</strong></label>
                                <select 
                                    onchange="updateOrderStatus(${item.order_item_id}, this.value)" 
                                    class="admin-status-select"
                                    ${item.status === "Canceled" ? "disabled" : ""}
                                >
                                    <option value="Placed" ${item.status === "Placed" ? "selected" : ""}>Placed</option>
                                    <option value="Shipped" ${item.status === "Shipped" ? "selected" : ""}>Shipped</option>
                                    <option value="Delivered" ${item.status === "Delivered" ? "selected" : ""}>Delivered</option>
                                    <option value="Canceled" ${item.status === "Canceled" ? "selected" : ""}>Canceled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
            });

            orderBox.innerHTML = `
                <div class="admin-order-header">
                    <h2>Order #${order.order_id}</h2>
                    <p><strong>Email:</strong> ${order.user_email}</p>
                    <p><strong>Total:</strong> $${order.total}</p>
                    <p>
                        <strong>Payment Method:</strong>
                        <span class="${order.payment_method === 'Bank Card' ? 'payment-card' : 'payment-cash'}">
                            ${order.payment_method || "-"}
                        </span>
                    </p>
                    <p><strong>Payment:</strong> ${order.payment_method}</p>
                    <p><strong>Phone 1:</strong> ${order.phone1 || "-"}</p>
                    <p><strong>Phone 2:</strong> ${order.phone2 || "-"}</p>
                    <p><strong>Address:</strong> ${order.address || "-"}</p>
                    <p><strong>Date:</strong> ${new Date(order.order_created_at).toLocaleString()}</p>
                </div>
                <div class="admin-order-items">
                    ${itemsHtml}
                </div>
            `;

            container.appendChild(orderBox);
        });
    } catch (error) {
        console.error("LOAD ADMIN ORDERS ERROR:", error);
        container.innerHTML = "<p>Server error while loading orders.</p>";
    }
}

function updateOrderStatus(orderItemId, newStatus) {
    fetch(`http://localhost:5000/api/admin/order-items/${orderItemId}/status`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(res => res.json())
    .then(data => {
        console.log(data);
        loadAdminOrders();
    })
    .catch(err => {
        console.error("Error updating status:", err);
        alert("❌ Failed to update status");
    });
}
async function loadContactMessages() {
      const container = document.getElementById("contactMessagesContainer");

      // STOP if not on contact page
      if (!container) return;

      try {
        const response = await fetch("http://localhost:5000/api/admin/contact-messages");
        const messages = await response.json();

        if (!response.ok) {
          container.innerHTML = `
            <p class="contact-error">
              ${messages.message || "Failed to load messages"}
            </p>
          `;
          return;
        }

        if (!messages.length) {
          container.innerHTML = `
            <p class="contact-empty">
              No contact messages found.
            </p>
          `;
          return;
        }

        container.innerHTML = messages.map(msg => `
  <div class="contact-card">

    <div class="contact-card-header">
      <div>
        <h3 class="contact-name">${msg.name}</h3>
        <p class="contact-email">${msg.email}</p>
      </div>

      <span class="contact-date">
        ${new Date(msg.created_at).toLocaleString()}
      </span>
    </div>

    <div class="contact-message-box">
      <p class="contact-message-label">MESSAGE</p>
      <p class="contact-message-text">${msg.message}</p>
    </div>

    <div class="reply-box" id="replyBox-${msg.id}" style="display: none;">

      <input
        type="text"
        id="replySubject-${msg.id}"
        class="reply-subject"
        placeholder="Enter subject"
        value="Reply from WS Store"
      />

      <textarea
        id="replyMessage-${msg.id}"
        class="reply-textarea"
        placeholder="Write your reply here..."
      ></textarea>

      <button
        class="send-reply-btn"
        onclick="sendReply('${msg.email}', ${msg.id})">
        Send Reply
      </button>

    </div>

    <div class="contact-card-actions">
      <button
        class="reply-btn"
        onclick="toggleReplyBox(${msg.id})">
        Reply
      </button>

      <button
        class="delete-btn"
        onclick="deleteContactMessage(${msg.id})">
        Delete
      </button>
    </div>

  </div>
 `).join("");

      } catch (error) {
        console.error("LOAD CONTACT MESSAGES ERROR:", error);

        container.innerHTML = `
          <p class="contact-error">
            Server error while loading messages.
          </p>
        `;
      }
}

    async function deleteContactMessage(id) {
      const confirmDelete = confirm("Are you sure you want to delete this message?");
      if (!confirmDelete) return;

      try {
        const response = await fetch(`http://localhost:5000/api/admin/contact-messages/${id}`, {
          method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to delete message");
          return;
        }

        loadContactMessages();
      } catch (error) {
        console.error("DELETE CONTACT MESSAGE ERROR:", error);
        alert("Server error while deleting message");
      }
    }
    function goBack() {
  window.location.href = "admin.html";
}

function logoutAdmin() {
  localStorage.removeItem("admin");
  window.location.href = "admin-login.html";
}
function toggleReplyBox(id) {
  const box = document.getElementById(`replyBox-${id}`);
  if (!box) return;

  if (box.style.display === "none" || box.style.display === "") {
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}

async function sendReply(to, id) {
  const subjectInput = document.getElementById(`replySubject-${id}`);
  const messageInput = document.getElementById(`replyMessage-${id}`);

  const subject = subjectInput.value.trim();
  const replyMessage = messageInput.value.trim();

  if (!subject || !replyMessage) {
    alert("Please fill in both subject and reply message.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/admin/contact-messages/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to,
        subject,
        replyMessage
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to send reply");
      return;
    }

    alert("Reply sent successfully");
    messageInput.value = "";
    document.getElementById(`replyBox-${id}`).style.display = "none";
  } catch (error) {
    console.error("SEND REPLY ERROR:", error);
    alert("Server error while sending reply");
  }
}

    window.addEventListener("DOMContentLoaded", loadContactMessages);
    
    
let productsSoldChartInstance = null;
let revenueChartInstance = null;
let topProductsChartInstance = null;

async function loadDashboardStats(filter = "day") {
    const totalProducts = document.getElementById("totalProducts");
    const totalOrders = document.getElementById("totalOrders");
    const totalMessages = document.getElementById("totalMessages");
    const totalCustomers = document.getElementById("totalCustomers");

    if (!totalProducts || !totalOrders || !totalMessages || !totalCustomers) return;

    try {
        const selectedFilter = filter === "default" ? "day" : filter;
        const response = await fetch(`http://localhost:5000/api/admin/dashboard-stats?filter=${selectedFilter}`);
        const data = await response.json();

        if (!response.ok) {
            console.error(data.message || "Failed to load dashboard stats");
            return;
        }

        totalProducts.textContent = data.totalProducts;
        totalOrders.textContent = data.totalOrders;
        totalMessages.textContent = data.totalMessages;
        totalCustomers.textContent = data.totalCustomers;

        data.filter = selectedFilter;
        renderDashboardCharts(data);

    } catch (error) {
        console.error("DASHBOARD STATS ERROR:", error);
    }
}

function renderDashboardCharts(data) {
    const productsSoldCanvas = document.getElementById("productsSoldChart");
    const revenueCanvas = document.getElementById("revenueChart");
    const topProductsCanvas = document.getElementById("topProductsChart");

    const productsSoldTitle = document.getElementById("productsSoldChartTitle");
    const revenueTitle = document.getElementById("revenueChartTitle");

    if (!productsSoldCanvas || !revenueCanvas || !topProductsCanvas) return;

    if (productsSoldChartInstance) productsSoldChartInstance.destroy();
    if (revenueChartInstance) revenueChartInstance.destroy();
    if (topProductsChartInstance) topProductsChartInstance.destroy();

    const filter = data.filter || "day";

    const titleText =
        filter === "week" ? "Per Week" :
        filter === "month" ? "Per Month" :
        "Per Day";

    if (productsSoldTitle) {
        productsSoldTitle.textContent = "Products Sold " + titleText;
    }

    if (revenueTitle) {
        revenueTitle.textContent = "Revenue " + titleText;
    }

    const formatLabel = function (item) {
        if (filter === "week") {
            return "Week " + item.period;
        }

        if (filter === "month") {
            return item.period;
        }

        return new Date(item.period).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    };

    productsSoldChartInstance = new Chart(productsSoldCanvas, {
        type: "bar",
        data: {
            labels: data.productsSold.map(item => formatLabel(item)),
            datasets: [{
                label: "Products Sold",
                data: data.productsSold.map(item => item.total_sold)
            }]
        }
    });

    revenueChartInstance = new Chart(revenueCanvas, {
        type: "line",
        data: {
            labels: data.revenue.map(item => formatLabel(item)),
            datasets: [{
                label: "Revenue ($)",
                data: data.revenue.map(item => item.revenue)
            }]
        }
    });

    topProductsChartInstance = new Chart(topProductsCanvas, {
        type: "bar",
        data: {
            labels: data.topProducts.map(item => item.name),
            datasets: [{
                label: "Sold Quantity",
                data: data.topProducts.map(item => item.total_sold)
            }]
        }
    });
}

function showDashboard() {
    const dashboardSection = document.getElementById("dashboardSection");
    const dashboardCharts = document.getElementById("dashboardCharts");

    if (dashboardSection) {
        dashboardSection.style.display = "grid";
    }

    if (dashboardCharts) {
        dashboardCharts.style.display = "grid";
    }

    loadDashboardStats("day");
}

function checkAdminAuth() {
  const admin = localStorage.getItem("admin");

  const currentPage = window.location.pathname;
  const isAdminPage =
    currentPage.includes("admin.html") ||
    currentPage.includes("admin-products.html") ||
    currentPage.includes("admin-orders.html") ||
    currentPage.includes("admin-contact.html");

  if (isAdminPage && !admin) {
    window.location.replace("admin-login.html");
  }
}

function checkAdminAuth() {
  const admin = localStorage.getItem("admin");

  const currentPage = window.location.pathname;
  const isAdminPage =
    currentPage.includes("admin.html") ||
    currentPage.includes("admin-products.html") ||
    currentPage.includes("admin-orders.html") ||
    currentPage.includes("admin-contact.html");

  if (isAdminPage && !admin) {
    window.location.replace("admin-login.html");
  }
}

function checkAdminAuth() {
  const admin = localStorage.getItem("admin");

  const currentPage = window.location.pathname;
  const isAdminPage =
    currentPage.includes("admin.html") ||
    currentPage.includes("admin-products.html") ||
    currentPage.includes("admin-orders.html") ||
    currentPage.includes("admin-contact.html");

  if (isAdminPage && !admin) {
    window.location.replace("admin-login.html");
  }
}

function checkAdminAuth() {
  const admin = localStorage.getItem("admin");
  const currentPage = window.location.pathname;

  // Do NOT protect login page
  if (currentPage.includes("admin-login.html")) return;

  const isAdminPage =
    currentPage.includes("admin.html") ||
    currentPage.includes("admin-products.html") ||
    currentPage.includes("admin-orders.html") ||
    currentPage.includes("admin-contact.html");


}

function logoutAdmin() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;

  localStorage.removeItem("admin");
  window.location.replace("admin-login.html");
}

window.addEventListener("DOMContentLoaded", checkAdminAuth);
window.addEventListener("pageshow", checkAdminAuth);
async function setupStripePaymentElement() {
    const paymentElementContainer = document.getElementById("payment-element");
    if (!paymentElementContainer) return;

    if (stripePaymentElement) {
        paymentElementContainer.innerHTML = "";
        stripePaymentElement = null;
        stripeElements = null;
        stripeClientSecret = null;
    }

    try {
        const configResponse = await fetch("http://localhost:5000/api/stripe/config");
        const configData = await configResponse.json();

        if (!configResponse.ok || !configData.publishableKey) {
            throw new Error(configData.message || "Stripe config failed");
        }

        const intentResponse = await fetch("http://localhost:5000/api/stripe/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_email: localStorage.getItem("userEmail")
            })
        });

        const intentData = await intentResponse.json();

        if (!intentResponse.ok || !intentData.clientSecret) {
            throw new Error(intentData.message || "Failed to create payment intent");
        }

        stripeClientSecret = intentData.clientSecret;
        stripe = Stripe(configData.publishableKey);

        stripeElements = stripe.elements({
            clientSecret: stripeClientSecret
        });

        stripePaymentElement = stripeElements.create("payment");
        stripePaymentElement.mount("#payment-element");
    } catch (error) {
        console.error("Stripe setup error:", error);
        showCheckoutMessage("❌ Failed to load card payment form.", false);
    }
}
function getProductQuantityInCart(productId, size) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    let total = 0;

    cart.forEach(function (item) {
        if (String(item.id) === String(productId)) {
            // if size matters
            if (size) {
                if (String(item.size) === String(size)) {
                    total += Number(item.quantity || 0);
                }
            } else {
                total += Number(item.quantity || 0);
            }
        }
    });

    return total;
}
let resendTimer = 60;
let resendInterval;

function startResendTimer() {
    const resendBtn = document.getElementById("resendCodeBtn");

    if (!resendBtn) return;

    resendBtn.disabled = true;
    resendBtn.style.opacity = "0.6";

    clearInterval(resendInterval);

    resendInterval = setInterval(() => {
        resendTimer--;

        resendBtn.textContent = `Resend Code (${resendTimer}s)`;

        if (resendTimer <= 0) {
            clearInterval(resendInterval);

            resendBtn.disabled = false;
            resendBtn.style.opacity = "1";
            resendBtn.textContent = "Resend Verification Code";
        }
    }, 1000);
}
async function resendVerificationCode() {
    const email = document.getElementById("verifyEmail")?.value.trim();

    if (!email) {
        alert("Email is required.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/resend-verification-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            alert("❌ " + (data.message || "Failed to resend verification code."));
            return;
        }

        alert("📧 New verification code sent to your email.");

        startResendTimer();

    } catch (error) {
        console.error("RESEND VERIFICATION ERROR:", error);
        alert("❌ Server error while resending code.");
    }
}
async function sendResetCode(event) {
    event.preventDefault();

    const email = document.getElementById("resetEmail")?.value.trim();

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/forgot-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to send reset code.");
            return;
        }

        alert("📧 Reset code sent to your email.");

        localStorage.setItem("resetPasswordEmail", email);

        window.location.href = "reset-password.html";

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        alert("Server error.");
    }
}
async function resetPassword(event) {
    event.preventDefault();

    const email =
        document.getElementById("resetPasswordEmail")?.value.trim();

    const code =
        document.getElementById("resetCode")?.value.trim();

    const newPassword =
        document.getElementById("newPassword")?.value.trim();

    if (!email || !code || !newPassword) {
        alert("Please fill all fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                code,
                newPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to reset password.");
            return;
        }

        alert("✅ Password reset successfully!");

        localStorage.removeItem("resetPasswordEmail");

        window.location.href = "login.html";

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        alert("Server error.");
    }
}
function selectReviewRating(rating) {
    selectedReviewRating = rating;

    const stars = document.querySelectorAll("#starRating .star");

    stars.forEach(function (star, index) {
        if (index < rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}
function renderAverageRating(reviews) {
    const averageBox = document.getElementById("averageRatingBox");
    if (!averageBox) return;

    const ratings = reviews
        .map(review => Number(review.rating))
        .filter(rating => rating > 0);

    if (ratings.length === 0) {
        averageBox.innerHTML = `
            <span class="average-stars">☆☆☆☆☆</span>
            <span class="average-text">No ratings yet</span>
        `;
        return;
    }

    const average =
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    const roundedAverage = Math.round(average * 10) / 10;

    let starsHtml = "";

    for (let i = 1; i <= 5; i++) {
        starsHtml += i <= Math.round(average)
            ? "★"
            : "☆";
    }

    averageBox.innerHTML = `
        <span class="average-stars">${starsHtml}</span>
        <span class="average-text">${roundedAverage}/5 from ${ratings.length} ratings</span>
    `;
}
function getStarsHtml(rating) {
    if (!rating || Number(rating) <= 0) return "";

    let stars = "";
    const ratingNumber = Number(rating);

    for (let i = 1; i <= 5; i++) {
        stars += i <= ratingNumber ? "★" : "☆";
    }

    return `<div class="review-stars">${stars}</div>`;
}
function loadAdminReviewsPage() {
    if (!requireAdmin()) return;
    loadAdminReviews();
}

async function loadAdminReviews() {
    const container = document.getElementById("adminReviewsList");
    if (!container) return;

    await getAvailableProducts();

    try {
        const response = await fetch("http://localhost:5000/api/admin/reviews");
        const reviews = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p>Failed to load reviews.</p>";
            return;
        }

        if (!Array.isArray(reviews) || reviews.length === 0) {
            container.innerHTML = "<p>No reviews found.</p>";
            return;
        }

        container.innerHTML = "";

        reviews.forEach(function (review) {
            const card = document.createElement("div");
            card.className = "admin-review-card";

            const reviewImage = getCartItemImage({
                id: review.product_id,
                product_id: review.product_id,
                name: review.product_name,
                image: review.product_image,
                kit_variant: review.kit_variant
            });

            const kitTypeText = review.kit_variant
                ? review.kit_variant.charAt(0).toUpperCase() + review.kit_variant.slice(1)
                : "";

            card.innerHTML = `
                <div class="admin-review-image-box">
                    <img 
                        src="${reviewImage}"
                        alt="${review.product_name || "Product"}"
                        onerror="this.onerror=null;this.src='images/no-image.png';"
                    >
                </div>

                <div class="admin-review-content">
                    <h3>${review.product_name || "Deleted Product"}</h3>

                    ${kitTypeText ? `<p><strong>Kit Type:</strong> ${kitTypeText}</p>` : ""}

                    <p><strong>Customer:</strong> ${review.user_name || "-"}</p>
                    <p><strong>Email:</strong> ${review.user_email || "-"}</p>

                    ${review.rating ? `<div class="admin-review-stars">${getStarsText(review.rating)}</div>` : ""}

                    ${review.review_text ? `<p class="admin-review-comment"><strong>Comment:</strong> ${review.review_text}</p>` : ""}

                    <p class="admin-review-date">
                        <strong>Date:</strong> ${new Date(review.created_at).toLocaleString()}
                    </p>

                    <button class="admin-delete-review-btn" onclick="deleteAdminReview(${review.review_id})">
                        Delete Review
                    </button>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error("LOAD ADMIN REVIEWS ERROR:", error);
        container.innerHTML = "<p>Server error while loading reviews.</p>";
    }
}

function getStarsText(rating) {
    let stars = "";
    const ratingNumber = Number(rating || 0);

    for (let i = 1; i <= 5; i++) {
        stars += i <= ratingNumber ? "★" : "☆";
    }

    return stars;
}

async function deleteAdminReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
        const response = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                is_admin: true
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Failed to delete review.");
            return;
        }

        await loadAdminReviews();

    } catch (error) {
        console.error("DELETE ADMIN REVIEW ERROR:", error);
        alert("Server error while deleting review.");
    }
}
function toggleDashboardFilter() {
    const filterOptions = document.getElementById("dashboardFilterOptions");
    if (!filterOptions) return;

    filterOptions.style.display =
        filterOptions.style.display === "flex" ? "none" : "flex";
}
let chatbotLanguage = "english";
let currentSpeech = null;
let pausedSpeech = false;
function toggleChatbot() {
    const chatbotBox = document.getElementById("chatbotBox");
    if (!chatbotBox) return;

    const isOpen = chatbotBox.style.display === "flex";

    if (isOpen) {
        chatbotBox.style.setProperty("display", "none", "important");
    } else {
        chatbotBox.style.setProperty("display", "flex", "important");

        const messagesBox = document.getElementById("chatbotMessages");

        if (messagesBox && !messagesBox.dataset.welcomePlayed) {
            messagesBox.dataset.welcomePlayed = "true";
            messagesBox.innerHTML = "";

            const welcomeText = "Hello, welcome to WS Store. Which language do you need? English or Arabic?";
            typeBotMessage(welcomeText);
            speakBotMessage(welcomeText);
        }
    }
}

function typeBotMessage(message) {
    const messagesBox = document.getElementById("chatbotMessages");
    if (!messagesBox) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "bot-message";
    messagesBox.appendChild(messageDiv);

    let index = 0;

    const typingInterval = setInterval(function () {
        messageDiv.textContent += message.charAt(index);
        index++;

        messagesBox.scrollTop = messagesBox.scrollHeight;

        if (index >= message.length) {
            clearInterval(typingInterval);
            addChatbotQuickQuestions();
        }
    }, 40);
}

function speakBotMessage(message) {
    if (chatbotLanguage !== "english") {
        window.speechSynthesis.cancel();
        return;
    }

    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);

    currentSpeech = speech;
    pausedSpeech = false;

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
}

function addChatbotQuickQuestions() {
    const messagesBox = document.getElementById("chatbotMessages");
    if (!messagesBox) return;

    const oldQuickQuestions = messagesBox.querySelectorAll(".chatbot-quick-questions");
    oldQuickQuestions.forEach(function (item) {
        item.remove();
    });

    const quickQuestions = document.createElement("div");
    quickQuestions.className = "chatbot-quick-questions";

    if (chatbotLanguage === "arabic") {
        quickQuestions.innerHTML = `
            <button onclick="sendQuickQuestion('ما هي طرق الدفع؟')">طرق الدفع</button>
            <button onclick="sendQuickQuestion('هل يمكنني إلغاء الطلب؟')">إلغاء الطلب</button>
            <button onclick="sendQuickQuestion('اعرض منتجات كرة القدم')">منتجات كرة القدم</button>
            <button onclick="sendQuickQuestion('أين يقع المتجر؟')">الموقع</button>
        `;
    } else {
        quickQuestions.innerHTML = `
            <button onclick="sendQuickQuestion('What payment methods do you accept?')">Payment</button>
            <button onclick="sendQuickQuestion('Can I cancel my order?')">Cancel Order</button>
            <button onclick="sendQuickQuestion('Show me football products')">Football Products</button>
            <button onclick="sendQuickQuestion('Where is WS Store located?')">Location</button>
        `;
    }

    messagesBox.appendChild(quickQuestions);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}
function handleChatbotEnter(event) {
    if (event.key === "Enter") {
        sendChatbotMessage();
    }
}

function sendQuickQuestion(question) {
    const input = document.getElementById("chatbotInput");
    if (!input) return;

    input.value = question;
    sendChatbotMessage();
}

async function sendChatbotMessage() {
    const input = document.getElementById("chatbotInput");
    const messagesBox = document.getElementById("chatbotMessages");

    if (!input || !messagesBox) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;
    const lowerMessage = userMessage.toLowerCase();

 if (
    lowerMessage === "stop" ||
    userMessage === "توقف" ||
    userMessage === "وقف"
 ) {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        pausedSpeech = true;
    }

    addUserMessage(userMessage);

    setTimeout(function () {
        const reply = chatbotLanguage === "arabic"
            ? "تم إيقاف الصوت."
            : "Voice paused.";

        typeBotMessage(reply);
    }, 300);

    input.value = "";
    return;
 }

 if (
    lowerMessage === "continue" ||
    userMessage === "كمل" ||
    userMessage === "اكمل"
 ) {
    if (pausedSpeech) {
        window.speechSynthesis.resume();
        pausedSpeech = false;
    }

    addUserMessage(userMessage);

    setTimeout(function () {
        const reply = chatbotLanguage === "arabic"
            ? "تم استكمال الصوت."
            : "Voice resumed.";

        typeBotMessage(reply);
    }, 300);

    input.value = "";
    return;
 }

    addUserMessage(userMessage);
    input.value = "";

    // language change stays frontend
    if (
        userMessage.toLowerCase().includes("arabic") ||
        userMessage.includes("عربي") ||
        userMessage.includes("العربية")
    ) {
        chatbotLanguage = "arabic";
        const reply = "تمام، سأجيبك باللغة العربية. كيف يمكنني مساعدتك؟";

        setTimeout(function () {
            typeBotMessage(reply);
            speakBotMessage(reply);
        }, 400);

        return;
    }

    if (
        userMessage.toLowerCase().includes("english") ||
        userMessage.includes("انجليزي") ||
        userMessage.includes("إنجليزي")
    ) {
        chatbotLanguage = "english";
        const reply = "Sure, I will answer in English. How can I help you?";

        setTimeout(function () {
            typeBotMessage(reply);
            speakBotMessage(reply);
        }, 400);

        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/chatbot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
           body: JSON.stringify({
    message: userMessage,
    language: chatbotLanguage,
    user_name:
        localStorage.getItem("userFullName") ||
        localStorage.getItem("userName") ||
        localStorage.getItem("fullname") ||
        "Guest User"
})
        });

        const data = await response.json();

        const botReply = data.reply || getChatbotReply(userMessage);

        setTimeout(function () {
            typeBotMessage(botReply);
            speakBotMessage(botReply);
        }, 500);

    } catch (error) {
        console.error("CHATBOT ERROR:", error);

        const fallbackReply = getChatbotReply(userMessage);

        setTimeout(function () {
            typeBotMessage(fallbackReply);
            speakBotMessage(fallbackReply);
        }, 500);
    }
}

function addUserMessage(message) {
    const messagesBox = document.getElementById("chatbotMessages");
    if (!messagesBox) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = "user-message";
    messageDiv.textContent = message;

    messagesBox.appendChild(messageDiv);
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

function getChatbotReply(message) {
    const text = message.toLowerCase();

    if (
        text.includes("arabic") ||
        text.includes("عربي") ||
        text.includes("العربية")
    ) {
        chatbotLanguage = "arabic";
        return "تمام، سأجيبك باللغة العربية. كيف يمكنني مساعدتك؟";
    }

    if (
        text.includes("english") ||
        text.includes("انجليزي") ||
        text.includes("إنجليزي")
    ) {
        chatbotLanguage = "english";
        return "Sure, I will answer in English. How can I help you?";
    }

    if (chatbotLanguage === "arabic") {
        if (text.includes("دفع") || text.includes("كاش") || text.includes("بطاقة") || text.includes("فيزا")) {
            return "نحن نقبل الدفع عند الاستلام والدفع بواسطة البطاقة البنكية.";
        }

        if (text.includes("إلغاء") || text.includes("الغاء") || text.includes("ألغي") || text.includes("طلب")) {
            return "يمكنك إلغاء الطلب خلال ساعتين فقط من وقت تنفيذ الطلب. بعد مرور ساعتين لا يمكن إلغاء الطلب.";
        }

        if (text.includes("موقع") || text.includes("وين") || text.includes("أين") || text.includes("العنوان")) {
            return "يقع متجر WS Store في لبنان، البقاع، برالياس، الطريق العام.";
        }

        if (text.includes("هاتف") || text.includes("رقم") || text.includes("اتصال")) {
            return "يمكنك التواصل معنا على الرقم: +961 70 465 429.";
        }

        if (text.includes("ايميل") || text.includes("إيميل") || text.includes("دعم")) {
            return "يمكنك التواصل معنا عبر البريد الإلكتروني tradmohammad20@gmail.com أو من خلال نموذج Contact Us.";
        }

        if (text.includes("توصيل") || text.includes("شحن") || text.includes("الشحن")) {
            return "بعد تأكيد الطلب، يمكن للإدارة تحديث حالة الطلب إلى تم الشحن، وسيصلك بريد إلكتروني عند شحن الطلب أو تسليمه.";
        }

        if (text.includes("كرة القدم") || text.includes("فوتبول")) {
            return "لدينا أحذية كرة قدم، كرات قدم، وأطقم كرة قدم. يمكنك فتح قسم كرة القدم من صفحة التصنيفات.";
        }

        if (text.includes("اديداس") || text.includes("نايك") || text.includes("بوما")) {
            return "لدينا منتجات من Adidas و Nike و Puma. يمكنك تصفحها من صفحة المنتجات أو التصنيفات.";
        }

        if (text.includes("طلباتي") || text.includes("الطلبات")) {
            return "يمكنك متابعة طلباتك من صفحة Orders بعد تسجيل الدخول.";
        }

        if (text.includes("المفضلة")) {
            return "يمكنك إضافة المنتجات إلى المفضلة من خلال الضغط على رمز القلب الموجود على المنتج.";
        }

        if (text.includes("السلة") || text.includes("عربة")) {
            return "يمكنك إضافة المنتجات إلى السلة، اختيار الكمية والمقاس، ثم إتمام عملية الشراء.";
        }

        return "يمكنني مساعدتك في المنتجات، الطلبات، الدفع، الإلغاء، التوصيل، الموقع، والدعم. اسألني عن أي موضوع من هذه المواضيع.";
    }

    if (text.includes("payment") || text.includes("pay") || text.includes("card") || text.includes("cash")) {
        return "We accept Cash on Delivery and Bank Card payments.";
    }

    if (text.includes("cancel") || text.includes("cancellation")) {
        return "You can cancel your order within 2 hours after placing it. After 2 hours, cancellation will no longer be available.";
    }

    if (text.includes("location") || text.includes("where") || text.includes("address")) {
        return "WS Store is located in Lebanon, Bekaa-Barleis, Main Road.";
    }

    if (text.includes("phone") || text.includes("number") || text.includes("call")) {
        return "You can contact WS Store by phone at +961 70 465 429.";
    }

    if (text.includes("email") || text.includes("support")) {
        return "You can contact support by email at tradmohammad20@gmail.com or by using the Contact Us form.";
    }

    if (text.includes("delivery") || text.includes("shipping") || text.includes("ship")) {
        return "After your order is confirmed, the admin can update it to shipped. You will receive an email when your order is shipped or delivered.";
    }

    if (text.includes("football")) {
        return "We have football shoes, football balls, and football kits. You can open the Football category from the Categories page.";
    }

    if (text.includes("adidas") || text.includes("nike") || text.includes("puma")) {
        return "We have products from Adidas, Nike, and Puma. You can browse them from the Products or Categories page.";
    }

    if (text.includes("order") || text.includes("orders")) {
        return "You can check your orders from the Orders page after logging in.";
    }

    if (text.includes("wishlist")) {
        return "You can add products to your wishlist by pressing the heart icon on products.";
    }

    if (text.includes("cart")) {
        return "You can add products to your cart, choose quantity and size, then complete checkout.";
    }

    return "I can help you with products, orders, payment, cancellation, delivery, location, and support. Please ask me about one of these topics.";
}
window.speechSynthesis.onvoiceschanged = function () {
    window.speechSynthesis.getVoices();
};
function hideAdminWelcome() {
    const welcomeSection = document.getElementById("adminWelcomeSection");
    if (welcomeSection) {
        welcomeSection.style.display = "none";
    }
}
async function loadFeaturedProductsSlider() {
    const track = document.getElementById("featuredProductsTrack");
    if (!track) return;

    const products = await getAvailableProducts();

    track.innerHTML = "";

    products.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <button class="wishlist-btn" data-product-id="${product.id}" onclick="toggleWishlist(event, ${product.id})">♡</button>

            <a href="product-details.html?id=${product.id}" class="product-link">
                <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='images/no-image.png';">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
            </a>

            <button class="cart-btn" onclick="goToProductDetails(${product.id})">
                Add to Cart
            </button>
        `;

        track.appendChild(card);
    });

    await markWishlistButtons();
}
async function loadAdminStockPage() {
    const categoryFilter = document.getElementById("stockCategoryFilter");
const kitFilter = document.getElementById("stockKitFilter");
const quantityFilter = document.getElementById("stockQuantityFilter");
const searchInput = document.getElementById("stockSearchInput");

if (categoryFilter) categoryFilter.value = "";
if (kitFilter) kitFilter.value = "";
if (quantityFilter) quantityFilter.value = "";
if (searchInput) searchInput.value = "";
    const container = document.getElementById("adminStockContainer");
    if (!container) return;

    try {
        const response = await fetch("http://localhost:5000/api/admin/stock-by-size");
        const data = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p>Failed to load stock.</p>";
            return;
        }

        container.innerHTML = `
            <table class="admin-stock-table">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Product Name</th>
                        <th>Kit Type</th>
                        <th>Brand</th>
                        <th>Category</th>
                        <th>Size</th>
                        <th>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>
                                <img src="${getStockProductImage(item)}" 
                                  class="admin-stock-img"
                                   onerror="this.src='images/no-image.png'">
                            </td>

                            <td>${item.name}</td>

                            <td>
                                ${item.kit_variant
                                    ? item.kit_variant.charAt(0).toUpperCase() + item.kit_variant.slice(1)
                                    : "-"}
                            </td>

                            <td>${item.brand}</td>

                            <td>${item.category_name}</td>

                            <td>${item.size}</td>

                            <td>${item.quantity}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

    } catch (error) {
        console.error("LOAD ADMIN STOCK ERROR:", error);
        container.innerHTML = "<p>Server error while loading stock.</p>";
    }
}
function getStockProductImage(item) {
    const variants = getKitVariantsForProduct(item);

    if (item.kit_variant && variants[item.kit_variant]) {
        return variants[item.kit_variant];
    }

    return item.image || "images/no-image.png";
}
function filterAdminStockTable() {
    const searchInput = document.getElementById("stockSearchInput");
    const categoryFilter = document.getElementById("stockCategoryFilter");
    const kitFilter = document.getElementById("stockKitFilter");
    const quantityFilter = document.getElementById("stockQuantityFilter");

    const search = searchInput ? searchInput.value.toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value.toLowerCase() : "";
    const kit = kitFilter ? kitFilter.value.toLowerCase() : "";
    const quantityType = quantityFilter ? quantityFilter.value : "";

    const rows = document.querySelectorAll(".admin-stock-table tbody tr");

    rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();

        const rowKit = row.children[2].textContent.trim().toLowerCase();
        const rowCategory = row.children[4].textContent.trim().toLowerCase();
        const rowQuantity = Number(row.children[6].textContent.trim());

        let show = true;

        if (search && !rowText.includes(search)) {
            show = false;
        }

        if (category && rowCategory !== category) {
            show = false;
        }

        if (kit && rowKit !== kit) {
            show = false;
        }

        if (quantityType === "low" && rowQuantity > 5) {
            show = false;
        }

        row.style.display = show ? "" : "none";
    });
}
async function loadAdminChatbotMessages() {
    const container = document.getElementById("adminChatbotMessages");

    if (!container) return;

    try {
        const response = await fetch("http://localhost:5000/api/admin/chatbot-messages");
        const messages = await response.json();

        if (!response.ok) {
            container.innerHTML = "<p class='admin-error-message'>Failed to load chatbot messages.</p>";
            return;
        }

        if (!messages.length) {
            container.innerHTML = `
                <div class="no-chatbot-messages">
                    No chatbot messages found.
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="admin-chatbot-table-wrapper">
                <table class="admin-chatbot-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Customer Name</th>
                            <th>Customer Question</th>
                            <th>Bot Reply</th>
                            <th>Language</th>
                            <th>Date & Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${messages.map((msg, index) => `
                            <tr>
                                <td>${index + 1}</td>

                                <td>
                                    ${msg.user_name || "Guest User"}
                                </td>

                                <td class="chatbot-question-cell">
                                    ${msg.user_message}
                                </td>

                                <td class="chatbot-reply-cell">
                                    ${msg.bot_reply}
                                </td>

                                <td>
                                    <span class="chatbot-language-badge">
                                        ${msg.language || "english"}
                                    </span>
                                </td>

                                <td>
                                    ${new Date(msg.created_at).toLocaleString()}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        console.error("CHATBOT ADMIN ERROR:", error);

        container.innerHTML = `
            <p class="admin-error-message">
                Server error while loading chatbot messages.
            </p>
        `;
    }
}
function exportOrders() {
    window.location.href = "http://localhost:5000/api/admin/export-orders";
}