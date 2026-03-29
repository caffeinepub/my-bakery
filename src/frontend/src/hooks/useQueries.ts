import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BakerySettings, MenuItem } from "../backend";
import { useActor } from "./useActor";

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: bigint;
  price: string;
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: Array<OrderItem>;
  totalPrice: string;
  status: string;
  notes: string;
  createdAt: bigint;
}

export function useGetBakerySettings() {
  const { actor, isFetching } = useActor();
  return useQuery<BakerySettings>({
    queryKey: ["bakerySettings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getBakerySettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAvailableMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["availableMenuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["allMenuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateBakerySettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: BakerySettings) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBakerySettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bakerySettings"] });
    },
  });
}

export function useCreateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: MenuItem) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createMenuItem(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
      queryClient.invalidateQueries({ queryKey: ["availableMenuItems"] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, item }: { id: string; item: MenuItem }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateMenuItem(id, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
      queryClient.invalidateQueries({ queryKey: ["availableMenuItems"] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteMenuItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMenuItems"] });
      queryClient.invalidateQueries({ queryKey: ["availableMenuItems"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (order: CustomerOrder) => {
      if (!actor)
        throw new Error("Actor not available. Please wait and try again.");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).placeOrder(order) as Promise<string>;
    },
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerOrder[]>({
    queryKey: ["allOrders"],
    queryFn: async () => {
      if (!actor) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).getAllOrders() as Promise<CustomerOrder[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: { orderId: string; status: string }) => {
      if (!actor) throw new Error("Actor not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (actor as any).updateOrderStatus(orderId, status) as Promise<void>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
}
