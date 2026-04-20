'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  totalRevenue: string;
  totalOrders: number;
  statusBreakdown: { status: string; count: number }[];
}

export function StatsOverview() {
  const { activeStoreId } = useStore();

  const { data: stats, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', activeStoreId],
    queryFn: async () => {
      const url = activeStoreId 
        ? `/api/analytics?store_id=${activeStoreId}`
        : `/api/analytics`;
      const res = await axios.get(url);
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedOrders = stats?.statusBreakdown.find(s => s.status === 'completed')?.count || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-black text-slate-900">${Number(stats?.totalRevenue || 0).toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Gross sales across selection</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Orders</CardTitle>
          <ShoppingBag className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-black text-slate-900">{stats?.totalOrders || 0}</div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total volume processed</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalOrders ? Math.round((completedOrders / stats.totalOrders) * 100) : 0}%
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{completedOrders} orders successfully finished</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-slate-50/50">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">AOV</CardTitle>
          <Package className="h-4 w-4 text-indigo-600" />
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-2xl font-black text-slate-900">
            ${stats?.totalOrders ? (Number(stats.totalRevenue) / stats.totalOrders).toFixed(2) : "0.00"}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Average Order Value</p>
        </CardContent>
      </Card>
    </div>
  );
}
