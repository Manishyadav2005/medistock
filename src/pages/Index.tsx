import { useUserRole } from "@/hooks/useUserRole";
import Dashboard from "./Dashboard";

export default function Index() {
  const { role, loading } = useUserRole();

  console.log("User Role:", role);

  if (loading) return <div>Loading...</div>;

  return <Dashboard />;
}