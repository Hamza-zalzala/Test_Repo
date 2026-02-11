// const tg = window.Telegram.WebApp;
// tg.ready();
// tg.expand();

// let cart = [];
// let menuData = {};

// const categoryEmojis = {
//     "المعجنات": "🥐",
//     "البيتزا": "🍕",
//     "المعجنات_دبل": "🥪",
//     "السندويش": "🌯",
//     "المشروبات": "🥤"
// };

// fetch('menu.json').then(res => res.json()).then(data => {
//     menuData = data;
//     renderTabs();
//     showCategory(Object.keys(data)[0]);
// });

// function renderTabs() {
//     const nav = document.getElementById('tabs-nav');
//     nav.innerHTML = '';
//     Object.keys(menuData).forEach((key, index) => {
//         const btn = document.createElement('button');
//         btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
//         const emoji = categoryEmojis[key] || "🍴";
//         btn.innerHTML = `<span>${emoji}</span> ${key.replace('_', ' ')}`;
//         btn.onclick = (e) => {
//             document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
//             e.currentTarget.classList.add('active');
//             showCategory(key);
//         };
//         nav.appendChild(btn);
//     });
// }

// function showCategory(key) {
//     const container = document.getElementById('menu');
//     container.innerHTML = '<div class="menu-grid"></div>';
//     const grid = container.querySelector('.menu-grid');
//     let items = Array.isArray(menuData[key]) ? menuData[key] : (menuData[key].sizes || []);

//     items.forEach(item => {
//         const itemName = item.النوع || item.name || item.size;
//         const itemPrice = item.السعر || item.price;
//         const cartItem = cart.find(i => i.name === itemName);
//         const qty = cartItem ? cartItem.quantity : 0;

//         const card = document.createElement('div');
//         card.className = 'item-card';
//         card.innerHTML = `
//             <div class="item-info">
//                 <div class="item-name">${itemName}</div>
//                 <div class="item-price">${Number(itemPrice).toLocaleString()} ل.س</div>
//             </div>
//             <div class="qty-control">
//                 <button class="qty-btn minus" onclick="window.updateQty('${itemName}', ${itemPrice}, -1)">-</button>
//                 <span id="qty-${itemName}" class="qty-val">${qty}</span>
//                 <button class="qty-btn plus" onclick="window.updateQty('${itemName}', ${itemPrice}, 1)">+</button>
//             </div>`;
//         grid.appendChild(card);
//     });
// }

// // تعريف عالمي لضمان عمل الأزرار داخل innerHTML
// window.updateQty = function(name, price, change) {
//     const index = cart.findIndex(i => i.name === name);
//     if (index > -1) {
//         cart[index].quantity += change;
//         if (cart[index].quantity <= 0) cart.splice(index, 1);
//     } else if (change > 0) {
//         cart.push({ name, price: Number(price), quantity: 1 });
//     }
//     const qtySpan = document.getElementById(`qty-${name}`);
//     if (qtySpan) qtySpan.textContent = cart.find(i => i.name === name)?.quantity || 0;
//     updateUI();
// };

// function toggleCart() {
//     const modal = document.getElementById('cart-modal');
//     if (cart.length > 0) {
//         modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
//     }
// }

// function updateUI() {
//     const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
//     const count = cart.reduce((sum, i) => sum + i.quantity, 0);

//     const cartBar = document.getElementById('cart-bar');
//     if (cart.length > 0) {
//         cartBar.style.display = 'flex';
//         document.getElementById('items-count').textContent = count;
//         document.getElementById('bar-total').textContent = total.toLocaleString() + " ل.س";
//     } else {
//         cartBar.style.display = 'none';
//         document.getElementById('cart-modal').style.display = 'none';
//     }

//     const summary = document.getElementById('cart-summary');
//     summary.innerHTML = cart.map(i => `
//         <div class="summary-line">
//             <span>${i.name} × ${i.quantity}</span>
//             <span>${(i.price * i.quantity).toLocaleString()} ل.س</span>
//         </div>`).join('');
    
//     document.getElementById('total').textContent = total.toLocaleString();

//     if (cart.length > 0) {
//         tg.MainButton.setText(`تأكيد الطلب (${total.toLocaleString()} ل.س)`);
//         tg.MainButton.show();
//     } else {
//         tg.MainButton.hide();
//     }
// }

