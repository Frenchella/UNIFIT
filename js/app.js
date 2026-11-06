function getUniFitUsers() {
    let users = [];
    try {
        const saved = JSON.parse(localStorage.getItem("unifitUsers") || "[]");
        if (Array.isArray(saved)) users = saved;
    } catch (error) { /* Recover from old or invalid browser data. */ }
    try {
        const legacy = JSON.parse(localStorage.getItem("unifitUser") || "null");
        if (legacy && legacy.email && !users.some(user => String(user.email || "").trim().toLowerCase() === String(legacy.email).trim().toLowerCase())) {
            users.push(legacy);
        }
    } catch (error) { /* Ignore invalid legacy account data. */ }
    return users;
}

/* =========================================================
   FABRIC & COLOR SELECTION
========================================================= */

const chooseFabricBtn =
    document.getElementById("chooseFabricBtn");

const openFabricImage =
    document.getElementById("openFabricImage");

const fabricModal =
    document.getElementById("fabricModal");

const closeFabricModal =
    document.getElementById("closeFabricModal");

const fabricModalOverlay =
    document.getElementById("fabricModalOverlay");

const fabricChoices =
    document.querySelectorAll(".fabric-choice");

const selectedFabricName =
    document.getElementById("selectedFabricName");

const confirmFabricBtn =
    document.getElementById("confirmFabricBtn");

const fabricSelectionText =
    document.getElementById("fabricSelectionText");


let selectedFabric = "";
let selectedDescription = "";


/* =========================================================
   OPEN MODAL
========================================================= */

function openFabricModalWindow() {

    if (!fabricModal) {
        return;
    }

    fabricModal.classList.add("show");

    fabricModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";
}


if (chooseFabricBtn) {

    chooseFabricBtn.addEventListener(
        "click",
        openFabricModalWindow
    );

}


if (openFabricImage) {

    openFabricImage.addEventListener(
        "click",
        openFabricModalWindow
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeFabricModalWindow() {

    if (!fabricModal) {
        return;
    }

    fabricModal.classList.remove("show");

    fabricModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";
}


if (closeFabricModal) {

    closeFabricModal.addEventListener(
        "click",
        closeFabricModalWindow
    );

}


if (fabricModalOverlay) {

    fabricModalOverlay.addEventListener(
        "click",
        closeFabricModalWindow
    );

}


/* CLOSE USING ESC KEY */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            fabricModal &&
            fabricModal.classList.contains("show")
        ) {

            closeFabricModalWindow();

        }

    }
);


/* =========================================================
   SELECT FABRIC
========================================================= */

fabricChoices.forEach(
    function (choice) {

        choice.addEventListener(
            "click",
            function () {


                /* REMOVE OLD SELECTION */

                fabricChoices.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                /* SELECT CURRENT FABRIC */

                choice.classList.add(
                    "selected"
                );


                selectedFabric =
                    choice.dataset.fabric;

                selectedDescription =
                    choice.dataset.description;


                /* UPDATE DISPLAY */

                if (selectedFabricName) {

                    selectedFabricName.textContent =
                        selectedFabric +
                        " — " +
                        selectedDescription;

                }


                /* ENABLE CONFIRM BUTTON */

                if (confirmFabricBtn) {

                    confirmFabricBtn.disabled = false;

                }

            }
        );

    }
);


/* =========================================================
   CONFIRM SELECTION
========================================================= */

if (confirmFabricBtn) {

    confirmFabricBtn.addEventListener(
        "click",
        function () {


            if (!selectedFabric) {
                return;
            }


            /* UPDATE PRODUCT CARD */

            if (fabricSelectionText) {

                fabricSelectionText.textContent =
                    "Selected: " +
                    selectedFabric +
                    " — " +
                    selectedDescription;

            }


            /* CHANGE BUTTON TEXT */

            if (chooseFabricBtn) {

                chooseFabricBtn.textContent =
                    "Change Fabric Color";

            }


            closeFabricModalWindow();

        }
    );

}





/* =========================================================
   UNIFIT DYNAMIC SHOPPING CART
========================================================= */

