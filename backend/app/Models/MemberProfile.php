<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'place_of_birth',
        'current_location',
        'phone',
        'occupation',
        'workplace',
        'photograph_path',
        'bio',
        'pending_profile_update',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'pending_profile_update' => 'array',
    ];

    protected $appends = [
        'full_name',
        'photograph_url',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getPhotographUrlAttribute(): ?string
    {
        if (!$this->photograph_path) {
            return null;
        }

        if (str_starts_with($this->photograph_path, 'http')) {
            return $this->photograph_path;
        }

        return asset('storage/' . $this->photograph_path);
    }
}

