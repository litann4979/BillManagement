<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    protected $fillable = ['name', 'subdivision_id'];

 public function subdivision()
{
    return $this->belongsTo(Subdivision::class);
}

public function villages()
{
    return $this->hasMany(Village::class);
}

public function feeders()
{
    return $this->hasMany(Feeder::class);
}
}