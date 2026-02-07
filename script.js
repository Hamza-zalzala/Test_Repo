
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let cart = [];
let menuData = {};

const categories = {
    "المعجنات": "🥐 المعجنات",
    "البيتزا": "🍕 البيتزا",
    "المعجنات_دبل": "🥪 معجنات دبل",
    "السندويش": "🌯 السندويش",
    "المشروبات": "🥤 المشروبات"
};

fetch('menu.json')
    .then(res => res.json())
    .then(data => {
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
        btn.textContent = categories[key] || key;
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            showCategory(key);
        };
        nav.appendChild(btn);
    });
}

function showCategory(key) {
    const container = document.getElementById('menu');
    container.innerHTML = '<div class="menu-grid"></div>';
    const grid = container.querySelector('.menu-grid');
    let items = Array.isArray(menuData[key]) ? menuData[key] : (menuData[key].sizes || []);

    items.forEach(item => {
        const itemName = item.النوع || item.name || item.size;
        const itemPrice = item.السعر || item.price;
        const cartItem = cart.find(i => i.name === itemName);
        const qty = cartItem ? cartItem.quantity : 0;

        const card = document.createElement('div');
        card.className = 'item-card no-image';
        card.innerHTML = `
            <div class="item-info">
                <div class="item-name">${itemName}</div>
                <div class="item-price">${Number(itemPrice).toLocaleString()} ل.س</div>
            </div>
            <div class="qty-control">
                <button class="qty-btn minus" onclick="updateQty('${itemName}', ${itemPrice}, -1)">-</button>
                <span class="qty-val" id="qty-${itemName}">${qty}</span>
                <button class="qty-btn plus" onclick="updateQty('${itemName}', ${itemPrice}, 1)">+</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.updateQty = (name, price, change) => {
    const itemIndex = cart.findIndex(i => i.name === name);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
    } else if (change > 0) {
        cart.push({ name: name, price: Number(price), quantity: 1 });
    }

    const qtySpan = document.getElementById(`qty-${name}`);
    if (qtySpan) {
        const currentItem = cart.find(i => i.name === name);
        qtySpan.textContent = currentItem ? currentItem.quantity : 0;
    }
    updateUI();
};

function updateUI() {
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    document.getElementById('total').textContent = total.toLocaleString();

    // تحديث ملخص السلة في واجهة المستخدم
    const summaryEl = document.getElementById('cart-summary');
    if (summaryEl) {
        if (cart.length > 0) {
            summaryEl.innerHTML = cart.map(item => 
                `<div style="display:flex; justify-content:space-between; font-size:14px; margin-bottom:4px;">
                    <span>• ${item.name} × ${item.quantity}</span>
                    <span>${(item.price * item.quantity).toLocaleString()} ل.س</span>
                </div>`
            ).join('');
        } else {
            summaryEl.innerHTML = '<div style="color:#aaa; text-align:center;">السلة فارغة</div>';
        }
    }

    if (cart.length > 0) {
        tg.MainButton.setParams({
            text: `تأكيد الطلب (${total.toLocaleString()} ل.س)`,
            is_visible: true,
            is_active: true,
            color: '#2ecc71'
        });
    } else {
        tg.MainButton.hide();
    }
}

tg.MainButton.onClick(() => {
    tg.sendData(JSON.stringify({
        orders: cart,
        total: cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),
        notes: document.getElementById('notes').value
    }));
});
