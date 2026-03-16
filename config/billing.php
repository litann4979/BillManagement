<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Subdivision ID
    |--------------------------------------------------------------------------
    |
    | When the importer auto-creates a Section that is not yet associated with
    | a Subdivision, this ID is used as the fallback foreign key.
    |
    */

    'default_subdivision_id' => (int) env('BILLING_DEFAULT_SUBDIVISION_ID', 1),

];
