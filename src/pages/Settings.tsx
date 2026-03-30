import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";

const tabs = [
  "General",
  "Inventory",
  "Billing",
  "Users",
  "Alerts",
  "Security",
  "System",
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");

  // ✅ form state INSIDE component
  const [formData, setFormData] = useState({
    pharmacyName: "",
    address: "",
    gst: "",
    license: "",
    contact: "",
    email: "",
  });
const [loading, setLoading] = useState(false);
const handleSaveGeneral = async () => {
  setLoading(true);

  const { data, error } = await supabase.from("settings").upsert([
    {
      pharmacy_name: formData.pharmacyName,
      address: formData.address,
      gst: formData.gst,
      license: formData.license,
      contact: formData.contact,
      email: formData.email,
    },
  ]);

  setLoading(false);

  if (error) {
    console.error("Error saving:", error);
    alert("❌ Error saving settings");
  } else {
    console.log("Saved successfully:", data);
  

// inside success
toast.success("Settings saved successfully");

// inside error
toast.error("Error saving settings");
  }
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-gray-500 mb-6">
        Manage your application settings here.
      </p>

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg border ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        {/* ✅ GENERAL SETTINGS */}
        {activeTab === "General" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Pharmacy Name"
              value={formData.pharmacyName}
              onChange={(e) =>
                setFormData({ ...formData, pharmacyName: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="GST Number"
              value={formData.gst}
              onChange={(e) =>
                setFormData({ ...formData, gst: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Drug License Number"
              value={formData.license}
              onChange={(e) =>
                setFormData({ ...formData, license: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="text"
              placeholder="Contact Number"
              value={formData.contact}
              onChange={(e) =>
                setFormData({ ...formData, contact: e.target.value })
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
<button
  onClick={handleSaveGeneral}
  disabled={loading}
  className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2 disabled:opacity-50"
>
  {loading ? "Saving..." : "Save Settings"}
</button>
          </div>
        )}

        {/* Other Tabs */}
      {activeTab === "Inventory" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <input
      type="number"
      placeholder="Low Stock Threshold"
      className="border p-2 rounded"
    />

    <input
      type="number"
      placeholder="Expiry Alert (Days)"
      className="border p-2 rounded"
    />

    <select className="border p-2 rounded">
      <option>Enable Batch Tracking</option>
      <option>Disable Batch Tracking</option>
    </select>

    <select className="border p-2 rounded">
      <option>Auto Stock Deduction ON</option>
      <option>Auto Stock Deduction OFF</option>
    </select>

    <select className="border p-2 rounded">
      <option>Unit Type: Tablet</option>
      <option>Unit Type: Strip</option>
      <option>Unit Type: Bottle</option>
    </select>

    <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
      Save Inventory Settings
    </button>

  </div>
)}
{activeTab === "Billing" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <input
      type="number"
      placeholder="Default Tax (%)"
      className="border p-2 rounded"
    />

    <select className="border p-2 rounded">
      <option>Enable GST Billing</option>
      <option>Disable GST Billing</option>
    </select>

    <input
      type="number"
      placeholder="Maximum Discount (%)"
      className="border p-2 rounded"
    />

    <select className="border p-2 rounded">
      <option>Auto Invoice Number</option>
      <option>Manual Invoice Number</option>
    </select>

    <select className="border p-2 rounded">
      <option>Auto Print: ON</option>
      <option>Auto Print: OFF</option>
    </select>

    <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
      Save Billing Settings
    </button>

  </div>
)}
       {activeTab === "Users" && (
  <div className="space-y-4">

    {/* Add User Form */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <input
        type="text"
        placeholder="Staff Name"
        className="border p-2 rounded"
      />

      <input
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
      />

      <select className="border p-2 rounded">
        <option>Select Role</option>
        <option>Admin</option>
        <option>Staff</option>
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded md:col-span-3">
        Add User
      </button>
    </div>

    {/* Users List */}
    <div className="border rounded p-4">
      <h2 className="font-semibold mb-2">Staff List</h2>

      <div className="flex justify-between items-center border-b py-2">
        <span>John Doe (Admin)</span>
        <button className="text-red-500">Remove</button>
      </div>

      <div className="flex justify-between items-center border-b py-2">
        <span>Jane Smith (Staff)</span>
        <button className="text-red-500">Remove</button>
      </div>

    </div>

  </div>
)}
     {activeTab === "Alerts" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <select className="border p-2 rounded">
      <option>Low Stock Alerts: ON</option>
      <option>Low Stock Alerts: OFF</option>
    </select>

    <select className="border p-2 rounded">
      <option>Expiry Alerts: ON</option>
      <option>Expiry Alerts: OFF</option>
    </select>

    <select className="border p-2 rounded">
      <option>Sound Notification: ON</option>
      <option>Sound Notification: OFF</option>
    </select>

    <select className="border p-2 rounded">
      <option>Email Alerts: OFF</option>
      <option>Email Alerts: ON</option>
    </select>

    <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
      Save Alert Settings
    </button>

  </div>
)}
    {activeTab === "Security" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <input
      type="password"
      placeholder="Current Password"
      className="border p-2 rounded"
    />

    <input
      type="password"
      placeholder="New Password"
      className="border p-2 rounded"
    />

    <input
      type="password"
      placeholder="Confirm New Password"
      className="border p-2 rounded"
    />

    <select className="border p-2 rounded">
      <option>Session Timeout: 15 min</option>
      <option>Session Timeout: 30 min</option>
      <option>Session Timeout: 1 hour</option>
    </select>

    <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
      Update Security Settings
    </button>

  </div>
)}
       {activeTab === "System" && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

    <select className="border p-2 rounded">
      <option>Theme: Light</option>
      <option>Theme: Dark</option>
    </select>

    <select className="border p-2 rounded">
      <option>Language: English</option>
      <option>Language: Hindi</option>
    </select>

    <select className="border p-2 rounded">
      <option>Currency: ₹ INR</option>
      <option>Currency: $ USD</option>
    </select>

    <select className="border p-2 rounded">
      <option>Date Format: DD/MM/YYYY</option>
      <option>Date Format: MM/DD/YYYY</option>
    </select>

    <button className="bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-200 text-white px-4 py-2 rounded col-span-1 md:col-span-2">
      Save System Preferences
    </button>

  </div>
)}
      </div>
    </div>
  );
}