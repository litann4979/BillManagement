<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dtr extends Model
{
    protected $fillable = ['dtr_name', 'dtr_code', 'capacity', 'feeder_id'];

 public function feeder()
{
    return $this->belongsTo(Feeder::class);
}

public function consumers()
{
    return $this->hasMany(Consumer::class);
}
}
