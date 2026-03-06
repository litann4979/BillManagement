<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get roles
        $superadminRole = Role::where('name', 'superadmin')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $managerRole = Role::where('name', 'manager')->first();
        $supervisorRole = Role::where('name', 'supervisor')->first();
        $billcollectorRole = Role::where('name', 'billcollector')->first();

        // 1️⃣ SuperAdmin
        $superadmin = User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'role_id' => $superadminRole->id,
                'created_by' => null,
                'is_active' => true,
            ]
        );

        // 2️⃣ Admin (created by SuperAdmin)
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role_id' => $adminRole->id,
                'created_by' => $superadmin->id,
                'is_active' => true,
            ]
        );

        // 3️⃣ Manager (created by Admin)
        $manager = User::updateOrCreate(
            ['email' => 'manager@example.com'],
            [
                'name' => 'Manager User',
                'password' => Hash::make('password'),
                'role_id' => $managerRole->id,
                'created_by' => $admin->id,
                'is_active' => true,
            ]
        );

        // 4️⃣ Supervisor (created by Manager)
        $supervisor = User::updateOrCreate(
            ['email' => 'supervisor@example.com'],
            [
                'name' => 'Supervisor User',
                'password' => Hash::make('password'),
                'role_id' => $supervisorRole->id,
                'created_by' => $manager->id,
                'is_active' => true,
            ]
        );

        // 5️⃣ BillCollector (created by Supervisor)
        User::updateOrCreate(
            ['email' => 'billcollector@example.com'],
            [
                'name' => 'Bill Collector User',
                'password' => Hash::make('password'),
                'role_id' => $billcollectorRole->id,
                'created_by' => $supervisor->id,
                'is_active' => true,
            ]
        );
    }
}