import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface MenuItem {
    id: string;
    name: string;
    createdAt: Time;
    isAvailable: boolean;
    description: string;
    updatedAt: Time;
    category: string;
    imageId?: ExternalBlob;
    price: string;
}
export type Time = bigint;
export interface BakerySettings {
    heroCtaText: string;
    aboutTitle: string;
    email: string;
    aboutImageId?: string;
    aboutBody: string;
    address: string;
    openingHours: Array<OpeningHour>;
    phone: string;
    heroHeadline: string;
    heroSubheading: string;
}
export interface UserProfile {
    name: string;
}
export interface OpeningHour {
    day: string;
    hours: string;
}
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
    createdAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createMenuItem(newItem: MenuItem): Promise<string>;
    deleteMenuItem(itemId: string): Promise<void>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAvailableMenuItems(): Promise<Array<MenuItem>>;
    getBakerySettings(): Promise<BakerySettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenuItem(itemId: string): Promise<MenuItem>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBakerySettings(newSettings: BakerySettings): Promise<void>;
    updateMenuItem(itemId: string, updatedItem: MenuItem): Promise<void>;
    placeOrder(order: CustomerOrder): Promise<string>;
    getAllOrders(): Promise<Array<CustomerOrder>>;
    updateOrderStatus(orderId: string, status: string): Promise<void>;
}
