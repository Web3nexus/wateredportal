<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class EmailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'recipient_email',
        'recipient_name',
        'subject',
        'status',
        'tracking_token',
        'opened_at',
        'opens_count',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'opened_at' => 'datetime',
        'opens_count' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (empty($model->tracking_token)) {
                $model->tracking_token = Str::random(32);
            }
        });
    }

    public function markAsOpened(): void
    {
        $this->update([
            'status' => 'opened',
            'opened_at' => $this->opened_at ?? now(),
            'opens_count' => $this->opens_count + 1,
        ]);
    }
}
