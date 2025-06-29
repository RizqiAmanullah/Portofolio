<?php
// Database setup script
$host = 'localhost';
$username = 'root';
$password = 'Venn1147!';

try {
    // Connect to MySQL server (without specifying database)
    $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to MySQL server successfully.\n";
    
    // Read and execute SQL file
    $sql = file_get_contents('database/portfolio_articles.sql');
    
    // Split SQL into individual statements
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement)) {
            $pdo->exec($statement);
        }
    }
    
    echo "Database and tables created successfully.\n";
    
    // Create admin user with hashed password
    $pdo->exec("USE portfolio_articles");
    
    // Delete existing admin user if exists
    $pdo->exec("DELETE FROM users WHERE username = 'rizqi'");
    
    // Create new admin user with properly hashed password
    $hashedPassword = password_hash('VenVoren1147!', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    $stmt->execute(['rizqi', $hashedPassword]);
    
    echo "Admin user 'rizqi' created with password 'VenVoren1147!'.\n";
    echo "Setup completed successfully!\n";
    
} catch(PDOException $e) {
    die("Setup failed: " . $e->getMessage() . "\n");
}
?>
