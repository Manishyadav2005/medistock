import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";


export default function Staff() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

 const [deleteId, setDeleteId] = useState<string | null>(null);
 const [currentUserId, setCurrentUserId] = useState<string | null>(null);
const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
useEffect(() => {
  fetchUsers();

  const getRole = async () => {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  setCurrentUserId(user?.id || null); // 🔥 ADD THIS

  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setCurrentUserRole(data?.role);
  }
};

getRole();


}, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (!error) {
      setUsers(data);
    }
  };

  const handleCreate = async () => {
    if (!email || !password) {
      alert("All fields required");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
     toast.error(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          email,
          role,
        },
      ]);

      toast.success("User created successfully!");

      setEmail("");
      setPassword("");
      setRole("staff");

      fetchUsers(); // 🔥 refresh table
    }

    setLoading(false);
  };
  
const updateRole = async (id: string, newRole: string) => {
    console.log("Update Role Clicked", id, newRole);
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", id);

  if (!error) {
    fetchUsers();
  } else {
   toast.error("Failed to update role");
  }
};
const deleteUser = (id: string) => {
    console.log("Delete Clicked", id);
  setDeleteId(id); // modal open
};
  const confirmDelete = async () => {
  if (!deleteId) return;

  console.log("Deleting user:", deleteId);

  // 🔥 DELETE FROM profiles
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", deleteId);

  if (!error) {
    toast.success("User deleted successfully");

    // 🔥 तुरंत UI refresh
    setUsers((prev) => prev.filter((u) => u.id !== deleteId));

  } else {
    toast.error("Delete failed");
  }

  setDeleteId(null);
};
if (currentUserRole !== "admin") {
  return (
    <div className="text-center mt-10 text-red-500 font-semibold">
      Access Denied - Admin Only
    </div>
  );
}
  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">Create Staff / Admin</h1>

      <input
        className="w-full border p-2 rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        className="w-full border p-2 rounded"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={handleCreate}
        className="w-full bg-green-600 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Create User"}
      </button>

      {/* 🔥 USER TABLE */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">All Users</h2>

       <table className="w-full border rounded-lg overflow-hidden shadow">
          <thead>
           <tr className="bg-gray-200 text-left">
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
                <th className="p-2 border">Action</th>
            </tr>
          </thead>

        <tbody>
  {users.map((user) => (
    <tr key={user.id}>
      <td className="p-2 border">{user.email}</td>

      <td className="p-2 border">
        <select
          value={user.role}
          disabled={currentUserRole !== "admin"}
          onChange={(e) => {
  if (user.id === currentUserId) {
    toast.error("You cannot change your own role");
    return;
  }

  updateRole(user.id, e.target.value);
}}
          className="border p-1 rounded"
        >
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
          
        </select>
      </td>

      <td className="p-2 border">
       {currentUserRole === "admin" && (
  <button
    onClick={() => {
      if (user.id === currentUserId) {
        toast.error("You cannot delete yourself");
        return;
      }

      deleteUser(user.id);
    }}
    className="bg-red-500 hover:bg-red-600 transition text-white px-3 py-1 rounded"
  >
    Delete
  </button>
)}
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
      {deleteId && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
      <p className="mb-4">Are you sure you want to delete this user?</p>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setDeleteId(null)}
          className="px-3 py-1 border rounded"
        >
          Cancel
        </button>

        <button
          onClick={confirmDelete}
          className="px-3 py-1 bg-red-500 text-white rounded"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}