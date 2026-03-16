<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitLog extends Model
{
    protected $fillable = [
        'plan_id',
        'consumer_id',
        'visit_date',
        'visit_result',
        'remarks',
        'created_by',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }

    public function plan()
    {
        return $this->belongsTo(VisitPlan::class, 'plan_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
