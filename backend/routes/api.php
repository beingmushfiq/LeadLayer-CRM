<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\CalendarEventController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\EmailCampaignController;
use App\Http\Controllers\Api\AnalyticsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| LeadLayer CRM — API Routes
|--------------------------------------------------------------------------
|
| Public routes: register, login
| Protected routes: all CRM operations (scoped by tenant middleware)
|
*/

// ── Public (Unauthenticated) ────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ── Super Admin (System God-Mode) ───────────────────
Route::middleware(['auth:sanctum', 'superadmin'])->prefix('admin')->group(function () {
    Route::get('/metrics', [\App\Http\Controllers\Api\SuperAdminController::class, 'metrics']);
    Route::get('/tenants', [\App\Http\Controllers\Api\SuperAdminController::class, 'tenants']);
});

// ── Protected (Authenticated + Tenant-Scoped) ───────
Route::middleware(['auth:sanctum', 'tenant'])->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Roles & Permissions (in-app RBAC management)
    Route::middleware('permission:roles.manage')->group(function () {
        Route::apiResource('roles', RoleController::class);
        Route::get('/permissions', [RoleController::class, 'permissions']);
    });

    // ── Placeholder route groups for future phases ──
    // These will be built out in subsequent phases

    // Leads
    Route::apiResource('leads', \App\Http\Controllers\Api\LeadController::class);
    Route::post('/leads/{lead}/convert', [\App\Http\Controllers\Api\LeadController::class, 'convert']);

    // Contacts
    Route::apiResource('contacts', \App\Http\Controllers\Api\ContactController::class);

    // Accounts
    Route::apiResource('accounts', \App\Http\Controllers\Api\AccountController::class);

    // Deals & Pipelines
    Route::apiResource('pipelines', \App\Http\Controllers\Api\PipelineController::class);
    Route::apiResource('deals', \App\Http\Controllers\Api\DealController::class);
    Route::patch('/deals/{deal}/kanban', [\App\Http\Controllers\Api\DealController::class, 'kanbanUpdate']);

    // Tasks
    Route::apiResource('tasks', TaskController::class);
    Route::patch('/tasks/{task}/toggle', [TaskController::class, 'toggleComplete']);

    // Calendar
    Route::apiResource('calendar-events', CalendarEventController::class);

    // Invoices
    Route::apiResource('invoices', \App\Http\Controllers\Api\InvoiceController::class);

    // Email Campaigns
    Route::apiResource('email-campaigns', EmailCampaignController::class);
    Route::post('email-campaigns/{campaign}/send', [EmailCampaignController::class, 'send']);

    // Analytics
    Route::get('analytics/dashboard', [AnalyticsController::class, 'getDashboardStats']);
    Route::get('analytics/marketing', [AnalyticsController::class, 'getMarketingStats']);

    // WhatsApp
    Route::group(['prefix' => 'whatsapp'], function () {
        Route::get('/config', [\App\Http\Controllers\Api\WhatsappConfigController::class, 'show']);
        Route::post('/config', [\App\Http\Controllers\Api\WhatsappConfigController::class, 'update']);
        
        Route::apiResource('conversations', \App\Http\Controllers\Api\WhatsappConversationController::class)->only(['index', 'show', 'update']);
        Route::post('/messages', [\App\Http\Controllers\Api\WhatsappMessageController::class, 'store']);
    });

    // Analytics
    // Route::prefix('analytics')->group(function () { ... });
});

// ── Webhook Routes (no auth) ────────────────────────
Route::prefix('webhook/whatsapp')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\WhatsappWebhookController::class, 'verify']);
    Route::post('/', [\App\Http\Controllers\Api\WhatsappWebhookController::class, 'process']);
});
