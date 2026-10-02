<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_number',
        'membership_category_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'place_of_birth',
        'current_location',
        'occupation',
        'workplace',
        'photograph_path',
        'personal_statement',
        'status',
        'reviewer_id',
        'review_notes',
        'reviewed_at',
        'user_id',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'reviewed_at' => 'datetime',
    ];

    protected $appends = [
        'full_name',
        'photograph_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(MembershipCategory::class, 'membership_category_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
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

