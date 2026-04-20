'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, Plus, MapPin, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface StoreData {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const { data: stores, isLoading } = useQuery<StoreData[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/stores`);
      return res.data.data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: { name: string, location: string }) => {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/stores`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      setIsAdding(false);
      setNewName("");
      setNewLocation("");
    }
  });

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    mutation.mutate({ name: newName, location: newLocation });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Store Management</h1>
          <p className="text-slate-500 font-medium">Register and oversee your physical storefronts.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "outline" : "default"}>
          {isAdding ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add New Store</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-slate-200 shadow-md bg-white animate-in slide-in-from-top duration-300">
          <form onSubmit={handleAddStore}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">New Storefront Registration</CardTitle>
              <CardDescription>Enter the details for your new business location.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Westside Mall Branch" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (City/Address)</Label>
                <Input 
                  id="location" 
                  placeholder="e.g. New York, NY" 
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end bg-slate-50 border-t py-3">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Registering..." : "Confirm Registration"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))
        ) : stores?.map((store) => (
          <Card key={store.id} className="border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">{store.name}</CardTitle>
                <div className="p-2 bg-slate-100 rounded-lg">
                   <Store className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex items-center text-sm text-slate-600 font-medium">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {store.location || "Location not specified"}
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                Registered on {new Date(store.created_at).toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 py-3 border-t">
               <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Store ID: #{store.id}</div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
