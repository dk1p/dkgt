<?php
header('Content-Type: application/json');

function respond(bool $ok, string $message, int $code = 200, array $extra = []): void {
    http_response_code($code);
    echo json_encode(array_merge(['ok' => $ok, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

// --- Load .env (must be named exactly ".env", same folder as this file) ---
$env = [];
$envFile = __DIR__ . '/.env';
if (!is_readable($envFile)) {
    respond(false, 'Server config missing: ".env" file not found or unreadable (is it still named "_env"?).', 500);
}
foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) continue;
    [$k, $v] = explode('=', $line, 2);
    $env[trim($k)] = trim($v, " \t\"'");
}

$apiKey     = $env['RESEND_API_KEY'] ?? '';
$to         = $env['RECIPIENT_EMAIL'] ?? '';
$senderDom  = $env['RESEND_SENDER_DOMAIN'] ?? 'resend.dev';
$senderName = $env['RESEND_SENDER_NAME'] ?? 'Website Contact';
$debug      = strtolower($env['DEBUG_MODE'] ?? 'false') === 'true';

// resend.dev only allows onboarding@resend.dev; a verified domain can use any address
$fromAddr = ($senderDom === 'resend.dev') ? 'onboarding@resend.dev' : 'contact@' . $senderDom;
$from     = $senderName . ' <' . $fromAddr . '>';

if (!$apiKey || !$to) {
    respond(false, 'Server is not configured (missing RESEND_API_KEY or RECIPIENT_EMAIL).', 500);
}

// --- Input ---
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$phone   = trim($_POST['phone'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!empty($_POST['website'])) {            // honeypot
    respond(true, 'Thank you!');
}

if ($name === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please fill in all required fields with valid details.', 422);
}

$allowedSubjects = [
    'Website Development', 'SEO Optimization', 'Digital Marketing',
    'UI/UX Design', 'E-Commerce Solutions', 'General Inquiry'
];
if (!in_array($subject, $allowedSubjects, true)) {
    respond(false, 'Invalid subject.', 422);
}

$e = fn($s) => htmlspecialchars($s, ENT_QUOTES, 'UTF-8');

$html = "
  <h2>New contact form message</h2>
  <p><strong>Name:</strong> {$e($name)}</p>
  <p><strong>Email:</strong> {$e($email)}</p>
  <p><strong>Phone:</strong> " . ($phone !== '' ? $e($phone) : '—') . "</p>
  <p><strong>Subject:</strong> {$e($subject)}</p>
  <p><strong>Message:</strong></p>
  <p>" . nl2br($e($message)) . "</p>
";

$payload = json_encode([
    'from'     => $from,
    'to'       => [$to],
    'reply_to' => $email,
    'subject'  => "New enquiry: {$subject} - {$name}",
    'html'     => $html,
], JSON_UNESCAPED_UNICODE);

// --- Send via Resend ---
if (!function_exists('curl_init')) {
    respond(false, 'PHP cURL extension is not enabled on this server.', 500);
}

$ch = curl_init('https://api.resend.com/emails');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'User-Agent: dk-contact-form/1.0',   // Resend rejects requests without a User-Agent
    ],
    CURLOPT_POSTFIELDS     => $payload,
]);
$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($response === false || $status < 200 || $status >= 300) {
    $detail = $curlErr ?: $response;
    error_log("Resend error ($status): " . $detail);
    respond(
        false,
        $debug ? "Resend error ($status): $detail"
               : 'Sorry, we could not send your message. Please try again later.',
        502
    );
}

respond(true, 'Thank you! Your message has been sent. We will reply within 24 hours.');