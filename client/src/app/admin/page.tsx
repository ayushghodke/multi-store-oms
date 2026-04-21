'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Archive, BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  statusBreakdown: { status: string | null; count: number }[];
  ordersPerDay: { date: string; count: number }[];
  revenuePerStore: { store_id: number | null; totalRevenue: number; orderCount: number }[];
  topProducts: { product_name: string; total_quantity: number; total_revenue: number }[];
  eligibleForArchival: number;
}

export default function AdminPage() {
  const { data: analytics, isLoading, refetch } = useQuery<{ success: boolean; data: AnalyticsData }>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await axios.get('/api/analytics');
      return res.data;
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/api/admin/archive');
      return res.data;
    },
    onSuccess: (data) => {
      if (data.archived > 0) {
        toast.success(`Archival complete!`, {
          description: `${data.archived} orders have been archived successfully.`,
        });
      } else {
        toast.info('No orders to archive', {
          description: 'All orders are either less than 30 days old or not completed.',
        });
      }
      refetch();
    },
    onError: () => {
      toast.error('Archival failed', {
        description: 'An error occurred while archiving orders. Please try again.',
      });
    },
  });

  const data = analytics?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Analytics, insights, and data management tools.</p>
        </div>
      </div>

      {/* Archive Panel */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Order Archival</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Move completed orders older than 30 days to the archive. This keeps your active orders table fast and lean.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-white rounded-lg border border-amber-200 px-5 py-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-2xl font-black text-amber-700">
                  {isLoading ? '…' : data?.eligibleForArchival ?? 0}
                </div>
                <div className="text-xs text-amber-600 font-medium">Orders Eligible for Archival</div>
              </div>
            </div>
            <Button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending || data?.eligibleForArchival === 0}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Archive className="w-4 h-4 mr-2" />
              {archiveMutation.isPending ? 'Archiving…' : 'Run Archive Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> Total Revenue
            </CardDescription>
            <CardTitle className="text-3xl font-black text-emerald-600">
              {isLoading ? <Skeleton className="h-9 w-32" /> : `$${Number(data?.totalRevenue || 0).toFixed(2)}`}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <BarChart3 className="w-4 h-4" /> Total Orders
            </CardDescription>
            <CardTitle className="text-3xl font-black text-blue-600">
              {isLoading ? <Skeleton className="h-9 w-24" /> : data?.totalOrders ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Revenue by Store */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" /> Revenue Per Store
          </CardTitle>
          <CardDescription>Total revenue and order count broken down by store.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (data?.revenuePerStore?.length ?? 0) === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No store data available yet.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Store ID</TableHead>
                    <TableHead className="font-bold">Total Orders</TableHead>
                    <TableHead className="font-bold text-emerald-700">Total Revenue</TableHead>
                    <TableHead className="font-bold text-right">Avg. Order Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.revenuePerStore.map((store) => (
                    <TableRow key={store.store_id}>
                      <TableCell className="font-medium">Store #{store.store_id ?? 'N/A'}</TableCell>
                      <TableCell>{store.orderCount}</TableCell>
                      <TableCell className="text-emerald-600 font-bold">
                        ${Number(store.totalRevenue).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        ${store.orderCount > 0 ? (Number(store.totalRevenue) / store.orderCount).toFixed(2) : '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" /> Top 5 Selling Products
          </CardTitle>
          <CardDescription>Products with the highest total quantity sold across all orders.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (data?.topProducts?.length ?? 0) === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No product data available yet.</p>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold w-10">#</TableHead>
                    <TableHead className="font-bold">Product Name</TableHead>
                    <TableHead className="font-bold">Units Sold</TableHead>
                    <TableHead className="font-bold text-emerald-700 text-right">Revenue Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.topProducts.map((product, i) => (
                    <TableRow key={product.product_name}>
                      <TableCell>
                        <Badge variant={i === 0 ? 'default' : 'secondary'} className="font-bold">
                          {i + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.product_name}</TableCell>
                      <TableCell>{product.total_quantity.toLocaleString()} units</TableCell>
                      <TableCell className="text-right text-emerald-600 font-bold">
                        ${Number(product.total_revenue).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders Per Day */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Orders Per Day (Last 30 Days)
          </CardTitle>
          <CardDescription>Daily order volume over the past 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (data?.ordersPerDay?.length ?? 0) === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No daily data available yet.</p>
          ) : (
            <div className="space-y-2">
              {data?.ordersPerDay.map((day) => (
                <div key={String(day.date)} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-24 shrink-0">
                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (day.count / Math.max(...(data?.ordersPerDay.map(d => d.count) || [1]))) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-8 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
