<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'subject',
        'body',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    public function render(array $data = []): array
    {
        $subject = $this->subject;
        $body = $this->body;

        foreach ($data as $key => $val) {
            $subject = str_replace('{{' . $key . '}}', (string) $val, $subject);
            $body = str_replace('{{' . $key . '}}', (string) $val, $body);
        }

        return [
            'subject' => $subject,
            'body' => $body,
        ];
    }
}