// tg.MainButton.onClick(() => {
//     tg.sendData(JSON.stringify({
//         orders: cart,
//         total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
//         notes: document.getElementById('notes').value
//     }));
// });

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let cart = [];
let menuData = {};

const categoryEmojis = {
    "المعجنات": "🥐",
    "البيتزا": "🍕",
    "المعجنات_دبل": "🥪",
    "السندويش": "🌯",
    "المشروبات": "🥤"
};

// تحميل البيانات
fetch('menu.json').then(res => res.json()).then(data => {
    menuData = data;
    renderTabs();
    showCategory(Object.keys(data)[0]);
});

function renderTabs() {
    const nav = document.getElementById('tabs-nav');
    nav.innerHTML = '';
    Object.keys(menuData).forEach((key, index) => {
        const btn = document.createElement('button');
        btn.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        const emoji = categoryEmojis[key] || "🍴";
        btn.innerHTML = `<span>${emoji}</span> ${key.replace('_', ' ')}`;
        btn.onclick = (e) => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            showCategory(key);
        };
        nav.appendChild(btn);
    });
}

function showCategory(key) {
    const container = document.getElementById('menu');
    container.innerHTML = '<div class="menu-grid"></div>';
    const grid = container.querySelector('.menu-grid');
    let items = Array.isArray(menuData[key]) ? menuData[key] : [];

    items.forEach(item => {
        const itemName = item.النوع || item.name || item.size;
        const itemPrice = item.السعر || item.price;
        const cartItem = cart.find(i => i.name === itemName);
        const qty = cartItem ? cartItem.quantity : 0;

        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${itemName}</div>
                <div class="item-price">${Number(itemPrice).toLocaleString()} ل.س</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn minus" onclick="window.updateQty('${itemName}', ${itemPrice}, -1)">-</button>
                <span id="qty-${itemName}" class="qty-val">${qty}</span>
                <button class="qty-btn plus" onclick="window.updateQty('${itemName}', ${itemPrice}, 1)">+</button>
            </div>`;
        grid.appendChild(card);
    });
}

// تحديث الكمية (تعمل للقائمة وللسلة)
window.updateQty = function(name, price, change) {
    const index = cart.findIndex(i => i.name === name);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else if (change > 0) {
        cart.push({ name, price: Number(price), quantity: 1 });
    }
    
    // تحديث الرقم في القائمة الرئيسية إذا كان العنصر ظاهراً
    const qtySpan = document.getElementById(`qty-${name}`);
    if (qtySpan) qtySpan.textContent = cart.find(i => i.name === name)?.quantity || 0;
    
    updateUI();
};

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (cart.length > 0) {
        modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
    } else {
        modal.style.display = 'none';
    }
}

function updateUI() {
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);

    // تحديث بار الطلب السفلي
    const cartBar = document.getElementById('cart-bar');
    if (cart.length > 0) {
        cartBar.style.display = 'flex';
        document.getElementById('items-count').textContent = count;
        document.getElementById('bar-total').textContent = total.toLocaleString() + " ل.س";
    } else {
        cartBar.style.display = 'none';
        document.getElementById('cart-modal').style.display = 'none';
    }

    // تحديث محتوى نافذة السلة مع إضافة أزرار التحكم
    const summary = document.getElementById('cart-summary');
    summary.innerHTML = cart.map(i => `
        <div class="summary-line">
            <div style="flex-grow: 1;">
                <div style="font-weight: bold; font-size: 1rem;">${i.name}</div>
                <div style="font-size: 0.85rem; color: var(--secondary);">${(i.price * i.quantity).toLocaleString()} ل.س</div>
            </div>
            <div class="qty-control" style="transform: scale(0.9);">
                <button class="qty-btn minus" onclick="window.updateQty('${i.name}', ${i.price}, -1)">-</button>
                <span class="qty-val">${i.quantity}</span>
                <button class="qty-btn plus" onclick="window.updateQty('${i.name}', ${i.price}, 1)">+</button>
            </div>
        </div>`).join('');
    
    document.getElementById('total').textContent = total.toLocaleString();

    // تحديث زر تليجرام الرئيسي
    if (cart.length > 0) {
        tg.MainButton.setText(`إرسال الطلب (${total.toLocaleString()} ل.س)`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// إرسال البيانات لتليجرام
tg.MainButton.onClick(() => {
    const orderData = {
        orders: cart,
        total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        notes: document.getElementById('notes').value
    };
    tg.sendData(JSON.stringify(orderData));
});
