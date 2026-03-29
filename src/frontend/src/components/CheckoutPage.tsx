import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { BakerySettings, MenuItem } from "../backend";
import { useActor } from "../hooks/useActor";
import type { OrderItem } from "../hooks/useQueries";
import {
  useGetAvailableMenuItems,
  useGetBakerySettings,
  usePlaceOrder,
} from "../hooks/useQueries";

const SAMPLE_MENU = [
  {
    id: "s1",
    name: "Sourdough Loaf",
    price: "$8.50",
    category: "Bread",
    description: "Classic sourdough with a tangy crumb and crisp crust.",
    image: "/assets/generated/menu-sourdough.dim_400x300.jpg",
  },
  {
    id: "s2",
    name: "Butter Croissant",
    price: "$3.50",
    category: "Pastry",
    description: "Flaky, buttery layers with a golden finish.",
    image: "/assets/generated/menu-croissant.dim_400x300.jpg",
  },
  {
    id: "s3",
    name: "Cinnamon Roll",
    price: "$4.25",
    category: "Pastry",
    description: "Soft and pillowy with cream cheese frosting.",
    image: "/assets/generated/menu-cinnamon-roll.dim_400x300.jpg",
  },
  {
    id: "s4",
    name: "Blueberry Muffin",
    price: "$3.75",
    category: "Pastry",
    description: "Bursting with fresh blueberries and a sugar-crumble top.",
    image: "/assets/generated/menu-muffin.dim_400x300.jpg",
  },
  {
    id: "s5",
    name: "Classic Baguette",
    price: "$4.00",
    category: "Bread",
    description: "Crispy exterior with a light, airy interior.",
    image: "/assets/generated/menu-baguette.dim_400x300.jpg",
  },
  {
    id: "s6",
    name: "Chocolate Cake Slice",
    price: "$6.50",
    category: "Cake",
    description: "Decadent dark chocolate ganache layered cake.",
    image: "/assets/generated/menu-chocolate-cake.dim_400x300.jpg",
  },
];

function parsePrice(price: string): number {
  return Number.parseFloat(price.replace(/[^\d.]/g, "")) || 0;
}

function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

interface CartItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  category: string;
}

interface Props {
  onBack: () => void;
}

