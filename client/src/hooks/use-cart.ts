import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export interface CartItem {
  id: string;
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
  scheduledDate?: string;
  scheduledTime?: string;
  addedAt: string;
}

export interface UserCart {
  visitorId: string;
  items: CartItem[];
  updatedAt: string;
}

function getVisitorId(): string {
  const key = "oraginal_visitor_id";
  let visitorId = localStorage.getItem(key);
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(key, visitorId);
  }
  return visitorId;
}

export function useCart() {
  const queryClient = useQueryClient();
  const visitorId = useMemo(() => getVisitorId(), []);

  const { data: cart, isLoading } = useQuery<UserCart>({
    queryKey: ["/api/cart", visitorId],
    queryFn: async () => {
      const res = await fetch(`/api/cart/${visitorId}`);
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (item: {
      serviceId: number;
      serviceName: string;
      price: number;
      quantity?: number;
      scheduledDate?: string;
      scheduledTime?: string;
    }) => {
      const res = await fetch(`/api/cart/${visitorId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error("Failed to add to cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", visitorId] });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const res = await fetch(`/api/cart/${visitorId}/item/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (!res.ok) throw new Error("Failed to update cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", visitorId] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/cart/${visitorId}/item/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", visitorId] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/cart/${visitorId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear cart");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart", visitorId] });
    },
  });

  const addToCart = useCallback(
    (item: {
      serviceId: number;
      serviceName: string;
      price: number;
      quantity?: number;
      scheduledDate?: string;
      scheduledTime?: string;
    }) => {
      return addToCartMutation.mutateAsync(item);
    },
    [addToCartMutation]
  );

  const updateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      return updateQuantityMutation.mutateAsync({ itemId, quantity });
    },
    [updateQuantityMutation]
  );

  const removeFromCart = useCallback(
    (itemId: string) => {
      return removeFromCartMutation.mutateAsync(itemId);
    },
    [removeFromCartMutation]
  );

  const clearCart = useCallback(() => {
    return clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

  const itemCount = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [cart]);

  const total = useMemo(() => {
    return cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  }, [cart]);

  return {
    cart,
    items: cart?.items || [],
    isLoading,
    visitorId,
    itemCount,
    total,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
  };
}
