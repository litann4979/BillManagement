<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitPlan extends Model
{
    protected $fillable = [
        'billcollector_id',
        'plan_date',
        'visit_time',
        'status',
    ];

    protected $casts = [
        'plan_date' => 'date',
    ];

    public function collector()
    {
        return $this->belongsTo(User::class, 'billcollector_id');
    }

    public function consumers()
    {
        return $this->hasMany(VisitPlanConsumer::class, 'plan_id');
    }

    public function visitLogs()
    {
        return $this->hasMany(VisitLog::class, 'plan_id');
    }
}
