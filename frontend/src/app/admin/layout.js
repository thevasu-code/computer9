import AdminViewTracker from "@/components/admin/AdminViewTracker";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminViewTracker />
      {children}
    </>
  );
}
