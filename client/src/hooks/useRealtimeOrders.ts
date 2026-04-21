'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useRealtimeOrders(activeStoreId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only subscribe if Supabase client is configured
    const client = supabase;
    if (!client) {
      console.warn('Supabase Realtime not configured: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.');
      return;
    }

    const channel = client
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          ...(activeStoreId ? { filter: `store_id=eq.${activeStoreId}` } : {}),
        },
        (payload) => {
          const newOrder = payload.new as { id: number; store_id: number; total_amount: string };
          toast.success(`New order #${newOrder.id} received!`, {
            description: `Total: $${Number(newOrder.total_amount).toFixed(2)}`,
            duration: 5000,
          });
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeStoreId, queryClient]);
}
