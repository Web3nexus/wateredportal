<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Mail\Mailer as LaravelMailer;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;

class SendingEmailAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'from_name',
        'from_email',
        'reply_to_email',
        'smtp_host',
        'smtp_port',
        'smtp_username',
        'smtp_password',
        'smtp_encryption',
        'is_default',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'smtp_port' => 'integer',
    ];

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sending_account_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeDefaultAccount($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Create a self-contained, dynamic Laravel mailer instance using this account's SMTP credentials
     */
    public function createMailer(): LaravelMailer
    {
        $port = (int) ($this->smtp_port ?: 587);

        $transport = \App\Services\EmailService::buildTransport(
            $this->smtp_host ?: '127.0.0.1',
            $port,
            $this->smtp_encryption,
            $this->smtp_username,
            $this->smtp_password
        );

        $mailer = new LaravelMailer(
            'account_' . $this->id . '_' . uniqid(),
            app('view'),
            $transport,
            app('events')
        );

        $mailer->alwaysFrom($this->from_email, $this->from_name);
        $mailer->alwaysReturnPath($this->from_email);

        return $mailer;
    }
}
