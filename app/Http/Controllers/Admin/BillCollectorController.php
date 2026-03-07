<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BillCollectorController extends Controller
{
    public function index()
    {
        $billRole = Role::where('name','billcollector')->first();

        $billCollectors = User::where('role_id',$billRole->id)
            ->with(['role','details'])
            ->latest()
            ->get();

        return Inertia::render('admin/billcollectors/index',[
    'billCollectors'=>$billCollectors
]);
    }

    public function create()
    {
        return Inertia::render('admin/billcollectors/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'              => 'required',
            'email'             => 'required|email|unique:users',
            'user_unique_id'    => 'required|unique:user_details,user_unique_id',
            'aadhaar_no'        => 'nullable|digits:12',
            'date_of_birth'     => 'nullable|date',
            'password'          => 'nullable|min:6',
        ]);

        // Auto-generate password: first 4 of unique_id + last 4 of DOB
        $password = $request->password;
        if (empty($password)) {
            $uniquePart = substr($request->user_unique_id, 0, 4);
            $dobPart    = $request->date_of_birth
                          ? substr(str_replace('-', '', $request->date_of_birth), -4)
                          : '0000';
            $password   = $uniquePart . $dobPart;
        }

        $role = Role::where('name','billcollector')->first();

        $user = User::create([
            'name'       => $request->name,
            'email'      => $request->email,
            'password'   => Hash::make($password),
            'role_id'    => $role->id,
            'created_by' => auth()->id()
        ]);

        $user->details()->create([
            'user_name'      => $request->name,
            'user_unique_id' => $request->user_unique_id,
            'aadhaar_no'     => $request->aadhaar_no,
            'date_of_birth'  => $request->date_of_birth,
        ]);

        return redirect()->route('billcollectors.index');
    }

   public function edit($id)
{
    $user = User::with('details')->findOrFail($id);

    // Format DOB to YYYY-MM-DD so the HTML5 date input can read it
    if ($user->details && $user->details->date_of_birth) {
        $user->details->date_of_birth = \Carbon\Carbon::parse($user->details->date_of_birth)->format('Y-m-d');
    }

    return Inertia::render('admin/billcollectors/edit', [
        'user' => $user
    ]);
}

    public function update(Request $request,$id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'           => 'required',
            'email'          => "required|email|unique:users,email,$id",
            'user_unique_id' => "required|unique:user_details,user_unique_id,{$user->details?->id}",
            'aadhaar_no'     => 'nullable|digits:12',
            'date_of_birth'  => 'nullable|date',
        ]);

        $user->update([
            'name'  => $request->name,
            'email' => $request->email
        ]);

        $user->details()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'user_name'      => $request->name,
                'user_unique_id' => $request->user_unique_id,
                'aadhaar_no'     => $request->aadhaar_no,
                'date_of_birth'  => $request->date_of_birth,
            ]
        );

        return redirect()->route('billcollectors.index');
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return redirect()->route('billcollectors.index');
    }
}