(function () {

    const cartItemsContainer =
        document.getElementById("cartItemsContainer");


    /*
        Run only on cart.html
    */

    if (!cartItemsContainer) {
        return;
    }


    const subtotalElement =
        document.getElementById("cartSubtotal");

    const discountElement =
        document.getElementById("cartDiscount");

    const totalElement =
        document.getElementById("cartTotal");

    const itemTextElement =
        document.getElementById("cartItemText");

    const emptyMessage =
        document.getElementById("cartEmptyMessage");

    const checkoutButtonElement =
        document.getElementById("checkoutButton");

    const couponInput =
        document.getElementById("couponCode");

    const couponButton =
        document.getElementById("applyCoupon");

    const couponMessageElement =
        document.getElementById("couponMessage");


    let cartPageCouponPercent = localStorage.getItem("unifitCouponCode") === "STUDENT10" ? 10 : 0;
    if (couponInput && cartPageCouponPercent) couponInput.value = "STUDENT10";



    /* =====================================================
       GET CART
    ====================================================== */

    function getUniFitCart() {

        try {

            const savedCart =
                JSON.parse(
                    localStorage.getItem(
                        "unifitCart"
                    )
                );


            return Array.isArray(savedCart)
                ? savedCart
                : [];

        }

        catch (error) {

            return [];

        }

    }



    /* =====================================================
       SAVE CART
    ====================================================== */

    function saveUniFitCart(cart) {

        localStorage.setItem(
            "unifitCart",
            JSON.stringify(cart)
        );


        if (
            typeof updateUniFitCartCount ===
            "function"
        ) {

            updateUniFitCartCount();

        }

    }



    /* =====================================================
       SAFE NUMBER
    ====================================================== */

    function cartNumber(value) {

        const cleaned =
            String(value ?? "")
                .replace(
                    /[^\d.-]/g,
                    ""
                );


        const number =
            Number(cleaned);


        return Number.isFinite(number)
            ? number
            : 0;

    }



    /* =====================================================
       FORMAT PESO
    ====================================================== */

    function formatCartPeso(value) {

        const amount =
            cartNumber(value);


        return (
            "₱" +
            amount.toLocaleString(
                "en-PH",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }



    /* =====================================================
       CART TOTALS
    ====================================================== */

    function updateCartSummary() {

        const cart =
            getUniFitCart();


        let subtotal = 0;
        let totalQuantity = 0;


        cart.forEach(
            function (item) {

                const price =
                    cartNumber(
                        item.price
                    );


                const quantity =
                    Math.max(
                        1,
                        parseInt(
                            item.quantity,
                            10
                        ) || 1
                    );


                subtotal +=
                    price * quantity;


                totalQuantity +=
                    quantity;

            }
        );


        const discount =
            subtotal *
            (
                cartPageCouponPercent /
                100
            );


        const total =
            subtotal -
            discount;



        /* SUBTOTAL */

        if (subtotalElement) {

            subtotalElement.textContent =
                formatCartPeso(
                    subtotal
                );

        }



        /* DISCOUNT */

        if (discountElement) {

            if (discount > 0) {

                discountElement.textContent =
                    "- " +
                    formatCartPeso(
                        discount
                    );

            }

            else {

                discountElement.textContent =
                    formatCartPeso(0);

            }

        }



        /* TOTAL */

        if (totalElement) {

            totalElement.textContent =
                formatCartPeso(
                    total
                );

        }



        /* ITEM COUNT */

        if (itemTextElement) {

            itemTextElement.textContent =
                totalQuantity === 1
                    ? "1 Item"
                    : totalQuantity +
                      " Items";

        }



        /* GLOBAL CART COUNT */

        if (
            typeof updateUniFitCartCount ===
            "function"
        ) {

            updateUniFitCartCount();

        }



        /* EMPTY CART */

        if (cart.length === 0) {

            if (emptyMessage) {

                emptyMessage.classList.add(
                    "show"
                );

            }


            if (checkoutButtonElement) {

                checkoutButtonElement
                    .classList.add(
                        "disabled"
                    );

            }

        }

        else {

            if (emptyMessage) {

                emptyMessage.classList.remove(
                    "show"
                );

            }


            if (checkoutButtonElement) {

                checkoutButtonElement
                    .classList.remove(
                        "disabled"
                    );

            }

        }

    }



    /* =====================================================
       CREATE CART ITEM
    ====================================================== */

    function createCartItem(
        item,
        index
    ) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "cart-product-row";


        const price =
            cartNumber(
                item.price
            );


        const quantity =
            Math.max(
                1,
                parseInt(
                    item.quantity,
                    10
                ) || 1
            );


        let fabricHTML = "";


        if (item.fabric) {

            fabricHTML = `

                <span>

                    Fabric:

                    <strong>
                        ${item.fabric}
                    </strong>

                </span>

            `;

        }


        article.innerHTML = `

            <div class="cart-thumb">

                <img
                    src="${item.image}"
                    alt="${item.name}">

            </div>


            <div class="cart-product-details">

                <p class="cart-product-category">
                    ${item.category}
                </p>


                <h3>
                    ${item.name}
                </h3>


                <div class="cart-meta">

                    <span>

                        Size:

                        <strong>
                            ${item.size}
                        </strong>

                    </span>

                    ${fabricHTML}

                </div>


                <p class="cart-unit-price">

                    ${formatCartPeso(price)}

                </p>

            </div>


            <div class="cart-item-actions">

                <div class="cart-quantity">

                    <button
                        type="button"
                        class="quantity-minus">

                        −

                    </button>


                    <span class="quantity-value">

                        ${quantity}

                    </span>


                    <button
                        type="button"
                        class="quantity-plus">

                        +

                    </button>

                </div>


                <p class="cart-line-total">

                    ${formatCartPeso(
                        price *
                        quantity
                    )}

                </p>


                <button
                    type="button"
                    class="cart-remove">

                    Remove

                </button>

            </div>

        `;



        /* PLUS */

        const plusButton =
            article.querySelector(
                ".quantity-plus"
            );


        plusButton.addEventListener(
            "click",
            function () {

                const cart =
                    getUniFitCart();


                if (!cart[index]) {
                    return;
                }


                cart[index].quantity =
                    Math.max(
                        1,
                        parseInt(
                            cart[index].quantity,
                            10
                        ) || 1
                    ) + 1;


                saveUniFitCart(cart);

                renderCart();

            }
        );



        /* MINUS */

        const minusButton =
            article.querySelector(
                ".quantity-minus"
            );


        minusButton.addEventListener(
            "click",
            function () {

                const cart =
                    getUniFitCart();


                if (!cart[index]) {
                    return;
                }


                const currentQuantity =
                    Math.max(
                        1,
                        parseInt(
                            cart[index].quantity,
                            10
                        ) || 1
                    );


                if (
                    currentQuantity >
                    1
                ) {

                    cart[index].quantity =
                        currentQuantity -
                        1;


                    saveUniFitCart(cart);

                    renderCart();

                }

            }
        );



        /* REMOVE */

        const removeButton =
            article.querySelector(
                ".cart-remove"
            );


        removeButton.addEventListener(
            "click",
            function () {

                const cart =
                    getUniFitCart();


                cart.splice(
                    index,
                    1
                );


                saveUniFitCart(cart);

                renderCart();

            }
        );


        return article;

    }



    /* =====================================================
       RENDER CART
    ====================================================== */

    function renderCart() {

        const cart =
            getUniFitCart();


        cartItemsContainer.innerHTML =
            "";


        cart.forEach(
            function (
                item,
                index
            ) {

                cartItemsContainer.appendChild(
                    createCartItem(
                        item,
                        index
                    )
                );

            }
        );


        updateCartSummary();

    }



    /* =====================================================
       COUPON
    ====================================================== */

    if (couponButton) {

        couponButton.addEventListener(
            "click",
            function () {

                const code =
                    couponInput
                        .value
                        .trim()
                        .toUpperCase();


                localStorage.removeItem('unifitCouponPercent');
                localStorage.removeItem('unifitCouponCode');

                couponMessageElement
                    .classList.remove(
                        "success",
                        "error"
                    );


                if (
                    code ===
                    "STUDENT10"
                ) {

                    cartPageCouponPercent =
                        10;
                    localStorage.setItem('unifitCouponPercent', '10');
                    localStorage.setItem('unifitCouponCode', code);
                        


                    couponMessageElement
                        .textContent =
                        "Student discount applied: 10% off.";


                    couponMessageElement
                        .classList.add(
                            "success"
                        );

                }

                else if (
                    code === ""
                ) {

                    cartPageCouponPercent =
                        0;


                    couponMessageElement
                        .textContent =
                        "Please enter a coupon code.";


                    couponMessageElement
                        .classList.add(
                            "error"
                        );

                }

                else {

                    cartPageCouponPercent =
                        0;


                    couponMessageElement
                        .textContent =
                        "Invalid coupon code.";


                    couponMessageElement
                        .classList.add(
                            "error"
                        );

                }


                updateCartSummary();

            }
        );

    }



    /* =====================================================
       START
    ====================================================== */

    renderCart();

})();

/* =========================================================
   SHOW / HIDE PASSWORD
========================================================= */

const passwordToggleButtons =
    document.querySelectorAll(
        ".password-toggle"
    );


passwordToggleButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    button.dataset.target;


                const passwordInput =
                    document.getElementById(
                        targetId
                    );


                if (!passwordInput) {
                    return;
                }


                if (
                    passwordInput.type ===
                    "password"
                ) {

                    passwordInput.type =
                        "text";

                    button.textContent =
                        "Hide";

                }

                else {

                    passwordInput.type =
                        "password";

                    button.textContent =
                        "Show";

                }

            }
        );

    }
);

