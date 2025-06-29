// Articles page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadArticles();
    initFilters();
});

// Initialize filters
function initFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const featuredFilter = document.getElementById('featuredFilter');
    
    categoryFilter.addEventListener('change', filterArticles);
    featuredFilter.addEventListener('click', toggleFeaturedFilter);
}

// Load and display articles
function loadArticles() {
    getArticlesData().then(articles => {
        displayFeaturedArticles(articles);
        displayAllArticles(articles);
    });
}

// Get articles data from Firestore
async function getArticlesData() {
    try {
        const articlesRef = db.collection('articles');
        const snapshot = await articlesRef.get();
        
        const articles = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            articles.push({
                id: doc.id,
                title: data.title || '',
                content: data.content || '',
                category: data.category || '',
                author: data.author || 'Anonymous',
                featured: Boolean(data.featured),
                date: new Date().toISOString().split('T')[0]
            });
        });
        
        return articles.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return new Date(b.date) - new Date(a.date);
        });
    } catch (error) {
        console.error('Error loading articles:', error);
        return [];
    }
}

// Display featured articles
function displayFeaturedArticles(articles) {
    const featuredContainer = document.querySelector('.featured-container');
    const featuredArticles = articles.filter(article => article.featured);
    
    featuredContainer.innerHTML = '';
    
    if (featuredArticles.length === 0) {
        featuredContainer.innerHTML = '<p class="no-articles">No featured articles available.</p>';
        return;
    }
    
    featuredArticles.forEach(article => {
        const articleElement = createFeaturedArticleElement(article);
        featuredContainer.appendChild(articleElement);
    });
}

// Display all articles
function displayAllArticles(articles) {
    const articlesGrid = document.querySelector('.articles-grid');
    
    articlesGrid.innerHTML = '';
    
    if (articles.length === 0) {
        articlesGrid.innerHTML = '<p class="no-articles">No articles available.</p>';
        return;
    }
    
    articles.forEach(article => {
        const articleElement = createArticleElement(article);
        articlesGrid.appendChild(articleElement);
    });
}

// Create featured article element
function createFeaturedArticleElement(article) {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'featured-article';
    articleDiv.innerHTML = `
        <div class="featured-article-content">
            <div class="article-badge">Featured</div>
            <h4>${sanitize(article.title)}</h4>
            <div class="article-meta">
                <span class="category">${sanitize(article.category)}</span>
                <span class="date">${formatDate(article.date)}</span>
                <span class="author">by ${sanitize(article.author)}</span>
            </div>
            <p class="article-excerpt">${sanitize(article.content.substring(0, 200))}...</p>
            <button class="btn btn-small" onclick="openArticleModal('${article.id}')">Read More</button>
        </div>
    `;
    return articleDiv;
}

// Create regular article element
function createArticleElement(article) {
    const articleDiv = document.createElement('div');
    articleDiv.className = 'article-card';
    articleDiv.innerHTML = `
        <div class="article-header">
            <h4>${sanitize(article.title)}</h4>
            ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="article-meta">
            <span class="category">${sanitize(article.category)}</span>
            <span class="date">${formatDate(article.date)}</span>
        </div>
        <p class="article-excerpt">${sanitize(article.content.substring(0, 150))}...</p>
        <div class="article-footer">
            <span class="author">by ${sanitize(article.author)}</span>
            <button class="btn btn-small" onclick="openArticleModal('${article.id}')">Read More</button>
        </div>
    `;
    return articleDiv;
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Sanitize HTML to prevent XSS
function sanitize(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#039;');
}

// Filter articles
function filterArticles() {
    const categoryFilter = document.getElementById('categoryFilter');
    const selectedCategory = categoryFilter.value;
    
    getArticlesData().then(articles => {
        let filteredArticles = articles;
        
        if (selectedCategory) {
            filteredArticles = articles.filter(article => article.category === selectedCategory);
        }
        
        displayAllArticles(filteredArticles);
        displayFeaturedArticles(filteredArticles);
    });
}

// Toggle featured filter
let showingFeaturedOnly = false;
function toggleFeaturedFilter() {
    const featuredFilter = document.getElementById('featuredFilter');
    
    showingFeaturedOnly = !showingFeaturedOnly;
    
    if (showingFeaturedOnly) {
        featuredFilter.textContent = 'Show All Articles';
        featuredFilter.classList.add('active');
        
        getArticlesData().then(articles => {
            const featuredArticles = articles.filter(article => article.featured);
            displayAllArticles(featuredArticles);
        });
    } else {
        featuredFilter.textContent = 'Show Featured Only';
        featuredFilter.classList.remove('active');
        loadArticles();
    }
}

// Open article modal
function openArticleModal(articleId) {
    getArticlesData().then(articles => {
        const article = articles.find(a => a.id === articleId);
        if (article) {
            showArticleModal(article);
        }
    });
}

// Show article modal
function showArticleModal(article) {
    let modal = document.getElementById('articleModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'articleModal';
        modal.className = 'article-modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${sanitize(article.title)}</h2>
                <span class="close-modal" onclick="closeArticleModal()">&times;</span>
            </div>
            <div class="modal-meta">
                <span class="category">${sanitize(article.category)}</span>
                <span class="date">${formatDate(article.date)}</span>
                <span class="author">by ${sanitize(article.author)}</span>
                ${article.featured ? '<span class="featured-badge">Featured</span>' : ''}
            </div>
            <div class="modal-body">
                <p>${sanitize(article.content)}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close article modal
function closeArticleModal() {
    const modal = document.getElementById('articleModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('articleModal');
    if (event.target === modal) {
        closeArticleModal();
    }
});
