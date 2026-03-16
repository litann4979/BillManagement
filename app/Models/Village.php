<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Village extends Model
{
    protected $fillable = ['name', 'section_id'];

public function section()
{
    return $this->belongsTo(Section::class);
}

public function consumers()
{
    return $this->hasMany(Consumer::class);
}
}
