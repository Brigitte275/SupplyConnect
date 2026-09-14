// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Store auth token
let authToken = localStorage.getItem('token');

// Fetch products from backend
async function fetchProducts(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`);
        const data = await response.json();
        
        displayProducts(data.products);
        updatePagination(data);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Handle login
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
            updateUIForLoggedInUser(result.user);
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed', 'error');
    }
}

// Handle supplier registration
async function handleSupplierSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: 'supplier',
        company: formData.get('company'),
        businessType: formData.get('businessType'),
        categories: formData.getAll('categories')
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
            showNotification('Registration successful!', 'success');
        } else {
            showNotification(result.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed', 'error');
    }
}

// Handle contact supplier
async function handleContactSubmit(event) {
    event.preventDefault();
    
    if (!authToken) {
        openModal('loginModal');
        return;
    }
    
    const formData = new FormData(event.target);
    const data = {
        recipient: document.getElementById('currentSupplierId').value,
        subject: `Inquiry about products`,
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
            showNotification('Message sent successfully!', 'success');
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
    checkAuthStatus();
});