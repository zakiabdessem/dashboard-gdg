"use client";
import { AppSidebar } from "@/components/app-sidebar";
import LoadingIndicator from "@/components/LoadingIndicator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { client } from "@/lib/graphql";
import { ApolloProvider } from "@apollo/client";
// import { Loader } from "lucide-react";
import { useSession } from "next-auth/react";
// import Image from "next/image";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

function Userlayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // const router = useRouter();

  if (status === "loading") {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!session || status !== "authenticated") {
    return redirect("/auth/login");
  }

  return (
    <ApolloProvider client={client}>
      <SidebarProvider>
        <AppSidebar />
        <Toaster />
        <SidebarTrigger />
        {children}
      </SidebarProvider>
    </ApolloProvider>
  );
}

export default Userlayout;
