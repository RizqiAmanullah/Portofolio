<?php
// Simple test script to verify database connection and API functionality

echo "<h1>Portfolio Articles System - Connection Test</h1>";

// Test 1: Database Connection
echo "<h2>1. Database Connection Test</h2>";
try {
    require_once 'config/database.php';
    echo "✅ Database connection successful!<br>";
    
    // Test if tables exist
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (in_array('users', $tables) && in_array('articles', $tables)) {
        echo "✅ Required tables exist!<br>";
    } else {
        echo "❌ Required tables missing. Please run setup.php<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
    echo "Please check your database configuration in config/database.php<br>";
}

// Test 2: Articles API
echo "<h2>2. Articles API Test</h2>";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM articles");
    $result = $stmt->fetch();
    echo "✅ Articles table accessible. Found " . $result['count'] . " articles.<br>";
} catch (Exception $e) {
    echo "❌ Articles API test failed: " . $e->getMessage() . "<br>";
}

// Test 3: Users API
echo "<h2>3. Users API Test</h2>";
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $result = $stmt->fetch();
    echo "✅ Users table accessible. Found " . $result['count'] . " users.<br>";
    
    // Check if admin user exists
    $stmt = $pdo->prepare("SELECT username FROM users WHERE username = ?");
    $stmt->execute(['rizqi']);
    $admin = $stmt->fetch();
    
    if ($admin) {
        echo "✅ Admin user 'rizqi' exists!<br>";
    } else {
        echo "❌ Admin user 'rizqi' not found. Please run setup.php<br>";
    }
    
} catch (Exception $e) {
    echo "❌ Users API test failed: " . $e->getMessage() . "<br>";
}

// Test 4: PHP Session Support
echo "<h2>4. PHP Session Test</h2>";
if (session_start()) {
    echo "✅ PHP sessions are working!<br>";
} else {
    echo "❌ PHP sessions not working!<br>";
}

// Test 5: File Permissions
echo "<h2>5. File Permissions Test</h2>";
if (is_readable('api/auth.php') && is_readable('api/articles.php')) {
    echo "✅ API files are readable!<br>";
} else {
    echo "❌ API files are not readable!<br>";
}

echo "<h2>Setup Instructions</h2>";
echo "<p>If any tests failed, please:</p>";
echo "<ol>";
echo "<li>Run <code>php setup.php</code> to create database and tables</li>";
echo "<li>Check database credentials in <code>config/database.php</code></li>";
echo "<li>Ensure MySQL service is running</li>";
echo "<li>Verify file permissions</li>";
echo "</ol>";

echo "<h2>Access Points</h2>";
echo "<ul>";
echo "<li><a href='index.html'>Main Portfolio</a></li>";
echo "<li><a href='articles.html'>Articles Page</a></li>";
echo "<li><a href='admin.html'>Admin Login</a> (Username: rizqi, Password: admin123)</li>";
echo "</ul>";
?>
