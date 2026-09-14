// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let currentUser = null;
let currentPage = 1;
let currentFilter = 'all';
let searchTimeout;

// Initialize Lucide icons
lucide.createIcons();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
    initializeEventListeners();
});

// Event Listeners
function initializeEventListeners() {
    // Hero search
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(e.target.value);
            }, 500);
        });
    }

    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

// Authentication
async function checkAuthStatus() {
    if (!authToken) return;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            updateUIForLoggedInUser(currentUser);
        } else {
            localStorage.removeItem('token');
            authToken = null;
        }
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

function updateUIForLoggedInUser(user) {
    // Update navigation
    const navButtons = document.querySelector('.md:flex.items-center.space-x-8');
    if (navButtons) {
        const loginButton = navButtons.querySelector('button:last-child');
        if (loginButton) {
            loginButton.outerHTML = `
                <div class="flex items-center space-x-3">
                    <span class="text-sm font-medium text-gray-700">Welcome, ${user.name}</span>
                    <button onclick="logout()" class="text-gray-600 hover:text-gray-900 font-medium">Logout</button>
                </div>
            `;
        }
    }
}

async function logout() {
    localStorage.removeItem('token');
    authToken = null;
    currentUser = null;
    window.location.reload();
}

// Login Handler
async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', result.token);
            authToken = result.token;
            closeModal('loginModal');
            showNotification('Login successful!', 'success');
            checkAuthStatus();
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed', 'error');
    }
}

// Supplier Registration
async function handleSupplierSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const categories = [];
    document.querySelectorAll('#supplierModal input[type="checkbox"]:checked').forEach(cb => {
        categories.push(cb.nextElementSibling.textContent.toLowerCase());
    });

    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: 'supplier',
        company: formData.get('companyName'),
        businessType: formData.get('businessType'),
        categories: categories
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', result.token);
            authToken = result.token;
            closeModal('supplierModal');
            showNotification('Registration successful! Please complete your supplier profile.', 'success');
            
            // Redirect to supplier dashboard or open profile editor
            setTimeout(() => {
                openSupplierProfileModal();
            }, 1500);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed', 'error');
    }
}

// Products
async function fetchProducts(filters = {}) {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 12,
            ...filters
        }).toString();
        
        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
        const data = await response.json();
        
        displayProducts(data.products);
        updatePagination(data);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i data-lucide="package-x" class="h-16 w-16 text-gray-400 mx-auto mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden card-hover cursor-pointer" onclick="openProductModal('${product._id}')">
            <div class="h-48 bg-gray-200 relative">
                ${product.images && product.images[0] ? 
                    `<img src="${product.images[0].url}" alt="${product.name}" class="w-full h-full object-cover">` :
                    `<div class="w-full h-full flex items-center justify-center bg-gray-100">
                        <i data-lucide="image" class="h-12 w-12 text-gray-400"></i>
                    </div>`
                }
                ${product.isFeatured ? `
                    <span class="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                        Featured
                    </span>
                ` : ''}
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                        ${product.category}
                    </span>
                    <div class="flex items-center">
                        <i data-lucide="star" class="h-4 w-4 text-yellow-400 fill-current"></i>
                        <span class="text-sm text-gray-600 ml-1">${product.rating}</span>
                    </div>
                </div>
                <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2">${product.name}</h3>
                <p class="text-sm text-gray-600 mb-3 line-clamp-2">${product.description}</p>
                <div class="flex items-center justify-between">
                    <div>
                        <span class="text-lg font-bold text-indigo-600">$${product.price}</span>
                        <span class="text-sm text-gray-500">/${product.unit}</span>
                    </div>
                    <span class="text-xs text-gray-500">Min: ${product.minOrderQuantity} ${product.unit}</span>
                </div>
                <div class="mt-3 pt-3 border-t flex items-center justify-between">
                    <span class="text-sm text-gray-600">
                        ${product.supplier?.companyName || 'Supplier'}
                    </span>
                    <button onclick="event.stopPropagation(); openContactModal('${product.supplier?._id}')" 
                            class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Suppliers
