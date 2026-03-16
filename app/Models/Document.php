<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $fillable = [
        'consumer_id',
        'document_type',
        'file_name',
        'file_path',
        'uploaded_by',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
