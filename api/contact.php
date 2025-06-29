<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['full_name']) || !isset($input['email']) || !isset($input['message'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Full name, email, and message are required']);
        exit;
    }
    
    $full_name = trim($input['full_name']);
    $email = trim($input['email']);
    $message = trim($input['message']);
    
    // Basic validation
    if (empty($full_name) || empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required']);
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        exit;
    }
    
    try {
        // Insert contact message into database
        $stmt = $pdo->prepare("INSERT INTO contact_messages (full_name, email, message) VALUES (?, ?, ?)");
        $stmt->execute([$full_name, $email, $message]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been sent successfully! Thank you for contacting me.'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error. Please try again later.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
?>
