// Sample Data
const products = [
    {
        id: 1,
        name: "Industrial CNC Machine",
        category: "machinery",
        price: "$45,000 - $60,000",
        moq: "1 Unit",
        supplier: "TechMach Industries",
        location: "Shenzhen, China",
        image: "images/IndustrialMachine.jpg",
        rating: 4.8,
        verified: true,
        description: "High-precision CNC machining center with 5-axis capability. Perfect for aerospace and automotive manufacturing."
    },
    {
        id: 2,
        name: "Organic Cotton Fabric",
        category: "textiles",
        price: "$8.50 - $12.00 / kg",
        moq: "500 kg",
        supplier: "GreenTextile Co.",
        location: "Mumbai, India",
        image: "images/organicCottonFabric.jpg",
        rating: 4.6,
        verified: true,
        description: "100% GOTS certified organic cotton fabric. Available in various weaves and weights. Sustainable and eco-friendly."
    },
    {
        id: 3,
        name: "Smart Home Control Panel",
        category: "electronics",
        price: "$120 - $180 / piece",
        moq: "100 pieces",
        supplier: "SmartLiving Tech",
        location: "Guangzhou, China",
        image: "images/smartHomeControlPanel.jpg",
        rating: 4.9,
        verified: true,
        description: "IoT-enabled smart home control hub with touchscreen interface. Compatible with major protocols including Zigbee and Z-Wave."
    },
    {
        id: 4,
        name: "Arabica Coffee Beans",
        category: "agriculture",
        price: "$4,200 - $5,800 / ton",
        moq: "5 Tons",
        supplier: "Andean Harvest",
        location: "Bogotá, Colombia",
        image: "images/ArabicaCoffeeBeans.jpg",
        rating: 4.7,
        verified: true,
        description: "Premium shade-grown Arabica coffee beans. Single origin with chocolate and caramel notes. Direct trade certified."
    },
    {
        id: 5,
        name: "Electric Motor 50HP",
        category: "machinery",
        price: "$2,800 - $3,500",
        moq: "2 Units",
        supplier: "PowerDrive Systems",
        location: "Stuttgart, Germany",
        image: "images/ElectricMotor.jpg",
        rating: 4.9,
        verified: true,
        description: "High-efficiency IE4 electric motor. Low maintenance, suitable for industrial pumps, compressors, and conveyors."
    },
    {
        id: 6,
        name: "Silk Scarves Collection",
        category: "textiles",
        price: "$15 - $35 / piece",
        moq: "200 pieces",
        supplier: "Luxury Weavers",
        location: "Hangzhou, China",
        image: "images/SilkScarves.jpg",
        rating: 4.5,
        verified: true,
        description: "Handwoven silk scarves with traditional patterns. 100% mulberry silk with digital printing options available."
    },
    {
        id: 7,
        name: "Solar Panel 550W",
        category: "electronics",
        price: "$180 - $220 / panel",
        moq: "50 panels",
        supplier: "SunPower Manufacturing",
        location: "Shanghai, China",
        image: "images/SolarPanel.jpg",
        rating: 4.8,
        verified: true,
        description: "Monocrystalline solar panels with 21% efficiency. Tier 1 quality with 25-year warranty. IEC certified."
    },
    {
        id: 8,
        name: "Quinoa Grain Organic",
        category: "agriculture",
        price: "$1,800 - $2,400 / ton",
        moq: "10 Tons",
        supplier: "Andean Superfoods",
        location: "Lima, Peru",
        image: "images/QuinoaGrainOrganic.jpg",
        rating: 4.6,
        verified: true,
        description: "Royal quinoa organically grown in the Andean highlands. Gluten-free, high protein content. USDA Organic certified."
    }
];

