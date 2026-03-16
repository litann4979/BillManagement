<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Feeder extends Model
{
    protected $fillable = ['name', 'section_id', 'voltage'];

    public function section()
{
    return $this->belongsTo(Section::class);
}

public function dtrs()
{
    return $this->hasMany(Dtr::class);
}
}