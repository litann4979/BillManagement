<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumerFlag extends Model
{
    protected $fillable = [
        'consumer_id',
        'flag_type',
        'remarks',
        'created_by',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
