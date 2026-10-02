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
        Schema::create('sending_email_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g. "Executive Secretariat", "General Council", "Member Relations"
            $table->string('from_name');
            $table->string('from_email');
            $table->string('reply_to_email')->nullable();
            $table->string('smtp_host');
            $table->integer('smtp_port')->default(587);
            $table->string('smtp_username')->nullable();
            $table->text('smtp_password')->nullable();
            $table->string('smtp_encryption')->default('tls'); // tls, ssl, none
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->string('description', 500)->nullable();
            $table->timestamps();
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('sending_account_id')
                ->nullable()
                ->after('sender_id')
                ->constrained('sending_email_accounts')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['sending_account_id']);
            $table->dropColumn('sending_account_id');
        });

        Schema::dropIfExists('sending_email_accounts');
    }
};
