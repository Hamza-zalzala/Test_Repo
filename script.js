const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let cart = [];
let menuData = {};

// الأقسام المتاحة
const categories = {
    "المعجنات": "🥐 المعجنات",
    "البيتزا": "🍕 البيتزا",
    "المعجنات_دبل": "🥪 معجنات دبل",
    "السندويش": "🌯 السندويش",
    "المشروبات": "🥤 المشروبات"
};

// جلب البيانات من ملف menu.json
fetch('menu.json')
    .then(res => res.json())
    .then(data => {
        menuData = data;
        renderTabs();
        showCategory(Object.keys(data)[0]); // عرض أول قسم تلقائياً
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
        
        // البحث عن الكمية الحالية في السلة
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

// الوظيفة المسؤولة عن تحديث السلة والحساب اللحظي
window.updateQty = (name, price, change) => {
    const itemIndex = cart.findIndex(i => i.name === name);
    
    if (itemIndex > -1) {
        // إذا كان الصنف موجوداً، نحدث الكمية
        cart[itemIndex].quantity += change;
        
        // إذا وصلت الكمية لصفر، نحذفه من المصفوفة تماماً
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
    } else if (change > 0) {
        // إذا كان الصنف غير موجود ونريد الإضافة
        cart.push({ 
            name: name, 
            price: Number(price), 
            quantity: 1 
        });
    }

    // 1. تحديث رقم الكمية الظاهر في البطاقة فوراً
    const qtySpan = document.getElementById(`qty-${name}`);
    const currentItem = cart.find(i => i.name === name);
    if (qtySpan) {
        qtySpan.textContent = currentItem ? currentItem.quantity : 0;
    }

    // 2. تحديث الإجمالي والزر الرئيسي
    refreshTotals();
};

function refreshTotals() {
    // حساب الإجمالي مباشرة من المصفوفة لضمان الدقة اللحظية
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // تحديث نص الإجمالي في الصفحة
    const totalEl = document.getElementById('total');
    if (totalEl) {
        totalEl.textContent = total.toLocaleString();
    }

    // تحديث زر التليجرام
    if (cart.length > 0) {
        tg.MainButton.setText(`تأكيد الطلب (${total.toLocaleString()} ل.س)`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// عند الضغط على زر "تأكيد الطلب" في تليجرام
tg.MainButton.onClick(() => {
    const finalTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const data = {
        orders: cart,
        total: finalTotal,
        notes: document.getElementById('notes').value
    };
    tg.sendData(JSON.stringify(data));
});
