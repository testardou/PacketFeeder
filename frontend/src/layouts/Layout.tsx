import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/navbar/Navbar";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <>
      {/* <SidebarProvider> */}
      <Navbar />
      <main style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </main>
      {/* </SidebarProvider> */}
    </>
  );
}
