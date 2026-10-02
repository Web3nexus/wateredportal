<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('membership_category_id')->constrained('membership_categories')->restrictOnDelete();
            $table->string('member_number')->unique()->index();
            $table->string('secure_qr_id', 64)->unique()->index();
            $table->enum('status', ['active', 'pending', 'suspended', 'deactivated'])->default('active')->index();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
        });

        Schema::create('member_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->date('date_of_birth')->nullable();
            $table->string('place_of_birth')->nullable();
            $table->string('current_location')->nullable();
            $table->string('phone')->nullable();
            $table->string('occupation')->nullable();
            $table->string('workplace')->nullable();
            $table->string('photograph_path')->nullable();
            $table->text('bio')->nullable();
            $table->json('pending_profile_update')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('member_profiles');
        Schema::dropIfExists('members');
    }
};

