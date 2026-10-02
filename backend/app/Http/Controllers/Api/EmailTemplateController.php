<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\EmailTemplate;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailTemplateController extends Controller
{
    public function index(): JsonResponse
    {
        $templates = EmailTemplate::all();
        return response()->json([
            'templates' => $templates,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);
        return response()->json([
            'template' => $template,
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $template->update($validated);

        AuditLog::record('email_template_updated', $template, [
            'template_code' => $template->code,
            'template_name' => $template->name,
        ], $request->user());

        return response()->json([
            'message' => 'Email template updated successfully.',
            'template' => $template,
        ]);
    }

    public function preview(Request $request, int $id): JsonResponse
    {
        $template = EmailTemplate::findOrFail($id);

        $sampleData = [
            'first_name' => $request->input('first_name', 'Tadesse'),
            'application_number' => $request->input('application_number', 'APP-2026-X83921'),
            'member_number' => $request->input('member_number', 'W-000104'),
            'portal_url' => url('/'),
            'site_name' => Setting::get('site_name', 'Watered'),
            'parent_website_url' => Setting::get('parent_website_url', 'http://mywatered.com/'),
            'code' => '482910',
            'subject' => $request->input('subject', $template->subject),
            'message_body' => $request->input('body', $template->body),
        ];

        $rendered = $template->render($sampleData);

        $siteLogo = Setting::get('site_logo_url');
        $emailLogo = Setting::get('email_logo_url');
        $logoSrc = !empty($emailLogo) ? $emailLogo : (!empty($siteLogo) ? $siteLogo : '');
        if ($logoSrc && !str_starts_with($logoSrc, 'http')) {
            $logoSrc = url($logoSrc);
        }

        $siteName = Setting::get('site_name', 'Watered');
        $parentUrl = Setting::get('parent_website_url', 'http://mywatered.com/');

        $logoHtml = $logoSrc
            ? "<img src=\"{$logoSrc}\" alt=\"{$siteName}\" style=\"max-height: 48px; max-width: 180px; margin: 0 auto; display: block;\" />"
            : '<div style="display: inline-block; width: 42px; height: 42px; line-height: 42px; border-radius: 4px; background: #966922; color: #ffffff; font-family: serif; font-size: 24px; font-weight: bold; text-align: center;">W</div>';

        $bodyParagraphs = nl2br(e($rendered['body']));

        $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{$rendered['subject']}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f5; margin: 0; padding: 40px 20px;">
    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2ddd3; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="background-color: #1a1918; padding: 24px 32px; text-align: center;">
            {$logoHtml}
            <h1 style="color: #ffffff; font-size: 16px; margin: 12px 0 0; font-weight: 500; letter-spacing: 0.05em; text-transform: uppercase;">{$siteName} Portal</h1>
        </div>
        <div style="padding: 32px; color: #2c2926; font-size: 14px; line-height: 1.7;">
            {$bodyParagraphs}
        </div>
        <div style="background-color: #f3f1eb; padding: 16px 32px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #e7e4dc;">
            © {$siteName} Portal • <a href="{$parentUrl}" style="color: #966922; text-decoration: none;">{$parentUrl}</a>
        </div>
    </div>
</body>
</html>
HTML;

        return response()->json([
            'rendered_subject' => $rendered['subject'],
            'rendered_body' => $rendered['body'],
            'html' => $html,
        ]);
    }
}
