import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // 🔹 Fetch user
useEffect(() => {
  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (data.user) {
      setUser(data.user);

      setFormData({
        name: data.user.user_metadata?.full_name || "",
        email: data.user.email || "",
      });

      // ✅ Avatar load
      setAvatarUrl(data.user.user_metadata?.avatar_url || null);
    }
  };

  fetchUser();
}, []);

  // 🔹 Save profile
  const handleSave = async () => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      email: formData.email,
      data: {
        full_name: formData.name,
      },
    });

    setLoading(false);

    if (error) {
      toast.error("❌ Failed to update profile");
    } else {
      toast.success("✅ Profile updated successfully");
    }
  };

const handleUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileName = `${user.id}-${Date.now()}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(fileName, file);

  if (error) {
    console.log(error);
    alert("Upload failed ❌");
    return;
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(fileName);

  const publicUrl = data.publicUrl;

  setAvatarUrl(publicUrl);

  // Save in user metadata
  await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  alert("Photo updated ✅");
};

  return (
    <div className="max-w-3xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border space-y-6">

        {/* Avatar */}
        <div className="flex items-center gap-4">
         <div className="flex items-center gap-4">

  <div className="relative">
      <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
        {formData.name?.charAt(0).toUpperCase() || "U"}
      </div>

    {/* Upload Button */}
    <label className="absolute bottom-0 right-0 bg-black text-white text-xs px-1 rounded cursor-pointer">
      +
   <input
  type="file"
  disabled
  className="hidden"
/>
    </label>
  </div>

  <div>
    <p className="font-semibold">{formData.name || "User"}</p>
    <p className="text-sm text-gray-500">{formData.email}</p>
  </div>

</div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border p-2 rounded"
          />

        </div>

        {/* Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>

      </div>
    </div>
  );
}