const suppliers = [
    {
        id: 1,
        name: "TechMach Industries",
        location: "Shenzhen, China",
        type: "Manufacturer",
        products: 45,
        rating: 4.8,
        image: "images/TechMach.jpg",
        verified: true,
        years: 12,
        categories: ["Machinery", "Industrial Equipment"]
    },
    {
        id: 2,
        name: "GreenTextile Co.",
        location: "Mumbai, India",
        type: "Manufacturer",
        products: 128,
        rating: 4.6,
        image: "images/GreenTextile.jpg",
        verified: true,
        years: 8,
        categories: ["Textiles", "Organic Materials"]
    },
    {
        id: 3,
        name: "SmartLiving Tech",
        location: "Guangzhou, China",
        type: "Distributor",
        products: 67,
        rating: 4.9,
        image: "images/SmartLiving.jpg",
        verified: true,
        years: 5,
        categories: ["Electronics", "Smart Home"]
    },
    {
        id: 4,
        name: "Andean Harvest",
        location: "Bogotá, Colombia",
        type: "Exporter",
        products: 23,
        rating: 4.7,
        image: "images/Andean.jpg",
        verified: true,
        years: 15,
        categories: ["Agriculture", "Coffee & Cocoa"]
    },
    {
        id: 5,
        name: "PowerDrive Systems",
        location: "Stuttgart, Germany",
        type: "Manufacturer",
        products: 89,
        rating: 4.9,
        image: "images/PowerDrive.jpg",
        verified: true,
        years: 20,
        categories: ["Machinery", "Electronics"]
    },
    {
        id: 6,
        name: "SunPower Manufacturing",
        location: "Shanghai, China",
        type: "Manufacturer",
        products: 34,
        rating: 4.8,
        image: "images/SunPower.jpg",
        verified: true,
        years: 10,
        categories: ["Electronics", "Solar Energy"]
    }
];

let currentFilter = 'all';
let currentSupplier = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(products);
    renderSuppliers();
    lucide.createIcons();
});

