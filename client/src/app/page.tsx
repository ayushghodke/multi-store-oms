'use client';

import { useStore } from "@/context/StoreContext";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: number;
  total_amount: string;
  status: string;
  created_at: string;
  order_items: { id: number, product_name: string, quantity: number, price: string }[];
}

interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

export default function OrdersPage() {
  const { activeStoreId } = useStore();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  // Subscribe to Supabase Realtime for live order updates
  useRealtimeOrders(activeStoreId);

  // Reset page when switching stores
  useEffect(() => {
    setPage(1);
  }, [activeStoreId]);

  const { data: response, isLoading, isError } = useQuery<OrdersResponse>({
    queryKey: ['orders', activeStoreId, page],
    queryFn: async () => {
      const url = activeStoreId 
        ? `/api/orders?store_id=${activeStoreId}&page=${page}&limit=10`
        : `/api/orders?page=${page}&limit=10`;
      const res = await axios.get(url);
      return res.data;
    }
  });

  const orders = response?.data || [];
  const meta = response?.meta;

  const mutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await axios.patch(`/api/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  return (
    <div className="space-y-6">
      <StatsOverview />
      
      <Card className="w-full shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-2xl font-black">All Orders</CardTitle>
          <CardDescription className="text-sm">
            {activeStoreId 
              ? `Viewing orders exclusively for Store #${activeStoreId}` 
              : "Viewing orders across all your storefronts."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="flex h-32 items-center justify-center text-red-500 font-medium border border-red-100 rounded-md bg-red-50">
              Failed to load orders. Please ensure your backend is running.
            </div>
          ) : orders?.length === 0 ? (
            <div className="flex bg-slate-50 h-32 items-center justify-center text-slate-500 border border-slate-200 border-dashed rounded-lg shadow-inner">
              No orders found for this selection.
            </div>
          ) : (
            <div className="border rounded-md bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="w-[100px] font-bold">Order ID</TableHead>
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Total Items</TableHead>
                    <TableHead className="font-bold text-emerald-700">Total Amount</TableHead>
                    <TableHead className="text-right font-bold w-[200px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-medium text-slate-700">#{order.id}</TableCell>
                      <TableCell className="text-slate-600">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-slate-600">{order.order_items.length} unique items</TableCell>
                      <TableCell className="font-bold text-emerald-700">${Number(order.total_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Select 
                          value={order.status || 'pending'} 
                          onValueChange={(val) => { if (val) mutation.mutate({ id: order.id, status: val }) }}
                          disabled={mutation.isPending}
                        >
                          <SelectTrigger className={`w-full h-8 text-xs font-bold uppercase tracking-wider ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            order.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-500">
                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} orders
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <div className="flex items-center justify-center px-4 text-sm font-semibold bg-slate-50 border rounded-md">
                  Page {meta.page} of {meta.totalPages}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                  disabled={meta.page >= meta.totalPages}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