/* =========================================================
   UNIFIT REGISTER AND LOGIN
   Front-End Demo using Local Storage
========================================================= */

(function () {

    /* =====================================================
       REGISTER
    ====================================================== */

    const unifitRegisterForm =
        document.getElementById("registerForm");


    if (unifitRegisterForm) {

        unifitRegisterForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const firstName =
                    document
                        .getElementById("firstName")
                        .value
                        .trim();


                const lastName =
                    document
                        .getElementById("lastName")
                        .value
                        .trim();

                        const studentNumber =
                        document
                        .getElementById("studentNumber")
                         .value
                         .trim();


                        const contactNumber =
                          document
                         .getElementById("contactNumber")
                         .value
                         .trim();

                        const email =
                         document
                        .getElementById("registerEmail")
                        .value
                        .trim()
                        .toLowerCase();


                        const password =
                        document
                        .getElementById("registerPassword")
                        .value;


                        const confirmPassword =
                         document
                        .getElementById("confirmPassword")
                        .value;


                /* CHECK EMPTY FIELDS */

                if (
                 firstName === "" ||
                 lastName === "" ||
                 studentNumber === "" ||
                 contactNumber === "" ||
                 email === "" ||
                 password === "" ||
                 confirmPassword === ""
                ) {

                 alert(
                  "Please complete all required fields."
                );

                 return;
                 }


                /* CHECK PASSWORD */

                if (password !== confirmPassword) {

                    alert(
                        "Passwords do not match. Please try again."
                    );

                    return;
                }


                /* PASSWORD LENGTH */

                if (password.length < 6) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;
                }


                // The server is the source of truth for duplicate accounts.

                /* CREATE USER */

                const newUser = {

    id: crypto.randomUUID(),

    firstName:
        firstName,

    lastName:
        lastName,

    studentNumber:
        studentNumber,

    contactNumber:
        contactNumber,

    email:
        email,

    password:
        password

};


                try {
                    const response = await fetch('/api/student-register', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(newUser)
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.error || 'Could not create account.');
                    alert("Account created successfully! You can now login.");
                    window.location.href = "login.html";
                } catch (error) {
                    alert(`Could not create account: ${error.message}. Open UniFit through http://localhost:8000 and try again.`);
                }
                return;



            }
        );

    }



    /* =====================================================
       LOGIN
    ====================================================== */

    const unifitLoginForm =
        document.getElementById("loginForm");


    if (unifitLoginForm) {

        unifitLoginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    document
                        .getElementById("loginEmail")
                        .value
                        .trim()
                        .toLowerCase();


                const password =
                    document
                        .getElementById("loginPassword")
                        .value;


                /* CHECK EMPTY */

                if (
                    email === "" ||
                    password === ""
                ) {

                    alert(
                        "Please enter your email and password."
                    );

                    return;
                }


                let user;
                try {
                    let response = await fetch('/api/student-login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({email, password})
                    });
                    let result = await response.json();

                    if (!response.ok && [401, 404].includes(response.status)) {
                        const legacy = getUniFitUsers().find(account =>
                            String(account.email || '').trim().toLowerCase() === email && account.password === password
                        );
                        if (legacy) {
                            const migration = await fetch('/api/student-register', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify(legacy)
                            });
                            if (migration.ok || migration.status === 409) {
                                response = await fetch('/api/student-login', {
                                    method: 'POST',
                                    headers: {'Content-Type': 'application/json'},
                                    body: JSON.stringify({email, password})
                                });
                                result = await response.json();
                            }
                        }
                    }

                    if (!response.ok) throw new Error(result.error || 'Incorrect email or password.');
                    user = result.user;
                    localStorage.setItem('unifitUser', JSON.stringify(user));
                } catch (error) {
                    alert(`Login failed: ${error.message}. Make sure UniFit is open at http://localhost:8000.`);
                    return;
                }


                /* CHECK LOGIN */

                if (user && user.id) {
                    sessionStorage.setItem('unifitStudentSession', JSON.stringify({id: user.id, email: user.email}));

                    /* SAVE LOGIN SESSION */

                    localStorage.setItem(
                        "unifitLoggedIn",
                        "true"
                    );


                    localStorage.setItem(
    "unifitCurrentUser",
    JSON.stringify({

        firstName:
            user.firstName,

        lastName:
            user.lastName,

        studentNumber:
            user.studentNumber,

        contactNumber:
            user.contactNumber,

        email:
            user.email

    })
);


                    alert(
                        "Welcome back, " +
                        user.firstName +
                        "!"
                    );


                    /* REDIRECT HOME */

                    window.location.href =
                        "index.html";

                }

                else {

                    alert(
                        "Incorrect email or password."
                    );

                }

            }
        );

    }

})();

