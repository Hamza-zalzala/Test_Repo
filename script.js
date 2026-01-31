// script.js
const tg = window.Telegram.WebApp;
tg.ready();
tg.MainButton.text = "إرسال الطلب";
tg.MainButton.color = "#4CAF50";
tg.MainButton.show();

let cart = [];          // [{name, price, quantity}, ...]
let total = 0;

const menuContainer = document.getElementById("menu");
const cartList = document.getElementById("cart");
const totalSpan = document.getElementById("total");
const notesTextarea = document.getElementById("notes");

// ────────────────────────────────────────────────
// دالة لإنشاء عنصر في القائمة
function createMenuItem(item) {
    const div = document.createElement("div");
    div.className = "item";

    const namePrice = document.createElement("span");
    namePrice.textContent = `${item.name} - ${item.price} ليرة`;

    const btn = document.createElement("button");
    btn.textContent = "إضافة";
    btn.addEventListener("click", () => addToCart(item.name, item.price));

    div.appendChild(namePrice);
    div.appendChild(btn);
    return div;
}

// دالة لعرض قسم كامل
function renderSection(title, items) {
    if (!items || items.length === 0) return;

    const h2 = document.createElement("h2");
    h2.textContent = title;
    menuContainer.appendChild(h2);

    items.forEach(item => {
        menuContainer.appendChild(createMenuItem(item));
    });
}

fetch("menu.json")
    .then(res => res.json())
    .then(data => {
        renderSection("المناقيش والمعجنات", data.manakish_and_pastries);

        if (data.pizza_cheese_and_vegetarian?.sizes) {
            const items = data.pizza_cheese_and_vegetarian.sizes.map(s => ({
                name: `${data.pizza_cheese_and_vegetarian.description} - ${s.size}`,
                price: s.price
            }));
            renderSection("بيتزا الجبن والخضار", items);
        }

        if (data.pizza_meat?.sizes) {
            const items = data.pizza_meat.sizes.map(s => ({
                name: `${data.pizza_meat.description} - ${s.size}`,
                price: s.price
            }));
            renderSection("بيتزا اللحوم", items);
        }

        renderSection("المعجنات المزدوجة (دبل)", data.double_pastries);
        renderSection("ساندويتش فلافل", data.falafel_sandwiches);
        renderSection("ساندويتشات", data.sandwiches);
        renderSection("ساندويتش بطاطس", data.potato_sandwiches);
        renderSection("المشروبات", data.drinks);
    })
    .catch(err => {
        console.error("خطأ في تحميل القائمة:", err);
        menuContainer.innerHTML += "<p style='color:red'>تعذر تحميل القائمة</p>";
    });

// ────────────────────────────────────────────────
// إضافة صنف (أو زيادة الكمية إذا موجود)
function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ name, price: Number(price), quantity: 1 });
    }

    recalculateTotal();
    renderCart();
}

// تقليل الكمية أو حذف إذا وصلت 0
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
    } else {
        cart.splice(index, 1);
    }
    recalculateTotal();
    renderCart();
}

// حذف مباشر
function removeItem(index) {
    cart.splice(index, 1);
    recalculateTotal();
    renderCart();
}

function recalculateTotal() {
    total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function renderCart() {
    cartList.innerHTML = "";

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.padding = "8px";
        li.style.background = "#f0f0f0";
        li.style.margin = "6px 0";
        li.style.borderRadius = "6px";

        const left = document.createElement("div");
        left.innerHTML = `
            <strong>${item.name}</strong><br>
            ${item.price} × ${item.quantity} = ${item.price * item.quantity} ليرة
        `;

        const controls = document.createElement("div");
        controls.style.display = "flex";
        controls.style.gap = "8px";

        const minusBtn = document.createElement("button");
        minusBtn.textContent = "−";
        minusBtn.style.background = "#ff9800";
        minusBtn.style.color = "white";
        minusBtn.style.minWidth = "32px";
        minusBtn.addEventListener("click", () => decreaseQuantity(index));

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.style.background = "#f44336";
        removeBtn.style.color = "white";
        removeBtn.style.minWidth = "32px";
        removeBtn.addEventListener("click", () => removeItem(index));

        controls.appendChild(minusBtn);
        controls.appendChild(removeBtn);

        li.appendChild(left);
        li.appendChild(controls);
        cartList.appendChild(li);
    });

    totalSpan.textContent = total;
}

// ────────────────────────────────────────────────
// إرسال الطلب
tg.MainButton.onClick(() => {
    console.log("حاول إرسال البيانات..."); // سطر للفحص
    if (cart.length === 0) {
        tg.showAlert("السلة فارغة!");
        return;
    }

    const notes = notesTextarea.value.trim() || "لا توجد ملاحظات";

    const orderData = {
        orders: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity
        })),
        total: total,
        notes: notes
    };
    alert("سيتم إرسال الطلب الآن: " + JSON.stringify(orderData)); // تنبيه تجريبي
    tg.sendData(JSON.stringify(orderData));
    tg.close();

});
