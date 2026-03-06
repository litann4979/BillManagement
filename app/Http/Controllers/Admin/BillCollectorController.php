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
            ->with('role')
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
            'name'=>'required',
            'email'=>'required|email|unique:users',
            'password'=>'required|min:6'
        ]);

        $role = Role::where('name','billcollector')->first();

        User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password),
            'role_id'=>$role->id,
            'created_by'=>auth()->id()
        ]);

        return redirect()->route('billcollectors.index');
    }

    public function edit($id)
    {
        $user = User::findOrFail($id);

        return Inertia::render('admin/billcollectors/edit',[
            'user'=>$user
        ]);
    }

    public function update(Request $request,$id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'=>'required',
            'email'=>"required|email|unique:users,email,$id"
        ]);

        $user->update([
            'name'=>$request->name,
            'email'=>$request->email
        ]);

        return redirect()->route('billcollectors.index');
    }

    public function destroy($id)
    {
        User::findOrFail($id)->delete();

        return redirect()->route('billcollectors.index');
    }
}