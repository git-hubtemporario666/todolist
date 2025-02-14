<?php
header("Content-Type: application/json");

$host = 'mysql';
$user = 'mysql';
$pass = 'mysql';
$dbname = 'todolist';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action == 'fetch') {
    $tasks = ["routine" => [], "daily" => []];

    // Buscar todas as tarefas de rotina
    $result = $conn->query("SELECT * FROM tasks WHERE type = 'routine'");
    while ($row = $result->fetch_assoc()) {
        $tasks['routine'][] = $row;
    }

    // Buscar todas as tarefas diárias
    $result = $conn->query("SELECT * FROM tasks WHERE type = 'daily'");
    while ($row = $result->fetch_assoc()) {
        $tasks['daily'][] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'fetch_by_date') {
    $date = $_GET['date'] ?? date('Y-m-d');
    $tasks = ["routine" => [], "daily" => []];

    // Filtrar apenas tarefas diárias para a data
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE type = 'daily' AND date = ?");
    $stmt->bind_param("s", $date);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks['daily'][] = $row;
    }

    // Buscar todas as tarefas de rotina sem filtrar por data
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE type = 'routine'");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks['routine'][] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'fetch_by_type') {
    $type = $_GET['type'];
    $tasks = [];

    // Filtrar apenas tarefas diárias para a data
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE type = ?");
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'fetch_by_priority') {
    $priority = $_GET['priority'];
    $tasks = [];

    // Filtrar apenas tarefas diárias para a data
    $stmt = $conn->prepare("SELECT * FROM tasks WHERE priority = ?");
    $stmt->bind_param("s", $priority);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'fetch_all') {
    $tasks = [];

    // Filtrar apenas tarefas diárias para a data
    $stmt = $conn->prepare("SELECT * FROM tasks ORDER BY `date` DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'fetch_by_completed') {
    $completed = $_GET['completed'];
    $tasks = [];

    $stmt = $conn->prepare("SELECT * FROM tasks WHERE completed = ? ORDER BY `date` DESC");
    $stmt->bind_param("s", $completed);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $tasks[] = $row;
    }

    echo json_encode($tasks);
    exit;
}

if ($action == 'add') {
    $data = json_decode(file_get_contents("php://input"), true);

    $name = $conn->real_escape_string($data['name']);
    $date = $conn->real_escape_string($data['date']);
    $time = $conn->real_escape_string($data['time']);
    $priority = $conn->real_escape_string($data['priority']);
    $type = $conn->real_escape_string($data['type']);

    // Se for do tipo 'routine', defina priority como NULL
    if ($type == 'routine') {
        $priority = NULL;
    }

    $sql = "INSERT INTO tasks (name, date, time, priority, type, completed) 
            VALUES ('$name', '$date', '$time', " . ($priority === NULL ? "NULL" : "'$priority'") . ", '$type', 0)";

    if (!$conn->query($sql)) {
        echo json_encode(["error" => "Insert failed: " . $conn->error]);
        exit;
    }

    echo json_encode(["success" => true]);
    exit;
}

if ($action == 'update') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id']);
    $name = $conn->real_escape_string($data['name']);

    $conn->query("UPDATE tasks SET name='$name' WHERE id=$id");
    echo json_encode(["success" => true]);
    exit;
}

if ($action == 'delete') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id']);

    $conn->query("DELETE FROM tasks WHERE id=$id");
    echo json_encode(["success" => true]);
    exit;
}

if ($action == 'toggle') {
    $data = json_decode(file_get_contents("php://input"), true);
    $id = intval($data['id']);

    $conn->query("UPDATE tasks SET completed = NOT completed WHERE id=$id");
    echo json_encode(["success" => true]);
    exit;
}

$conn->close();
?>