/* =========================================================
   MY ORDERS FILTER
========================================================= */

const orderFilterButtons =
    document.querySelectorAll(".order-filter");

const orderCards =
    document.querySelectorAll(".order-card");

const ordersEmpty =
    document.getElementById("ordersEmpty");


orderFilterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const selectedFilter =
                    button.dataset.filter;


                /* ACTIVE BUTTON */

                orderFilterButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                let visibleOrders = 0;


                /* FILTER ORDERS */

                orderCards.forEach(
                    function (order) {

                        const status =
                            order.dataset.status;


                        if (
                            selectedFilter === "all" ||
                            status === selectedFilter
                        ) {

                            order.style.display =
                                "block";

                            visibleOrders++;

                        }

                        else {

                            order.style.display =
                                "none";

                        }

                    }
                );


                /* EMPTY MESSAGE */

                if (ordersEmpty) {

                    if (visibleOrders === 0) {

                        ordersEmpty.classList.add(
                            "show"
                        );

                    }

                    else {

                        ordersEmpty.classList.remove(
                            "show"
                        );

                    }

                }

            }
        );

    }
);

/* =========================================================
   GLOBAL CART COUNT
========================================================= */

function updateUniFitCartCount() {

    const cart =
        JSON.parse(
            localStorage.getItem(
                "unifitCart"
            )
        ) || [];


    let totalQuantity = 0;


    cart.forEach(
        function (item) {

            totalQuantity +=
                item.quantity;

        }
    );


    const cartCountElements =
        document.querySelectorAll(
            ".cart-count"
        );


    cartCountElements.forEach(
        function (element) {

            element.textContent =
                totalQuantity;

        }
    );

}


