<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserDetail extends Model
{
    protected $fillable = [
        'user_id',
        'user_name',
        'user_unique_id',
        'aadhaar_no',
        'date_of_birth'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}