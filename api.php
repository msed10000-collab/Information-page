<?php
header('Content-Type: application/json');
session_start();

// التحقق من كلمة المرور (لن يتم تنفيذ أي أمر دون تسجيل الدخول من الواجهة)
// لكن الواجهة تتحكم بعرض المحتوى، وهنا نعتمد على أن الطلبات تأتي بعد تسجيل الدخول.
// يمكن إضافة تحقق إضافي (مثلاً توكن) لكنه ليس ضرورياً لهذا المثال.

define('BOTS_DIR', __DIR__ . '/bots/');
define('BOTS_JSON', __DIR__ . '/bots.json');
if (!file_exists(BOTS_DIR)) mkdir(BOTS_DIR, 0777, true);

function loadBots() {
    if (!file_exists(BOTS_JSON)) return [];
    return json_decode(file_get_contents(BOTS_JSON), true) ?: [];
}

function saveBots($bots) {
    file_put_contents(BOTS_JSON, json_encode($bots, JSON_PRETTY_PRINT));
}

function isProcessRunning($pid) {
    if (!$pid) return false;
    exec("ps -p $pid 2>&1", $output, $return);
    return $return === 0;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

if ($action === 'list') {
    $bots = loadBots();
    foreach ($bots as &$bot) {
        if ($bot['status'] === 'running' && !isProcessRunning($bot['pid'])) {
            $bot['status'] = 'stopped';
            $bot['pid'] = null;
        }
    }
    saveBots($bots);
    echo json_encode($bots);
    exit;
}

if ($action === 'start' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $bots = loadBots();
    if (isset($bots[$id]) && $bots[$id]['status'] !== 'running') {
        $scriptPath = BOTS_DIR . $bots[$id]['script'];
        if (file_exists($scriptPath)) {
            $logFile = __DIR__ . '/logs/' . $id . '.log';
            if (!file_exists(__DIR__ . '/logs')) mkdir(__DIR__ . '/logs', 0777, true);
            $cmd = "php " . escapeshellarg($scriptPath) . " > " . escapeshellarg($logFile) . " 2>&1 & echo $!";
            $pid = trim(shell_exec($cmd));
            if (is_numeric($pid)) {
                $bots[$id]['pid'] = (int)$pid;
                $bots[$id]['status'] = 'running';
                saveBots($bots);
                echo json_encode(['success' => true, 'message' => 'تم التشغيل']);
                exit;
            }
        }
    }
    echo json_encode(['success' => false, 'message' => 'فشل التشغيل']);
    exit;
}

if ($action === 'stop' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $bots = loadBots();
    if (isset($bots[$id]) && $bots[$id]['status'] === 'running' && $bots[$id]['pid']) {
        exec("kill -9 " . $bots[$id]['pid']);
        $bots[$id]['pid'] = null;
        $bots[$id]['status'] = 'stopped';
        saveBots($bots);
        echo json_encode(['success' => true, 'message' => 'تم الإيقاف']);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'البوت ليس قيد التشغيل']);
    exit;
}

if ($action === 'restart' && isset($_GET['id'])) {
    // تنفيذ إعادة تشغيل: إيقاف ثم تشغيل
    $id = $_GET['id'];
    $bots = loadBots();
    if (isset($bots[$id]) && $bots[$id]['status'] === 'running' && $bots[$id]['pid']) {
        exec("kill -9 " . $bots[$id]['pid']);
        $bots[$id]['pid'] = null;
        $bots[$id]['status'] = 'stopped';
        saveBots($bots);
        sleep(1);
    }
    // إعادة التشغيل
    if (isset($bots[$id])) {
        $scriptPath = BOTS_DIR . $bots[$id]['script'];
        if (file_exists($scriptPath)) {
            $logFile = __DIR__ . '/logs/' . $id . '.log';
            $cmd = "php " . escapeshellarg($scriptPath) . " > " . escapeshellarg($logFile) . " 2>&1 & echo $!";
            $pid = trim(shell_exec($cmd));
            if (is_numeric($pid)) {
                $bots[$id]['pid'] = (int)$pid;
                $bots[$id]['status'] = 'running';
                saveBots($bots);
                echo json_encode(['success' => true, 'message' => 'تمت إعادة التشغيل']);
                exit;
            }
        }
    }
    echo json_encode(['success' => false, 'message' => 'فشل إعادة التشغيل']);
    exit;
}

if ($action === 'delete' && isset($_GET['id'])) {
    $id = $_GET['id'];
    $bots = loadBots();
    if (isset($bots[$id])) {
        // إيقاف إذا كان يعمل
        if ($bots[$id]['status'] === 'running' && $bots[$id]['pid']) {
            exec("kill -9 " . $bots[$id]['pid']);
        }
        // حذف الملف
        $scriptFile = BOTS_DIR . $bots[$id]['script'];
        if (file_exists($scriptFile)) unlink($scriptFile);
        unset($bots[$id]);
        saveBots($bots);
        echo json_encode(['success' => true, 'message' => 'تم الحذف']);
        exit;
    }
    echo json_encode(['success' => false, 'message' => 'البوت غير موجود']);
    exit;
}

if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['bot_file']) && $_FILES['bot_file']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['bot_file']['name'], PATHINFO_EXTENSION);
        if ($ext !== 'php') {
            echo json_encode(['success' => false, 'message' => 'يجب أن يكون الملف بصيغة PHP']);
            exit;
        }
        $newName = uniqid() . '_' . basename($_FILES['bot_file']['name']);
        $target = BOTS_DIR . $newName;
        if (move_uploaded_file($_FILES['bot_file']['tmp_name'], $target)) {
            $bots = loadBots();
            $newId = uniqid();
            $bots[$newId] = [
                'id' => $newId,
                'name' => $_POST['bot_name'] ?: pathinfo($_FILES['bot_file']['name'], PATHINFO_FILENAME),
                'script' => $newName,
                'pid' => null,
                'status' => 'stopped',
                'parent_id' => !empty($_POST['parent_id']) ? $_POST['parent_id'] : null,
                'created' => date('Y-m-d H:i:s')
            ];
            saveBots($bots);
            echo json_encode(['success' => true, 'message' => 'تم الرفع بنجاح']);
            exit;
        }
    }
    echo json_encode(['success' => false, 'message' => 'فشل الرفع']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'طلب غير صالح']);