/* LOAD COUNT ON EVERY PAGE */

updateUniFitCartCount();

/* =========================================================
   PRODUCT DETAILS
========================================================= */

(function () {

    const productImage =
        document.getElementById("detailProductImage");

    /*
       Stop if we are not on product-details.html
    */

    if (!productImage) {
        return;
    }


    /* =====================================================
       PRODUCTS DATABASE - FRONT END DEMO
    ====================================================== */

    const products = {

        "mens-top": {

            name:
                "Men's School Uniform Top",

            category:
                "School Uniform",

            price:
                450,

            image:
                "assets/images/mens-pink-brown-uniform-top.png",

            description:
                "A comfortable school uniform top designed for everyday class use.",

            sizes:
                ["S", "M", "L", "XL"],

            fabric:
                true,

            fabricName:
                "Pink",

            fabricDescription:
                "Men's Uniform Top Fabric",

            fabricImage:
                "assets/images/fabric-pink.png"

        },


        "mens-pants": {

            name:
                "Men's School Uniform Pants",

            category:
                "School Uniform",

            price:
                500,

            image:
                "assets/images/mens-dark-brown-straight-slacks.png",

            description:
                "Dark brown school uniform pants designed for a comfortable and proper school fit.",

            sizes:
                ["S", "M", "L", "XL"],

            fabric:
                true,

            fabricName:
                "Black",

            fabricDescription:
                "Men's Slacks Fabric",

            fabricImage:
                "assets/images/fabric-black.png"

        },


        "pe-top": {

            name:
                "PE Uniform Top",

            category:
                "PE Uniform",

            price:
                350,

            image:
                "assets/images/pe-top-yellow-white.png",

            description:
                "Lightweight PE uniform top suitable for physical education classes and school activities.",

            sizes:
                ["S", "M", "L", "XL"],

            fabric:
                false

        },


        "pe-pants": {

            name:
                "PE Jogger Pants",

            category:
                "PE Uniform",

            price:
                400,

            image:
                "assets/images/pe-jogger-pants-black-yellow.png",

            description:
                "Comfortable PE jogger pants designed for movement and physical activities.",

            sizes:
                ["S", "M", "L", "XL"],

            fabric:
                false

        },


        "id-lace": {

            name:
                "School ID Lace",

            category:
                "ID Essentials",

            price:
                100,

            image:
                "assets/images/escr-id-lace-red-holder.png",

            description:
                "Official-style school ID lace for carrying your student identification card.",

            sizes:
                ["One Size"],

            fabric:
                false

        },


        "patch": {

            name:
                "School Uniform Patch",

            category:
                "Accessories",

            price:
                50,

            image:
                "assets/images/escr-stacked-patches.png",

            description:
                "School uniform patch designed for placement on the approved school uniform.",

            sizes:
                ["Standard"],

            fabric:
                false

        },


        "belt": {

            name:
                "School Uniform Belt",

            category:
                "Accessories",

            price:
                150,

            image:
                "assets/images/dark-brown-white-buckle-belt.png",

            description:
                "Adjustable school uniform belt designed to complement the standard uniform.",

            sizes:
                ["Adjustable"],

            fabric:
                false

        },


        "ribbon": {

            name:
                "School Uniform Ribbon",

            category:
                "Accessories",

            price:
                80,

            image:
                "assets/images/flat-brown-cloth-ribbon.png",

            description:
                "School uniform ribbon designed to complete the required uniform look.",

            sizes:
                ["One Size"],

            fabric:
                false

        }

    };


    /* =====================================================
       GET PRODUCT FROM URL
    ====================================================== */

    const urlParameters =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        urlParameters.get("id") ||
        "mens-top";


    const product =
        products[productId] ||
        products["mens-top"];



    /* =====================================================
       ELEMENTS
    ====================================================== */

    const productName =
        document.getElementById(
            "detailProductName"
        );


    const productCategory =
        document.getElementById(
            "detailProductCategory"
        );


    const productPrice =
        document.getElementById(
            "detailProductPrice"
        );


    const productDescription =
        document.getElementById(
            "detailProductDescription"
        );


    const breadcrumbProduct =
        document.getElementById(
            "breadcrumbProduct"
        );


    const sizeOptions =
        document.getElementById(
            "productSizeOptions"
        );


    const selectedSizeText =
        document.getElementById(
            "selectedSizeText"
        );


    const fabricGroup =
        document.getElementById(
            "productFabricGroup"
        );


    const fabricImage =
        document.getElementById(
            "detailFabricImage"
        );


    const fabricName =
        document.getElementById(
            "detailFabricName"
        );


    const fabricDescription =
        document.getElementById(
            "detailFabricDescription"
        );


    const quantityElement =
        document.getElementById(
            "detailQuantity"
        );


    const minusButton =
        document.getElementById(
            "detailQuantityMinus"
        );


    const plusButton =
        document.getElementById(
            "detailQuantityPlus"
        );


    const addToCartButton =
        document.getElementById(
            "detailAddToCart"
        );


    const buyNowButton =
        document.getElementById(
            "detailBuyNow"
        );


    const addedMessage =
        document.getElementById(
            "productAddedMessage"
        );



    /* =====================================================
       LOAD PRODUCT
    ====================================================== */

    productImage.src =
        product.image;

    productImage.alt =
        product.name;


    productName.textContent =
        product.name;


    productCategory.textContent =
        product.category;


    productPrice.textContent =
        "₱" +
        product.price.toFixed(2);


    productDescription.textContent =
        product.description;


    breadcrumbProduct.textContent =
        product.name;


    document.title =
        product.name +
        " | UniFit";



    /* =====================================================
       FABRIC
    ====================================================== */

    if (product.fabric) {

        fabricGroup.style.display =
            "block";


        fabricImage.src =
            product.fabricImage;


        fabricName.textContent =
            product.fabricName;


        fabricDescription.textContent =
            product.fabricDescription;

    }

    else {

        fabricGroup.style.display =
            "none";

    }



    /* =====================================================
       SIZE OPTIONS
    ====================================================== */

    let selectedSize = "";


    sizeOptions.innerHTML = "";


    product.sizes.forEach(
        function (size) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "product-size-button";


            button.textContent =
                size;


            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".product-size-button"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    selectedSize =
                        size;


                    selectedSizeText.textContent =
                        "Selected size: " +
                        size;

                }
            );


            sizeOptions.appendChild(
                button
            );

        }
    );



    /* =====================================================
       QUANTITY
    ====================================================== */

    let quantity = 1;


    plusButton.addEventListener(
        "click",
        function () {

            quantity++;

            quantityElement.textContent =
                quantity;

        }
    );


    minusButton.addEventListener(
        "click",
        function () {

            if (quantity > 1) {

                quantity--;

                quantityElement.textContent =
                    quantity;

            }

        }
    );



    /* =====================================================
       ADD TO CART

     
    ====================================================== */

   addToCartButton.addEventListener(
    "click",
    function () {

        /* ---------------------------------------------
           REQUIRE SIZE
        --------------------------------------------- */

        if (!selectedSize) {

            alert(
                "Please select a size first."
            );

            return;
        }


        /* ---------------------------------------------
           GET EXISTING CART
        --------------------------------------------- */

        let cart =
            JSON.parse(
                localStorage.getItem(
                    "unifitCart"
                )
            ) || [];


        /* ---------------------------------------------
           CREATE CART ITEM
        --------------------------------------------- */

        const cartItem = {

            id:
                productId,

            name:
                product.name,

            category:
                product.category,

            price:
                product.price,

            image:
                product.image,

            size:
                selectedSize,

            quantity:
                quantity,

            fabric:
                product.fabric
                    ? product.fabricName
                    : ""

        };


        /* ---------------------------------------------
           CHECK IF SAME PRODUCT ALREADY EXISTS
        --------------------------------------------- */

        const existingItem =
            cart.find(
                function (item) {

                    return (
                        item.id === cartItem.id &&
                        item.size === cartItem.size &&
                        item.fabric === cartItem.fabric
                    );

                }
            );


        /* ---------------------------------------------
           ADD QUANTITY OR NEW ITEM
        --------------------------------------------- */

        if (existingItem) {

            existingItem.quantity +=
                cartItem.quantity;

        }

        else {

            cart.push(
                cartItem
            );

        }


        /* ---------------------------------------------
           SAVE CART
        --------------------------------------------- */

        localStorage.setItem(
            "unifitCart",
            JSON.stringify(cart)
        );


        /* ---------------------------------------------
           UPDATE CART COUNT
        --------------------------------------------- */

        updateUniFitCartCount();


        /* ---------------------------------------------
           SHOW MESSAGE
        --------------------------------------------- */

        addedMessage.textContent =
            product.name +
            " added to your cart.";


        addedMessage.classList.add(
            "show"
        );


        /* ---------------------------------------------
           GO TO CART
        --------------------------------------------- */

        setTimeout(
            function () {

                window.location.href =
                    "cart.html";

            },
            600
        );

    }
);

    /* =====================================================
       BUY NOW
    ====================================================== */

    buyNowButton.addEventListener('click', function () {
        if (!selectedSize) {
            alert('Please select a size first.');
            document.getElementById('sizeSelectionGroup')?.scrollIntoView({behavior: 'smooth'});
            return;
        }
        const cart = JSON.parse(localStorage.getItem('unifitCart') || '[]');
        const item = {
            id: productId,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            size: selectedSize,
            quantity: quantity,
            fabric: product.fabric ? product.fabricName : ''
        };
        const existing = cart.find(entry => entry.id === item.id && entry.size === item.size && entry.fabric === item.fabric);
        if (existing) {
            existing.quantity = Number(existing.quantity) + quantity;
        } else {
            cart.push(item);
        }
        localStorage.setItem('unifitCart', JSON.stringify(cart));
        window.location.href = 'checkout.html';
    });

})();