export default function CheckoutPage({ onBack }: Props) {
  const { data: menuItems, isLoading: menuLoading } =
    useGetAvailableMenuItems();
  const { data: settings } = useGetBakerySettings();
  const placeOrder = usePlaceOrder();
  const { actor, isFetching: actorLoading } = useActor();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  const displayItems: Array<{
    id: string;
    name: string;
    price: string;
    category: string;
    description: string;
    image: string;
  }> =
    menuItems && menuItems.length > 0
      ? menuItems.map((item: MenuItem, i: number) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          description: item.description,
          image: item.imageId
            ? item.imageId.getDirectURL()
            : [
                "/assets/generated/menu-croissant.dim_400x300.jpg",
                "/assets/generated/menu-sourdough.dim_400x300.jpg",
                "/assets/generated/menu-cinnamon-roll.dim_400x300.jpg",
                "/assets/generated/menu-muffin.dim_400x300.jpg",
                "/assets/generated/menu-baguette.dim_400x300.jpg",
                "/assets/generated/menu-chocolate-cake.dim_400x300.jpg",
              ][i % 6],
        }))
      : SAMPLE_MENU;

  const addToCart = (item: (typeof displayItems)[number]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          category: item.category,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.quantity <= 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) =>
        c.id === id ? { ...c, quantity: c.quantity - 1 } : c,
      );
    });
  };

  const deleteFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!customerPhone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }
    if (!customerEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const orderItems: OrderItem[] = cart.map((c) => ({
      menuItemId: c.id,
      name: c.name,
      quantity: BigInt(c.quantity),
      price: c.price,
    }));

    const order = {
      id: "",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      items: orderItems,
      totalPrice: formatPrice(cartTotal),
      status: "new",
      notes: notes.trim(),
      createdAt: BigInt(Date.now()) * BigInt(1_000_000),
    };

    try {
      const id = await placeOrder.mutateAsync(order);
      setOrderId(id);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to place order. Please try again.";
      toast.error(msg);
    }
  };

  const s: BakerySettings = settings ?? {
    heroHeadline: "",
    heroSubheading: "",
    heroCtaText: "",
    aboutTitle: "",
    aboutBody: "",
    address: "",
    phone: "+1 (555) 284-7632",
    email: "hello@artisanbakery.com",
    openingHours: [],
  };

  if (orderId) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "oklch(var(--background))" }}
        data-ocid="checkout.success_state"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center p-10 rounded-2xl shadow-warm"
          style={{ backgroundColor: "oklch(var(--card))" }}
        >
          <CheckCircle2
            className="w-16 h-16 mx-auto mb-6"
            style={{ color: "oklch(var(--bakery-gold))" }}
          />
          <h2
            className="text-3xl font-bold mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "oklch(var(--bakery-text))",
            }}
          >
            Order Placed!
          </h2>
          <p
            className="text-sm mb-1"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Thank you, <strong>{customerName}</strong>. Your order has been
            received.
          </p>
          <p
            className="text-xs mb-6"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Order ID: <span className="font-mono font-medium">{orderId}</span>
          </p>
          <div
            className="rounded-xl p-4 mb-6 text-left space-y-3"
            style={{ backgroundColor: "oklch(var(--bakery-cream))" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "oklch(var(--bakery-gold))" }}
            >
              Contact us to follow up
            </p>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "oklch(var(--bakery-text))" }}
            >
              <Phone className="w-4 h-4" />
              <span>{s.phone}</span>
            </div>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "oklch(var(--bakery-text))" }}
            >
              <Mail className="w-4 h-4" />
              <span>{s.email}</span>
            </div>
          </div>
          <Button
            onClick={onBack}
            className="w-full"
            style={{
              backgroundColor: "oklch(var(--bakery-brown))",
              color: "white",
            }}
            data-ocid="checkout.primary_button"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(var(--background))" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 shadow"
        style={{
          background:
            "linear-gradient(180deg, oklch(var(--bakery-brown)) 0%, oklch(var(--bakery-brown-light)) 100%)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "white" }}
            data-ocid="checkout.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Separator orientation="vertical" className="h-5 opacity-30" />
          <span
            className="text-white font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Order Online
          </span>
          <div className="ml-auto flex items-center gap-2">
            <ShoppingBag
              className="w-5 h-5"
              style={{ color: "oklch(var(--bakery-gold))" }}
            />
            <span className="text-white text-sm font-semibold">
              {cart.reduce((s, c) => s + c.quantity, 0)} items
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "oklch(var(--bakery-text))",
            }}
          >
            Place Your Order
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Select items from our menu and fill in your details. We'll confirm
            your order promptly.
          </p>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-3" data-ocid="checkout.section">
              <h2
                className="text-lg font-semibold mb-4 uppercase tracking-widest text-xs"
                style={{ color: "oklch(var(--bakery-gold))" }}
              >
                Our Menu
              </h2>
              {menuLoading ? (
                <div className="flex justify-center py-16">
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: "oklch(var(--bakery-gold))" }}
                  />
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {displayItems.map((item, i) => {
                    const cartItem = cart.find((c) => c.id === item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl overflow-hidden shadow-warm group"
                        style={{ backgroundColor: "oklch(var(--card))" }}
                        data-ocid={`checkout.item.${i + 1}`}
                      >
                        <div className="h-36 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-1">
                            <h3
                              className="font-semibold text-sm leading-tight"
                              style={{
                                fontFamily: "'Playfair Display', serif",
                                color: "oklch(var(--bakery-text))",
                              }}
                            >
                              {item.name}
                            </h3>
                            <span
                              className="font-bold text-sm ml-2 shrink-0"
                              style={{ color: "oklch(var(--bakery-gold))" }}
                            >
                              {item.price}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-xs mb-2"
                            style={{
                              borderColor: "oklch(var(--bakery-gold) / 0.4)",
                              color: "oklch(var(--bakery-gold))",
                            }}
                          >
                            {item.category}
                          </Badge>
                          <p
                            className="text-xs leading-relaxed mb-3"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                          >
                            {item.description}
                          </p>
                          {cartItem ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors hover:bg-muted"
                                style={{
                                  borderColor: "oklch(var(--bakery-brown))",
                                  color: "oklch(var(--bakery-brown))",
                                }}
                                data-ocid={`checkout.secondary_button.${i + 1}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span
                                className="font-semibold text-sm w-5 text-center"
                                style={{ color: "oklch(var(--bakery-text))" }}
                              >
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                                style={{
                                  backgroundColor: "oklch(var(--bakery-brown))",
                                  color: "white",
                                }}
                                data-ocid={`checkout.primary_button.${i + 1}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(item)}
                              className="w-full py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
                              style={{
                                backgroundColor: "oklch(var(--bakery-gold))",
                                color: "oklch(var(--bakery-text))",
                              }}
                              data-ocid={`checkout.primary_button.${i + 1}`}
                            >
                              Add to Order
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart + Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart */}
              <div
                className="rounded-xl p-5"
                style={{
                  backgroundColor: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
                data-ocid="checkout.panel"
              >
                <h2
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ color: "oklch(var(--bakery-gold))" }}
                >
                  Your Order
                </h2>
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <p
                      className="text-xs text-center py-6"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                      data-ocid="checkout.empty_state"
                    >
                      No items yet. Add something from the menu!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((c) => (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-medium truncate"
                              style={{ color: "oklch(var(--bakery-text))" }}
                            >
                              {c.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{
                                color: "oklch(var(--muted-foreground))",
                              }}
                            >
                              {c.quantity} × {c.price} ={" "}
                              {formatPrice(parsePrice(c.price) * c.quantity)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => deleteFromCart(c.id)}
                            className="p-1 rounded hover:bg-muted transition-colors"
                            style={{ color: "oklch(var(--muted-foreground))" }}
                            data-ocid="checkout.delete_button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "oklch(var(--bakery-text))" }}
                        >
                          Total
                        </span>
                        <span
                          className="text-lg font-bold"
                          style={{ color: "oklch(var(--bakery-gold))" }}
                        >
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Customer Form */}
              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  backgroundColor: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                }}
              >
                <h2
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "oklch(var(--bakery-gold))" }}
                >
                  Your Details
                </h2>
                <div>
                  <Label
                    htmlFor="customer-name"
                    className="text-xs font-medium"
                  >
                    Full Name *
                  </Label>
                  <Input
                    id="customer-name"
                    placeholder="Jane Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                    data-ocid="checkout.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="customer-phone"
                    className="text-xs font-medium"
                  >
                    Phone Number *
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="mt-1"
                    data-ocid="checkout.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="customer-email"
                    className="text-xs font-medium"
                  >
                    Email Address *
                  </Label>
                  <Input
                    id="customer-email"
                    type="email"
                    placeholder="jane@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1"
                    data-ocid="checkout.input"
                  />
                </div>
                <div>
                  <Label htmlFor="order-notes" className="text-xs font-medium">
                    Order Notes (optional)
                  </Label>
                  <Textarea
                    id="order-notes"
                    placeholder="Allergies, special requests, delivery info..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 text-sm resize-none"
                    rows={3}
                    data-ocid="checkout.textarea"
                  />
                </div>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={
                    placeOrder.isPending ||
                    cart.length === 0 ||
                    actorLoading ||
                    !actor
                  }
                  className="w-full font-semibold tracking-wider uppercase text-sm"
                  style={{
                    backgroundColor: "oklch(var(--bakery-brown))",
                    color: "white",
                  }}
                  data-ocid="checkout.submit_button"
                >
                  {placeOrder.isPending || actorLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {actorLoading ? "Connecting..." : "Placing Order..."}
                    </>
                  ) : (
                    `Place Order · ${formatPrice(cartTotal)}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
