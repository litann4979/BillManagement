<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subdivision extends Model
{
    protected $fillable = ['name', 'division_id'];

   public function division()
{
    return $this->belongsTo(Division::class);
}

public function sections()
{
    return $this->hasMany(Section::class);
}
}