/* =========================================================
   UNIFIT CHECKOUT
========================================================= */

(function () {

    const checkoutForm =
        document.getElementById("checkoutForm");


    /*
        Only run on checkout.html
    */

    if (!checkoutForm) {
        return;
    }



    const checkoutProducts =
        document.getElementById("checkoutProducts");

    const checkoutSubtotal =
        document.getElementById("checkoutSubtotal");

    const checkoutDiscount =
        document.getElementById("checkoutDiscount");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    const checkoutSuccess =
        document.getElementById("checkoutSuccess");

    const checkoutOrderNumber =
        document.getElementById("checkoutOrderNumber");



    /* =====================================================
       GET CART
    ====================================================== */

    function getCheckoutCart() {

        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(
                        "unifitCart"
                    )
                );


            return Array.isArray(cart)
                ? cart
                : [];

        }

        catch (error) {

            return [];

        }

    }



    /* =====================================================
       FORMAT PESO
    ====================================================== */

    function checkoutPeso(value) {

        const number =
            Number(value) || 0;


        return (
            "₱" +
            number.toLocaleString(
                "en-PH",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            )
        );

    }



    /* =====================================================
       LOAD CUSTOMER
    ====================================================== */

    const currentUser =
        JSON.parse(
            localStorage.getItem(
                "unifitCurrentUser"
            ) || "null"
        );


    if (currentUser) {

        const nameInput =
            document.getElementById(
                "checkoutName"
            );

        const emailInput =
            document.getElementById(
                "checkoutEmail"
            );


        if (nameInput) {

            nameInput.value =
                (
                    currentUser.firstName +
                    " " +
                    currentUser.lastName
                ).trim();

        }


        if (emailInput) {

            emailInput.value =
                currentUser.email || "";

        }

    }



    /* =====================================================
       RENDER ORDER SUMMARY
    ====================================================== */

    function renderCheckout() {

        const cart =
            getCheckoutCart();


        checkoutProducts.innerHTML =
            "";


        let subtotal = 0;



        cart.forEach(
            function (item) {

                const price =
                    Number(item.price) || 0;


                const quantity =
                    Number(item.quantity) || 1;


                const lineTotal =
                    price * quantity;


                subtotal +=
                    lineTotal;



                const product =
                    document.createElement(
                        "div"
                    );


                product.className =
                    "checkout-product-item";


                let fabricText = "";


                if (item.fabric) {

                    fabricText =
                        " • " +
                        item.fabric;

                }


                product.innerHTML = `

                    <div class="checkout-product-image">

                        <img
                            src="${item.image}"
                            alt="${item.name}">

                    </div>


                    <div class="checkout-product-info">

                        <h4>
                            ${item.name}
                        </h4>

                        <p>
                            ${item.size}
                            ${fabricText}
                            • Qty ${quantity}
                        </p>

                    </div>


                    <strong class="checkout-product-price">

                        ${checkoutPeso(lineTotal)}

                    </strong>

                `;


                checkoutProducts.appendChild(
                    product
                );

            }
        );



        /* GET SAVED COUPON */

        const couponPercent =
            Number(
                localStorage.getItem(
                    "unifitCouponPercent"
                )
            ) || 0;


        const discount =
            subtotal *
            (
                couponPercent /
                100
            );


        const total =
            subtotal -
            discount;



        checkoutSubtotal.textContent =
            checkoutPeso(subtotal);


        checkoutDiscount.textContent =
            discount > 0
                ? "- " +
                  checkoutPeso(discount)
                : checkoutPeso(0);


        checkoutTotal.textContent =
            checkoutPeso(total);



        /*
            Don't allow checkout
            if cart is empty
        */

        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );


            window.location.href =
                "products.html";

        }

    }



    /* =====================================================
       PLACE ORDER
    ====================================================== */

    checkoutForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const cart =
                getCheckoutCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }



            const fullName =
                document
                    .getElementById(
                        "checkoutName"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "checkoutEmail"
                    )
                    .value
                    .trim();


            const gcashReference =
    document
        .getElementById(
            "gcashReference"
        )
        .value
        .trim();


