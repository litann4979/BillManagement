<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitPlanConsumer extends Model
{
    protected $fillable = ['plan_id', 'consumer_id'];

    public function plan()
    {
        return $this->belongsTo(VisitPlan::class, 'plan_id');
    }

    public function consumer()
    {
        return $this->belongsTo(Consumer::class);
    }
}
