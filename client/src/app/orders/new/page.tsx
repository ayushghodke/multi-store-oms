'use client';

import { useStore } from "@/context/StoreContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mirror backend Zod Schema
const orderItemSchema = z.object({
  product_name: z.string().min(1, 'Required'),
  quantity: z.coerce.number().int().min(1, 'Min 1'),
  price: z.coerce.number().min(0, 'Positive price'),
});

const formSchema = z.object({
  store_id: z.coerce.number().int().positive('Please select a store from the sidebar layout'),
  items: z.array(orderItemSchema).min(1, 'Add at least one item'),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewOrderPage() {
  const { activeStoreId } = useStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      store_id: activeStoreId || 0,
      items: [{ product_name: "", quantity: 1, price: 0 }]
    }
  });

  // Keep store_id properly synced if user changes it via sidebar while on this page
  if (activeStoreId && form.getValues('store_id') !== activeStoreId) {
    form.setValue('store_id', activeStoreId);
  }

  const { fields, append, remove } = useFieldArray({
    name: "items",
    control: form.control,
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Calculate total amount programmatically
      const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/orders`, {
        store_id: data.store_id,
        total_amount: totalAmount,
        items: data.items,
      });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate queries so the table refreshes
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push('/');
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || error.message || "Failed to create order");
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="icon" type="button">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="border-slate-200 shadow-sm max-w-4xl">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {activeStoreId 
                ? `Drafting an order for Store #${activeStoreId}` 
                : <span className="text-red-600 font-semibold">Please select a store on the sidebar before creating an order!</span>}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {errorMessage && (
              <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md font-medium">
                {errorMessage}
              </div>
            )}
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 border rounded-lg">
                  <div className="col-span-12 md:col-span-5 space-y-2">
                    <Label>Product Name</Label>
                    <Input 
                      placeholder="SKU-1234 or Widget"
                      {...form.register(`items.${index}.product_name`)}
                    />
                    {form.formState.errors.items?.[index]?.product_name && (
                      <p className="text-xs text-red-500">{form.formState.errors.items[index]?.product_name?.message}</p>
                    )}
                  </div>
                  
                  <div className="col-span-12 md:col-span-3 space-y-2">
                    <Label>Unit Price ($)</Label>
                    <Input 
                      type="number" step="0.01"
                      {...form.register(`items.${index}.price`)}
                    />
                    {form.formState.errors.items?.[index]?.price && (
                      <p className="text-xs text-red-500">{form.formState.errors.items[index]?.price?.message}</p>
                    )}
                  </div>

                  <div className="col-span-12 md:col-span-3 space-y-2">
                    <Label>Quantity</Label>
                    <Input 
                      type="number"
                      {...form.register(`items.${index}.quantity`)}
                    />
                    {form.formState.errors.items?.[index]?.quantity && (
                      <p className="text-xs text-red-500">{form.formState.errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div className="col-span-12 md:col-span-1 flex justify-end pb-1">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed"
              onClick={() => append({ product_name: "", quantity: 1, price: 0 })}
            >
              <PlusCircle className="w-4 h-4 mr-2" /> Add Item Line
            </Button>
            {form.formState.errors.items?.root && (
               <p className="text-xs text-red-500 text-center mt-2">{form.formState.errors.items.root.message}</p>
            )}

            {/* Hidden Input purely to hook store_id tracking into RHF errors easily */}
            <input type="hidden" {...form.register('store_id')} />
            {form.formState.errors.store_id && (
               <p className="text-sm font-semibold text-red-500 text-center mt-4">
                 ⚠️ {form.formState.errors.store_id.message}
               </p>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50 py-4 flex justify-between border-t rounded-b-lg">
            <div className="text-sm text-slate-500">
               Auto-calculates grand total on save.
            </div>
            <Button 
               type="submit" 
               disabled={mutation.isPending || !activeStoreId}
               className="min-w-[150px]"
            >
              {mutation.isPending ? "Processing..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