const gcashReceipt =
    document
        .getElementById(
            "gcashReceipt"
        );


const gcashPaidConfirmation =
    document
        .getElementById(
            "gcashPaidConfirmation"
        );

/* =================================================
   VALIDATE GCASH PAYMENT
================================================= */

if (gcashReference === "") {

    alert(
        "Please enter your GCash reference number."
    );

    return;
}


if (
    !gcashReceipt.files ||
    gcashReceipt.files.length === 0
) {

    alert(
        "Please upload your GCash payment receipt."
    );

    return;
}


if (!gcashPaidConfirmation.checked) {

    alert(
        "Please confirm that you have completed the GCash payment."
    );

    return;
}

            /* =================================================
               CALCULATE ORDER
            ================================================= */

            let subtotal = 0;


            cart.forEach(
                function (item) {

                    subtotal +=
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 1);

                }
            );


            const couponPercent =
                Number(
                    localStorage.getItem(
                        "unifitCouponPercent"
                    )
                ) || 0;


            const discount =
                subtotal *
                (
                    couponPercent /
                    100
                );


            const total =
                subtotal -
                discount;



            /* =================================================
               GENERATE ORDER NUMBER
            ================================================= */

            const year =
                new Date()
                    .getFullYear();


            const uniqueNumber =
                Date.now()
                    .toString()
                    .slice(-6);


            const orderNumber =
                "UF-" +
                year +
                "-" +
                uniqueNumber;



            /* =================================================
               ORDER OBJECT
            ================================================= */

            const newOrder = {

                orderNumber:
                    orderNumber,

                orderDate:
                    new Date()
                        .toISOString(),

                customer: {

                    fullName:
                        fullName,

                    email:
                        email,

                    phone:
                        phone

                },

                fulfillment:
                    "School Pickup",

                payment:
                  "GCash",

                  paymentReference:
                  gcashReference,

                  paymentStatus:
                    "For Verification",

                notes:
                    notes,

                items:
                    cart,

                subtotal:
                    subtotal,

                discount:
                    discount,

                couponCode:
                    couponPercent === 10 ? 'STUDENT10' : '',

                total:
                    total,

                status:
                    "Payment Verification"

            };



            /* =================================================
               SAVE ORDER
            ================================================= */

            const previousOrders =
                JSON.parse(
                    localStorage.getItem(
                        "unifitOrders"
                    )
                ) || [];


            previousOrders.unshift(
                newOrder
            );


            localStorage.setItem(
                "unifitOrders",
                JSON.stringify(
                    previousOrders
                )
            );



            /* =================================================
               CLEAR CART
            ================================================= */

            localStorage.removeItem(
                "unifitCart"
            );


            localStorage.removeItem(
                "unifitCouponPercent"
            );
            localStorage.removeItem('unifitCouponCode');


            if (
                typeof updateUniFitCartCount ===
                "function"
            ) {

                updateUniFitCartCount();

            }



            /* =================================================
               SUCCESS SCREEN
            ================================================= */

            document
                .querySelector(
                    ".unifit-checkout-layout"
                )
                .style.display =
                    "none";


            checkoutOrderNumber.textContent =
                orderNumber;


            checkoutSuccess.classList.add(
                "show"
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );



    /* =====================================================
       INITIAL
    ====================================================== */

    renderCheckout();

})();

