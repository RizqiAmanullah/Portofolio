# Portfolio Website with Dynamic Article Management

A dynamic portfolio website with article management system built with PHP backend and MySQL database.

## Features

- **Dynamic Article Management**: Create, read, update, and delete articles
- **Admin Authentication**: Secure login system for administrators
- **Featured Articles**: Highlight important articles
- **Category Filtering**: Filter articles by category
- **Responsive Design**: Mobile-friendly interface
- **Modal Article View**: Read full articles in popup modals

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Web server (Apache/Nginx)
- Modern web browser

## Installation

### 1. Database Setup

1. Create a MySQL database named `portfolio_articles`
2. Run the setup script to create tables and insert sample data:

```bash
php setup.php
```

Or manually import the SQL file:
```sql
mysql -u root -p portfolio_articles < database/portfolio_articles.sql
```

### 2. Database Configuration

Edit `config/database.php` and update the database credentials:

```php
$host = 'localhost';
$dbname = 'portfolio_articles';
$username = 'your_username';
$password = 'your_password';
```

### 3. Web Server Setup

#### Using XAMPP/WAMP/MAMP:
1. Copy all files to your web server directory (htdocs/www)
2. Start Apache and MySQL services
3. Access the website via `http://localhost/your-project-folder`

#### Using PHP Built-in Server:
```bash
php -S localhost:8000
```

## Usage

### Public Access
- Visit `index.html` for the main portfolio page
- Visit `articles.html` to view all articles
- Use category filters and featured article toggles
- Click "Read More" to view full articles in modal

### Admin Access
- Visit `admin.html` to access the admin login
- **Username**: `rizqi`
- **Password**: `admin123`
- After login, you'll be redirected to the admin dashboard
- Create, edit, and delete articles
- Toggle featured status for articles

## File Structure

```
├── api/
│   ├── auth.php          # Authentication API
│   └── articles.php      # Articles CRUD API
├── config/
│   └── database.php      # Database configuration
├── database/
│   └── portfolio_articles.sql  # Database schema
├── js/
│   ├── admin.js          # Admin panel functionality
│   └── articles.js       # Public articles functionality
├── images/               # Portfolio images
├── admin.html           # Admin login page
├── admin-dashboard.html # Admin dashboard
├── articles.html        # Public articles page
├── index.html          # Main portfolio page
├── style1.css          # Main stylesheet
├── setup.php           # Database setup script
└── README.md           # This file
```

## API Endpoints

### Authentication
- `POST /api/auth.php` - Login/logout/check authentication
  - Actions: `login`, `logout`, `check`

### Articles
- `GET /api/articles.php` - Get all articles
  - Query params: `category`, `featured`
- `POST /api/articles.php` - Create new article (requires auth)
- `PUT /api/articles.php` - Update article (requires auth)
- `DELETE /api/articles.php` - Delete article (requires auth)

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Hashed password
- `created_at` - Timestamp

### Articles Table
- `id` - Primary key
- `title` - Article title
- `content` - Article content
- `category` - Article category
- `author` - Article author
- `featured` - Boolean for featured status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Security Features

- Password hashing using PHP's `password_hash()`
- Session-based authentication
- SQL injection prevention using prepared statements
- CORS headers for API access
- Input validation and sanitization

## Customization

### Adding New Categories
1. Simply create articles with new category names
2. The category filter will automatically include new categories

### Styling
- Modify `style1.css` to change the appearance
- The design uses a dark theme with red accent colors (#b74b4b)

### Admin User Management
- To create additional admin users, insert into the `users` table with hashed passwords
- Use PHP's `password_hash()` function to hash passwords

## Troubleshooting

### Database Connection Issues
- Check database credentials in `config/database.php`
- Ensure MySQL service is running
- Verify database exists and user has proper permissions

### API Not Working
- Check if PHP sessions are enabled
- Verify file permissions
- Check browser console for JavaScript errors
- Ensure proper CORS headers

### Authentication Issues
- Clear browser cache and cookies
- Check if sessions are working properly
- Verify admin credentials in database

## License

This project is open source and available under the MIT License.
