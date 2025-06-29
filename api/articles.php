<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch ($method) {
    case 'GET':
        getArticles($pdo);
        break;
        
    case 'POST':
        if (!isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            return;
        }
        createArticle($pdo, $input);
        break;
        
    case 'PUT':
        if (!isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            return;
        }
        updateArticle($pdo, $input);
        break;
        
    case 'DELETE':
        if (!isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            return;
        }
        deleteArticle($pdo, $input);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

function isAuthenticated() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

function getArticles($pdo) {
    try {
        $category = isset($_GET['category']) ? $_GET['category'] : null;
        $featured = isset($_GET['featured']) ? $_GET['featured'] : null;
        
        $sql = "SELECT * FROM articles WHERE 1=1";
        $params = [];
        
        if ($category) {
            $sql .= " AND category = ?";
            $params[] = $category;
        }
        
        if ($featured !== null) {
            $sql .= " AND featured = ?";
            $params[] = $featured === 'true' ? 1 : 0;
        }
        
        $sql .= " ORDER BY created_at DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $articles = $stmt->fetchAll();
        
        // Format the response
        foreach ($articles as &$article) {
            $article['featured'] = (bool)$article['featured'];
            $article['date'] = date('Y-m-d', strtotime($article['created_at']));
        }
        
        echo json_encode($articles);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function createArticle($pdo, $input) {
    if (!isset($input['title']) || !isset($input['content']) || !isset($input['category'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Title, content, and category are required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO articles (title, content, category, author, featured) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $input['title'],
            $input['content'],
            $input['category'],
            $_SESSION['username'],
            isset($input['featured']) ? ($input['featured'] ? 1 : 0) : 0
        ]);
        
        $articleId = $pdo->lastInsertId();
        
        // Get the created article
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $stmt->execute([$articleId]);
        $article = $stmt->fetch();
        
        $article['featured'] = (bool)$article['featured'];
        $article['date'] = date('Y-m-d', strtotime($article['created_at']));
        
        echo json_encode([
            'success' => true,
            'message' => 'Article created successfully',
            'article' => $article
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function updateArticle($pdo, $input) {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Article ID is required']);
        return;
    }
    
    try {
        $fields = [];
        $params = [];
        
        if (isset($input['title'])) {
            $fields[] = "title = ?";
            $params[] = $input['title'];
        }
        
        if (isset($input['content'])) {
            $fields[] = "content = ?";
            $params[] = $input['content'];
        }
        
        if (isset($input['category'])) {
            $fields[] = "category = ?";
            $params[] = $input['category'];
        }
        
        if (isset($input['featured'])) {
            $fields[] = "featured = ?";
            $params[] = $input['featured'] ? 1 : 0;
        }
        
        if (empty($fields)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            return;
        }
        
        $params[] = $input['id'];
        
        $sql = "UPDATE articles SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        // Get the updated article
        $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
        $stmt->execute([$input['id']]);
        $article = $stmt->fetch();
        
        if ($article) {
            $article['featured'] = (bool)$article['featured'];
            $article['date'] = date('Y-m-d', strtotime($article['created_at']));
            
            echo json_encode([
                'success' => true,
                'message' => 'Article updated successfully',
                'article' => $article
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

function deleteArticle($pdo, $input) {
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Article ID is required']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
        $stmt->execute([$input['id']]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Article deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}
?>