/* Student navigation: show Log out while the student is signed in. */
(() => {
    let session;
    try { session = JSON.parse(sessionStorage.getItem('unifitStudentSession') || 'null'); } catch (error) { session = null; }
    if (!session?.email) return;
function askUniFitLogout() {
    return new Promise(resolve => {
        const dialog = document.createElement('dialog');
        dialog.innerHTML = '<form method="dialog"><p>Do you want to log out?</p><div><button value="no">No</button><button value="yes">Yes</button></div></form>';
        dialog.style.cssText = 'position:fixed;inset:0;margin:auto;border:0;border-radius:12px;padding:24px;width:min(360px,calc(100vw - 32px));box-shadow:0 18px 60px rgba(0,0,0,.32);color:#3e2723;background:#fffdf8;';
        const form = dialog.querySelector('form');
        form.style.cssText = 'display:grid;gap:20px;margin:0;text-align:center;font:600 16px system-ui,sans-serif;';
        const buttons = dialog.querySelector('div');
        buttons.style.cssText = 'display:flex;justify-content:center;gap:12px;';
        dialog.querySelectorAll('button').forEach(button => {
            button.style.cssText = 'min-width:88px;padding:9px 16px;border:1px solid #b8956f;border-radius:6px;cursor:pointer;font:600 14px system-ui,sans-serif;';
        });
        dialog.addEventListener('close', () => {
            resolve(dialog.returnValue === 'yes');
            dialog.remove();
        }, {once: true});
        document.body.append(dialog);
        dialog.showModal();
    });
}

async function finishUniFitLogout() {
    try { await fetch('/api/student-logout', {method: 'POST'}); } catch (error) { /* Clear the local UI session even if offline. */ }
    sessionStorage.removeItem('unifitStudentSession');
    localStorage.removeItem('unifitLoggedIn');
    localStorage.removeItem('unifitCurrentUser');
    window.location.href = 'welcome.html';
}

    document.querySelectorAll('a[href="login.html"]').forEach(link => {
        link.textContent = 'Log out';
        link.href = '#logout';
        link.addEventListener('click', async event => {
            event.preventDefault();
            if (await askUniFitLogout()) await finishUniFitLogout();
        });
    });
})();
