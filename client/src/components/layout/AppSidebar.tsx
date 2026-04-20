'use client';

import { useStore } from "@/context/StoreContext";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar";
import { Store, ShoppingCart, PlusCircle, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const { activeStoreId, setActiveStoreId } = useStore();

  const { data: stores, isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/stores`);
      return res.data.data;
    }
  });

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6" /> M-OMS
        </h2>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-muted-foreground px-1">Active Store</label>
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select 
               value={activeStoreId?.toString() || ""} 
               onValueChange={(val) => setActiveStoreId(Number(val))}
            >
              <SelectTrigger className="w-full bg-background border-border shrink-0 focus:ring-1">
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                      {store.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase font-bold tracking-wider">Orders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/" className="w-full">
                  <SidebarMenuButton tooltip="View Orders">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className="font-medium">All Orders</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/orders/new" className="w-full">
                  <SidebarMenuButton tooltip="Create Order">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">New Order</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/stores" className="w-full">
                  <SidebarMenuButton tooltip="Manage Stores">
                    <Store className="w-4 h-4 mr-2" />
                    <span className="font-medium">Stores</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
