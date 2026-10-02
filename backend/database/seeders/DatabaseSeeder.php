<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\MemberProfile;
use App\Models\MembershipApplication;
use App\Models\MembershipCategory;
use App\Models\Message;
use App\Models\MessageRecipient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Initial Membership Categories
        $categoriesData = [
            [
                'name' => 'Watered Standard',
                'code' => 'watered',
                'description' => 'The foundational tier of active Watered members.',
                'badge_color' => '#2563eb',
                'rank' => 1,
                'is_active' => true,
            ],
            [
                'name' => 'Senior Advisory Member',
                'code' => 'leopards_court',
                'description' => 'Senior stewards and experienced advisors.',
                'badge_color' => '#d4af37',
                'rank' => 2,
                'is_active' => true,
            ],
            [
                'name' => 'Associate Member',
                'code' => 'chokwe_initiates',
                'description' => 'Newly onboarded members completing professional orientation.',
                'badge_color' => '#10b981',
                'rank' => 3,
                'is_active' => true,
            ],
            [
                'name' => 'Professional Fellow',
                'code' => 'kemetic_court',
                'description' => 'Distinguished members leading education, science, and cultural initiatives.',
                'badge_color' => '#8b5cf6',
                'rank' => 4,
                'is_active' => true,
            ],
            [
                'name' => 'Community Steward',
                'code' => 'auset_court',
                'description' => 'Community leaders active in governance and member welfare.',
                'badge_color' => '#ec4899',
                'rank' => 5,
                'is_active' => true,
            ],
            [
                'name' => 'Records & Archive Lead',
                'code' => 'reminders_court',
                'description' => 'Custodians of institutional records and registry integrity.',
                'badge_color' => '#f59e0b',
                'rank' => 6,
                'is_active' => true,
            ],
            [
                'name' => 'Operations & Protocol Lead',
                'code' => 'hudorian_guard',
                'description' => 'Leaders handling institutional operations and protocols.',
                'badge_color' => '#ef4444',
                'rank' => 7,
                'is_active' => true,
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $cat) {
            $categories[$cat['code']] = MembershipCategory::updateOrCreate(
                ['code' => $cat['code']],
                $cat
            );
        }

        // 2. Admin Users
        User::updateOrCreate(
            ['email' => 'admin@mywatered.com'],
            [
                'name' => 'Watered Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@mywater.com'],
            [
                'name' => 'Watered Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        // 3. Member User 1: Kofi Mensah (Watered)
        $memberUser1 = User::updateOrCreate(
            ['email' => 'member@mywater.com'],
            [
                'name' => 'Kofi Mensah',
                'password' => Hash::make('password'),
                'role' => 'member',
                'status' => 'active',
            ]
        );

        $member1 = Member::updateOrCreate(
            ['user_id' => $memberUser1->id],
            [
                'membership_category_id' => $categories['watered']->id,
                'member_number' => 'MW-000123',
                'secure_qr_id' => 'sec_mw_' . Str::random(32),
                'status' => 'active',
                'joined_at' => now()->subMonths(6),
                'valid_until' => now()->addYears(2),
            ]
        );

        MemberProfile::updateOrCreate(
            ['member_id' => $member1->id],
            [
                'first_name' => 'Kofi',
                'last_name' => 'Mensah',
                'date_of_birth' => '1988-04-12',
                'place_of_birth' => 'Accra, Ghana',
                'current_location' => 'London, United Kingdom',
                'phone' => '+44 7700 900123',
                'occupation' => 'Architectural Designer',
                'workplace' => 'Mensah & Atelier Partners',
                'photograph_path' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
                'bio' => 'Dedicated member committed to urban heritage preservation and sustainable architectural spaces.',
            ]
        );

        // 4. Member User 2: Amina Diallo (Leopard's Court)
        $memberUser2 = User::updateOrCreate(
            ['email' => 'amina@mywater.com'],
            [
                'name' => 'Amina Diallo',
                'password' => Hash::make('password'),
                'role' => 'member',
                'status' => 'active',
            ]
        );

        $member2 = Member::updateOrCreate(
            ['user_id' => $memberUser2->id],
            [
                'membership_category_id' => $categories['leopards_court']->id,
                'member_number' => 'MW-000124',
                'secure_qr_id' => 'sec_mw_' . Str::random(32),
                'status' => 'active',
                'joined_at' => now()->subYear(),
                'valid_until' => now()->addYears(3),
            ]
        );

        MemberProfile::updateOrCreate(
            ['member_id' => $member2->id],
            [
                'first_name' => 'Amina',
                'last_name' => 'Diallo',
                'date_of_birth' => '1992-09-24',
                'place_of_birth' => 'Dakar, Senegal',
                'current_location' => 'Paris, France',
                'phone' => '+33 6 12 34 56 78',
                'occupation' => 'Biomedical Researcher',
                'workplace' => 'Institut Pasteur',
                'photograph_path' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
                'bio' => 'Senior researcher focused on equitable global health innovation and community wellness.',
            ]
        );

        // 5. Initial Membership Applications for Admin Review
        MembershipApplication::updateOrCreate(
            ['application_number' => 'APP-2026-00412'],
            [
                'membership_category_id' => $categories['chokwe_initiates']->id,
                'first_name' => 'Tariq',
                'last_name' => 'Al-Mansoor',
                'email' => 'tariq@example.com',
                'phone' => '+1 (555) 234-5678',
                'date_of_birth' => '1995-11-03',
                'place_of_birth' => 'Alexandria, Egypt',
                'current_location' => 'Toronto, Canada',
                'occupation' => 'Software Engineer',
                'workplace' => 'Apex Systems International',
                'photograph_path' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
                'personal_statement' => 'Seeking to contribute to the technological sovereignty and digital infrastructure of the MyWater community.',
                'status' => 'pending',
            ]
        );

        MembershipApplication::updateOrCreate(
            ['application_number' => 'APP-2026-00413'],
            [
                'membership_category_id' => $categories['kemetic_court']->id,
                'first_name' => 'Zoya',
                'last_name' => 'Patel',
                'email' => 'zoya@example.com',
                'phone' => '+44 7911 123456',
                'date_of_birth' => '1990-06-18',
                'place_of_birth' => 'Nairobi, Kenya',
                'current_location' => 'London, UK',
                'occupation' => 'Cultural Archivist',
                'workplace' => 'Heritage Foundations',
                'photograph_path' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
                'personal_statement' => 'Devoted to preserving African historical documents and indigenous botanical archives.',
                'status' => 'under_review',
                'reviewer_id' => $admin->id,
                'review_notes' => 'Credentials verified. Pending final security verification.',
                'reviewed_at' => now()->subDay(),
            ]
        );

        // 6. Messages & Announcements
        $msg1 = Message::updateOrCreate(
            ['subject' => 'Welcome to the MyWater Private Membership Portal'],
            [
                'sender_id' => $admin->id,
                'body' => "Welcome to the official digital portal of MyWater.\n\nThis portal acts as your authentic digital credential, secure verification gateway, and institutional communication channel.\n\nPlease inspect your Digital Membership Card, review your registered information, and ensure your identity details are accurate. Note that communications sent through this portal are strictly private and confidential.\n\nIn fellowship,\nMyWater High Council",
                'target_type' => 'all',
                'priority' => 'normal',
            ]
        );

        foreach ([$member1, $member2] as $m) {
            MessageRecipient::updateOrCreate(
                ['message_id' => $msg1->id, 'member_id' => $m->id],
                ['is_read' => true, 'read_at' => now()->subDays(2)]
            );
        }

        $msg2 = Message::updateOrCreate(
            ['subject' => "Assembly Protocol: Leopard's Court Quarterly Council"],
            [
                'sender_id' => $admin->id,
                'body' => "To all Stewards and Protectors of Leopard's Court:\n\nThe quarterly review of registry standards and prospective initiate recommendations will take place at the upcoming assembly. Please review your regional roll and bring verified records.\n\nDiscretion remains our highest code.\n\nMyWater Administration",
                'target_type' => 'category',
                'membership_category_id' => $categories['leopards_court']->id,
                'priority' => 'high',
            ]
        );

        MessageRecipient::updateOrCreate(
            ['message_id' => $msg2->id, 'member_id' => $member2->id],
            ['is_read' => false]
        );

        // 7. Audit Log Entry
        AuditLog::create([
            'user_id' => $admin->id,
            'action' => 'system_seed_initialized',
            'ip_address' => '127.0.0.1',
            'details' => ['message' => 'System registry seeded with official baseline membership tiers.'],
            'created_at' => now(),
        ]);
    }
}
