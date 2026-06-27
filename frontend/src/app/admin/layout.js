import AdminViewTracker from "@/components/admin/AdminViewTracker";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <>
      <AdminViewTracker />
      <div className="flex min-h-[calc(100vh-64px)]">
        <AdminSidebar />
        <main className="flex-1 min-w-0 bg-gray-50">
          {children}
        </main>
      </div>
    </>
  );
}