// Render Functions
function renderProducts(productsToRender) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = productsToRender.map(product => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden card-hover cursor-pointer" onclick="openProductDetail(${product.id})">
            <div class="relative h-48 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transition hover:scale-105">
                <div class="absolute top-4 right-4 bg-white px-2 py-1 rounded-full text-xs font-semibold shadow-sm">
                    ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                </div>
                ${product.verified ? `<div class="absolute top-4 left-4 bg-blue-500 text-white p-1 rounded-full" title="Verified Supplier">
                    <i data-lucide="check-circle" class="h-4 w-4"></i>
                </div>` : ''}
            </div>
            <div class="p-5">
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-1">${product.name}</h3>
                <p class="text-indigo-600 font-bold text-lg mb-2">${product.price}</p>
                <div class="flex items-center text-sm text-gray-500 mb-3">
                    <i data-lucide="package" class="h-4 w-4 mr-1"></i>
                    MOQ: ${product.moq}
                </div>
                <div class="flex items-center justify-between border-t pt-3">
                    <div class="flex items-center text-sm text-gray-600">
                        <i data-lucide="building-2" class="h-4 w-4 mr-1"></i>
                        <span class="truncate max-w-[120px]">${product.supplier}</span>
                    </div>
                    <div class="flex items-center text-sm text-yellow-500">
                        <i data-lucide="star" class="h-4 w-4 mr-1 fill-current"></i>
                        ${product.rating}
                    </div>
                </div>
                <button onclick="event.stopPropagation(); openContactModal(${product.id}, '${product.supplier}')" 
                        class="w-full mt-4 bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition flex items-center justify-center gap-2">
                    <i data-lucide="message-circle" class="h-4 w-4"></i>
                    Contact Supplier
                </button>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderSuppliers() {
    const grid = document.getElementById('suppliersGrid');
    grid.innerHTML = suppliers.map(supplier => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 card-hover">
            <div class="flex items-start justify-between mb-4">
                <img src="${supplier.image}" alt="${supplier.name}" class="w-20 h-20 rounded-lg object-cover">
                <div class="flex flex-col items-end">
                    ${supplier.verified ? `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-1">Verified</span>` : ''}
                    <div class="flex items-center text-yellow-500 text-sm">
                        <i data-lucide="star" class="h-4 w-4 mr-1 fill-current"></i>
                        ${supplier.rating}
                    </div>
                </div>
            </div>
            <h3 class="font-bold text-lg text-gray-900 mb-1">${supplier.name}</h3>
            <p class="text-sm text-gray-500 mb-3 flex items-center">
                <i data-lucide="map-pin" class="h-4 w-4 mr-1"></i>
                ${supplier.location}
            </p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${supplier.categories.map(cat => `<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">${cat}</span>`).join('')}
            </div>
            <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>${supplier.products} Products</span>
                <span>${supplier.years} Years</span>
            </div>
            <button onclick="openContactModal(${supplier.id}, '${supplier.name}')" 
                    class="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
                Contact Now
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

// Filter Functions
function filterProducts(category) {
    currentFilter = category;
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === category) {
            btn.classList.remove('bg-gray-200', 'text-gray-700');
            btn.classList.add('bg-indigo-600', 'text-white');
        } else {
            btn.classList.remove('bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        }
    });
    
    const filtered = category === 'all' ? products : products.filter(p => p.category === category);
    renderProducts(filtered);
}

function filterByCategory(category) {
    scrollToSection('products');
    filterProducts(category);
}

function handleSearch(value) {
    if (value.length > 2) {
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(value.toLowerCase()) ||
            p.category.toLowerCase().includes(value.toLowerCase()) ||
            p.supplier.toLowerCase().includes(value.toLowerCase())
        );
        renderProducts(filtered);
    } else if (value === '') {
        renderProducts(products);
    }
}

function performSearch() {
    const value = document.getElementById('heroSearch').value;
    scrollToSection('products');
    handleSearch(value);
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openContactModal(id, supplierName) {
    currentSupplier = { id, name: supplierName };
    document.getElementById('supplierInfo').innerHTML = `
        <img src="http://static.photos/company/100x100/${id}" class="w-12 h-12 rounded-lg object-cover mr-4">
        <div>
            <p class="font-semibold text-gray-900">${supplierName}</p>
            <p class="text-sm text-gray-500">Typically responds within 24 hours</p>
        </div>
    `;
    openModal('contactModal');
}

function openProductDetail(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const content = document.getElementById('productDetailContent');
    content.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <div>
                <img src="${product.image}" alt="${product.name}" class="w-full h-96 object-cover rounded-xl mb-4">
                <div class="grid grid-cols-4 gap-2">
                    <img src="${product.image}" class="w-full h-20 object-cover rounded-lg cursor-pointer border-2 border-indigo-600">
                    <img src="http://static.photos/industry/200x200/${product.id + 20}" class="w-full h-20 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition">
                    <img src="http://static.photos/industry/200x200/${product.id + 21}" class="w-full h-20 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition">
                    <img src="http://static.photos/industry/200x200/${product.id + 22}" class="w-full h-20 object-cover rounded-lg cursor-pointer opacity-60 hover:opacity-100 transition">
                </div>
            </div>
            <div>
                <div class="flex items-center gap-2 mb-2">
                    <span class="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">${product.category}</span>
                    ${product.verified ? `<span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium flex items-center"><i data-lucide="check-circle" class="h-3 w-3 mr-1"></i> Verified</span>` : ''}
                </div>
                <h2 class="text-3xl font-bold text-gray-900 mb-4">${product.name}</h2>
                <p class="text-3xl font-bold text-indigo-600 mb-6">${product.price}</p>
                
                <div class="space-y-4 mb-6">
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-gray-600">Minimum Order</span>
                        <span class="font-semibold">${product.moq}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-gray-600">Supplier</span>
                        <span class="font-semibold">${product.supplier}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-gray-600">Location</span>
                        <span class="font-semibold">${product.location}</span>
                    </div>
                    <div class="flex justify-between py-2 border-b">
                        <span class="text-gray-600">Rating</span>
                        <span class="font-semibold flex items-center text-yellow-500"><i data-lucide="star" class="h-4 w-4 mr-1 fill-current"></i> ${product.rating}</span>
                    </div>
                </div>
                
                <p class="text-gray-600 mb-6">${product.description}</p>
                
                <div class="flex gap-4">
                    <button onclick="openContactModal(${product.id}, '${product.supplier}')" class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                        <i data-lucide="message-circle" class="h-5 w-5"></i>
                        Contact Supplier
                    </button>
                    <button class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i data-lucide="heart" class="h-5 w-5 text-gray-600"></i>
                    </button>
                    <button class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <i data-lucide="share-2" class="h-5 w-5 text-gray-600"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    openModal('productModal');
    lucide.createIcons();
}

// Form Handlers
function handleContactSubmit(event) {
    event.preventDefault();
    alert(`Message sent to ${currentSupplier.name}! They will contact you within 24 hours.`);
    closeModal('contactModal');
    event.target.reset();
}

function handleSupplierSubmit(event) {
    event.preventDefault();
    alert('Application submitted successfully! Our team will review your information within 2-3 business days.');
    closeModal('supplierModal');
    event.target.reset();
}

function handleLogin(event) {
    event.preventDefault();
    alert('Welcome back! You are now logged in.');
    closeModal('loginModal');
    event.target.reset();
}

// Utility Functions
function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function loadMoreProducts() {
    alert('Loading more products... (Demo functionality)');
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}