async function fetchSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers?limit=6`);
        const data = await response.json();
        displaySuppliers(data.suppliers);
    } catch (error) {
        console.error('Error fetching suppliers:', error);
    }
}

function displaySuppliers(suppliers) {
    const grid = document.getElementById('suppliersGrid');
    if (!grid) return;

    grid.innerHTML = suppliers.map(supplier => `
        <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
            <div class="flex items-center mb-4">
                <div class="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    ${supplier.logo ? 
                        `<img src="${supplier.logo}" alt="${supplier.companyName}" class="w-full h-full object-cover rounded-lg">` :
                        `<i data-lucide="building-2" class="h-8 w-8 text-indigo-600"></i>`
                    }
                </div>
                <div>
                    <h3 class="font-semibold text-gray-900">${supplier.companyName}</h3>
                    <p class="text-sm text-gray-600">${supplier.businessType}</p>
                </div>
            </div>
            
            <div class="flex items-center mb-3">
                <div class="flex items-center mr-3">
                    <i data-lucide="star" class="h-4 w-4 text-yellow-400 fill-current"></i>
                    <span class="text-sm font-medium ml-1">${supplier.rating}</span>
                </div>
                <span class="text-sm text-gray-500">${supplier.totalProducts} products</span>
                ${supplier.isVerified ? `
                    <span class="ml-auto bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center">
                        <i data-lucide="check-circle" class="h-3 w-3 mr-1"></i> Verified
                    </span>
                ` : ''}
            </div>
            
            <p class="text-sm text-gray-600 mb-4 line-clamp-2">${supplier.description || 'No description provided.'}</p>
            
            <div class="flex items-center justify-between text-sm">
                <span class="text-gray-500">
                    <i data-lucide="clock" class="h-4 w-4 inline mr-1"></i>
                    ${supplier.responseTime || 'Typically responds within 24h'}
                </span>
                <button onclick="openContactModal('${supplier._id}')" 
                        class="text-indigo-600 hover:text-indigo-800 font-medium">
                    Contact
                </button>
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

// Categories
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        updateCategoryFilters(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

function updateCategoryFilters(categories) {
    const filterContainer = document.querySelector('.filter-buttons');
    if (filterContainer) {
        const buttons = categories.map(cat => `
            <button onclick="filterByCategory('${cat.name.toLowerCase()}')" 
                    class="px-4 py-2 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition">
                ${cat.name}
            </button>
        `).join('');
        
        filterContainer.innerHTML = buttons;
    }
}

// Filter and Search
function filterProducts(filter) {
    currentFilter = filter;
    currentPage = 1;
    
    // Update active button state
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    fetchProducts({ category: filter !== 'all' ? filter : undefined });
}

function filterByCategory(category) {
    filterProducts(category);
}

function performSearch(query) {
    if (query.length < 2) {
        if (query.length === 0) {
            fetchProducts({ category: currentFilter !== 'all' ? currentFilter : undefined });
        }
        return;
    }
    
    currentPage = 1;
    fetchProducts({ 
        search: query,
        category: currentFilter !== 'all' ? currentFilter : undefined
    });
}

function handleSearch(query) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

// Load More
function loadMoreProducts() {
    currentPage++;
    fetchProducts({ 
        category: currentFilter !== 'all' ? currentFilter : undefined,
        page: currentPage 
    });
}

function updatePagination(data) {
    const loadMoreBtn = document.querySelector('button[onclick="loadMoreProducts()"]');
    if (loadMoreBtn) {
        if (data.page >= data.totalPages) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'block';
        }
    }
}

