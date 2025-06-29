// Admin authentication and management functionality

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('api/auth.php');
        const data = await response.json();
        
        if (window.location.pathname.includes('admin-dashboard.html') && !data.authenticated) {
            window.location.href = 'admin.html';
        }
        
        return data.authenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        if (window.location.pathname.includes('admin-dashboard.html')) {
            window.location.href = 'admin.html';
        }
        return false;
    }
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            try {
                const response = await fetch('api/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'login',
                        username: username,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    window.location.href = 'admin-dashboard.html';
                } else {
                    errorMessage.textContent = data.error || 'Login failed';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'Connection error. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                await fetch('api/auth.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'logout'
                    })
                });
                
                window.location.href = 'admin.html';
            } catch (error) {
                console.error('Logout error:', error);
                window.location.href = 'admin.html';
            }
        });
    }

    // Dashboard functionality
    if (window.location.pathname.includes('admin-dashboard.html')) {
        initDashboard();
    }
});

// Dashboard initialization
function initDashboard() {
    loadArticles();
    
    const articleForm = document.getElementById('articleForm');
    const clearFormBtn = document.getElementById('clearForm');
    
    articleForm.addEventListener('submit', saveArticle);
    clearFormBtn.addEventListener('click', clearForm);
}

// Load articles for dashboard
async function loadArticles() {
    const articles = await getArticles();
    const articlesList = document.getElementById('articlesList');
    
    articlesList.innerHTML = '';
    
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = 'article-item';
        articleElement.innerHTML = `
            <div class="article-header">
                <h4>${article.title}</h4>
                <div class="article-actions">
                    <button class="btn-small" onclick="editArticle(${article.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteArticle(${article.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <p class="article-meta">
                <span class="category">${article.category}</span> | 
                <span class="date">${article.date}</span>
                ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </p>
            <p class="article-preview">${article.content.substring(0, 100)}...</p>
        `;
        articlesList.appendChild(articleElement);
    });
}

// Get articles from PHP backend
async function getArticles() {
    try {
        const response = await fetch('api/articles.php');
        const articles = await response.json();
        return articles;
    } catch (error) {
        console.error('Error loading articles:', error);
        return [];
    }
}

// Save article
async function saveArticle(e) {
    e.preventDefault();
    
    const articleId = document.getElementById('articleId').value;
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const content = document.getElementById('content').value;
    const featured = document.getElementById('featured').checked;
    
    const articleData = {
        title,
        category,
        content,
        featured
    };
    
    try {
        let response;
        
        if (articleId) {
            // Edit existing article
            articleData.id = parseInt(articleId);
            response = await fetch('api/articles.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData)
            });
        } else {
            // Add new article
            response = await fetch('api/articles.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(articleData)
            });
        }
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            loadArticles();
            clearForm();
            alert('Article saved successfully!');
        } else {
            alert('Error saving article: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Save error:', error);
        alert('Connection error. Please try again.');
    }
}

// Edit article
async function editArticle(id) {
    const articles = await getArticles();
    const article = articles.find(a => a.id == id);
    
    if (article) {
        document.getElementById('articleId').value = article.id;
        document.getElementById('title').value = article.title;
        document.getElementById('category').value = article.category;
        document.getElementById('content').value = article.content;
        document.getElementById('featured').checked = article.featured;
        
        // Scroll to form
        document.querySelector('.article-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Delete article
async function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            const response = await fetch('api/articles.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: parseInt(id) })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                loadArticles();
                alert('Article deleted successfully!');
            } else {
                alert('Error deleting article: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Connection error. Please try again.');
        }
    }
}

// Clear form
function clearForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
}
