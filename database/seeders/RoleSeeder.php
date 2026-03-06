<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['name' => 'superadmin', 'access_type' => 'web'],
            ['name' => 'admin', 'access_type' => 'web'],
            ['name' => 'manager', 'access_type' => 'app'],
            ['name' => 'supervisor', 'access_type' => 'app'],
            ['name' => 'billcollector', 'access_type' => 'app'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}