// Modal Functions
function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Product Modal
async function openProductModal(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();
        
        const content = document.getElementById('productDetailContent');
        if (content) {
            content.innerHTML = `
                <div class="grid md:grid-cols-2 gap-8">
                    <div>
                        <div class="rounded-lg overflow-hidden bg-gray-100 mb-4">
                            ${product.images && product.images[0] ? 
                                `<img src="${product.images[0].url}" alt="${product.name}" class="w-full h-64 object-cover">` :
                                `<div class="w-full h-64 flex items-center justify-center">
                                    <i data-lucide="image" class="h-16 w-16 text-gray-400"></i>
                                </div>`
                            }
                        </div>
                        ${product.images && product.images.length > 1 ? `
                            <div class="grid grid-cols-4 gap-2">
                                ${product.images.slice(1, 5).map(img => `
                                    <img src="${img.url}" class="w-full h-20 object-cover rounded cursor-pointer" onclick="updateMainImage(this.src)">
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded">
                                ${product.category}
                            </span>
                            <div class="flex items-center">
                                <i data-lucide="star" class="h-5 w-5 text-yellow-400 fill-current"></i>
                                <span class="text-lg font-medium ml-1">${product.rating}</span>
                            </div>
                        </div>
                        
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">${product.name}</h2>
                        
                        <div class="mb-6">
                            <p class="text-gray-600">${product.description}</p>
                        </div>
                        
                        <div class="bg-gray-50 p-4 rounded-lg mb-6">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-gray-600">Price:</span>
                                <span class="text-2xl font-bold text-indigo-600">$${product.price}</span>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-500">
                                <span>Minimum Order:</span>
                                <span>${product.minOrderQuantity} ${product.unit}</span>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-500">
                                <span>Available Stock:</span>
                                <span>${product.stock} ${product.unit}</span>
                            </div>
                        </div>
                        
                        ${product.specifications && product.specifications.length > 0 ? `
                            <div class="mb-6">
                                <h3 class="font-semibold text-gray-900 mb-3">Specifications</h3>
                                <div class="grid grid-cols-2 gap-3">
                                    ${product.specifications.map(spec => `
                                        <div class="bg-gray-50 p-2 rounded">
                                            <span class="text-xs text-gray-500 block">${spec.key}</span>
                                            <span class="text-sm font-medium">${spec.value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="flex gap-3">
                            <button onclick="openContactModal('${product.supplier?._id}')" 
                                    class="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                                Contact Supplier
                            </button>
                            <button onclick="closeModal('productModal')" 
                                    class="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        openModal('productModal');
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Failed to load product details', 'error');
    }
}

// Contact Modal
async function openContactModal(supplierId) {
    if (!authToken) {
        openModal('loginModal');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers/${supplierId}`);
        const supplier = await response.json();
        
        const supplierInfo = document.getElementById('supplierInfo');
        if (supplierInfo) {
            supplierInfo.innerHTML = `
                <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    ${supplier.logo ? 
                        `<img src="${supplier.logo}" class="w-full h-full object-cover rounded-lg">` :
                        `<i data-lucide="building-2" class="h-6 w-6 text-indigo-600"></i>`
                    }
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900">${supplier.companyName}</h4>
                    <p class="text-sm text-gray-600">${supplier.businessType}</p>
                </div>
            `;
            
            // Store supplier ID for form submission
            document.getElementById('currentSupplierId')?.setAttribute('value', supplierId);
        }
        
        openModal('contactModal');
        lucide.createIcons();
    } catch (error) {
        console.error('Error loading supplier:', error);
        showNotification('Failed to load supplier information', 'error');
    }
}

// Contact Form Submit
async function handleContactSubmit(event) {
    event.preventDefault();
    
    if (!authToken) {
        openModal('loginModal');
        return;
    }
    
    const formData = new FormData(event.target);
    const supplierId = document.getElementById('currentSupplierId')?.getAttribute('value');
    
    const data = {
        recipient: supplierId,
        subject: `Inquiry from ${formData.get('name')}`,
        content: formData.get('message')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('contactModal');
            showNotification('Message sent successfully! The supplier will respond shortly.', 'success');
            event.target.reset();
        } else {
            const error = await response.json();
            showNotification(error.message, 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Failed to send message', 'error');
    }
}

// Navigation
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
    closeAllModals();
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slideIn ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
        'bg-blue-500'
    } text-white`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}" class="h-5 w-5 mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('animate-fadeOut');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    .animate-slideIn {
        animation: slideIn 0.3s ease-out;
    }
    
    .animate-fadeOut {
        animation: fadeOut 0.3s ease-out;
    }
    
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
`;
document.head.appendChild(style);