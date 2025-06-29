// Admin authentication and management functionality

// Check if user is logged in
function checkAuth() {
    auth.onAuthStateChanged(user => {
        if (window.location.pathname.includes('admin-dashboard.html') && !user) {
            window.location.href = 'admin.html';
        }
    });
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');
            
            // Clear previous error messages
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
            
            // Debug logging
            console.log('Attempting login with email:', email);
            console.log('Firebase auth object:', auth);
            
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                console.log('Login successful:', userCredential.user);
                window.location.href = 'admin-dashboard.html';
            } catch (error) {
                console.error('Login error:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                
                // Show user-friendly error messages
                let errorText = '';
                switch(error.code) {
                    case 'auth/user-not-found':
                        errorText = 'No user found with this email address.';
                        break;
                    case 'auth/wrong-password':
                        errorText = 'Incorrect password.';
                        break;
                    case 'auth/invalid-email':
                        errorText = 'Invalid email address.';
                        break;
                    case 'auth/user-disabled':
                        errorText = 'This user account has been disabled.';
                        break;
                    case 'auth/too-many-requests':
                        errorText = 'Too many failed login attempts. Please try again later.';
                        break;
                    default:
                        errorText = error.message || 'Login failed. Please check your credentials.';
                }
                
                errorMessage.textContent = errorText;
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
                await auth.signOut();
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
    auth.onAuthStateChanged(user => {
        if (user) {
            loadArticles();
            
            const articleForm = document.getElementById('articleForm');
            const clearFormBtn = document.getElementById('clearForm');
            
            articleForm.addEventListener('submit', saveArticle);
            clearFormBtn.addEventListener('click', clearForm);
        }
    });
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
                    <button class="btn-small" onclick="editArticle('${article.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteArticle('${article.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <p class="article-meta">
                <span class="category">${article.category}</span> | 
                <span class="date">${formatDate(article.date)}</span>
                ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </p>
            <p class="article-preview">${article.content.substring(0, 100)}...</p>
        `;
        articlesList.appendChild(articleElement);
    });
}

// Get articles from Firestore
async function getArticles() {
    try {
        const articlesRef = db.collection('articles');
        const snapshot = await articlesRef.orderBy('createdAt', 'desc').get();
        
        const articles = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            articles.push({
                id: doc.id,
                title: data.title,
                content: data.content,
                category: data.category,
                author: data.author,
                featured: data.featured || false,
                date: data.createdAt ? data.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            });
        });
        
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
        featured,
        author: auth.currentUser.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        const articlesRef = db.collection('articles');
        
        if (articleId) {
            // Edit existing article
            await articlesRef.doc(articleId).update(articleData);
        } else {
            // Add new article
            await articlesRef.add(articleData);
        }
        
        loadArticles();
        clearForm();
        alert('Article saved successfully!');
    } catch (error) {
        console.error('Save error:', error);
        alert('Error saving article: ' + error.message);
    }
}

// Edit article
async function editArticle(id) {
    try {
        const doc = await db.collection('articles').doc(id).get();
        if (doc.exists) {
            const article = doc.data();
            document.getElementById('articleId').value = doc.id;
            document.getElementById('title').value = article.title;
            document.getElementById('category').value = article.category;
            document.getElementById('content').value = article.content;
            document.getElementById('featured').checked = article.featured || false;
            
            // Scroll to form
            document.querySelector('.article-form').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Edit error:', error);
        alert('Error loading article: ' + error.message);
    }
}

// Delete article
async function deleteArticle(id) {
    if (confirm('Are you sure you want to delete this article?')) {
        try {
            await db.collection('articles').doc(id).delete();
            loadArticles();
            alert('Article deleted successfully!');
        } catch (error) {
            console.error('Delete error:', error);
            alert('Error deleting article: ' + error.message);
        }
    }
}

// Clear form
function clearForm() {
    document.getElementById('articleForm').reset();
    document.getElementById('articleId').value = '';
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
