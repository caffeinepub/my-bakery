import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Upload,
  Wheat,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { BakerySettings, MenuItem } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateMenuItem,
  useDeleteMenuItem,
  useGetAllMenuItems,
  useGetAllOrders,
  useGetBakerySettings,
  useUpdateBakerySettings,
  useUpdateMenuItem,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const DEFAULT_SETTINGS: BakerySettings = {
  heroHeadline: "Fresh Baked With Love",
  heroSubheading:
    "Every morning we craft artisan breads, pastries and cakes using time-honored recipes and the finest ingredients.",
  heroCtaText: "Explore Our Menu",
  aboutTitle: "Our Baking Passion",
  aboutBody:
    "For over two decades, our family bakery has been rising before the sun to bring you the finest handcrafted baked goods.",
  address: "42 Maple Street, Old Town\nSpringfield, IL 62701",
  phone: "+1 (555) 284-7632",
  email: "hello@artisanbakery.com",
  openingHours: [
    { day: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "7:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "8:00 AM – 2:00 PM" },
  ],
};

interface Props {
  onExitAdmin: () => void;
}

export default function AdminPanel({ onExitAdmin }: Props) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useGetBakerySettings();
  const { data: menuItems, isLoading: menuLoading } = useGetAllMenuItems();
  const updateSettings = useUpdateBakerySettings();

  const s = settings ?? DEFAULT_SETTINGS;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    onExitAdmin();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(var(--background))" }}
    >
      {/* Admin Header */}
      <header
        className="sticky top-0 z-50 w-full shadow"
        style={{
          background:
            "linear-gradient(180deg, oklch(var(--bakery-brown)) 0%, oklch(var(--bakery-brown-light)) 100%)",
        }}
      >
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Wheat
              className="w-6 h-6"
              style={{ color: "oklch(var(--bakery-gold))" }}
            />
            <span
              className="font-bold tracking-wide"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "oklch(var(--bakery-nav-muted))",
              }}
            >
              Bakery
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                backgroundColor: "oklch(var(--bakery-gold))",
                color: "oklch(var(--bakery-text))",
              }}
            >
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="text-xs tracking-wider hover:opacity-80 transition-opacity"
              style={{ color: "oklch(var(--bakery-nav-muted))" }}
              data-ocid="admin.back.button"
            >
              ← View Site
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:opacity-80"
              style={{
                color: "oklch(var(--bakery-nav-muted))",
                border: "1px solid oklch(var(--bakery-nav-muted) / 0.4)",
              }}
              data-ocid="admin.logout.button"
            >
              <LogOut className="w-3 h-3" /> Logout
            </button>
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
            className="text-3xl font-bold mb-2 uppercase tracking-wide"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "oklch(var(--bakery-text))",
            }}
          >
            Admin Dashboard
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Manage your bakery's content, menu, and settings.
          </p>

          {settingsLoading ? (
            <div
              className="flex justify-center py-20"
              data-ocid="admin.loading_state"
            >
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "oklch(var(--bakery-gold))" }}
              />
            </div>
          ) : (
            <Tabs defaultValue="hero" className="w-full">
              <TabsList
                className="mb-8 bg-card border border-border"
                data-ocid="admin.tab"
              >
                <TabsTrigger value="hero" data-ocid="admin.hero.tab">
                  Hero
                </TabsTrigger>
                <TabsTrigger value="menu" data-ocid="admin.menu.tab">
                  Menu Items
                </TabsTrigger>
                <TabsTrigger value="about" data-ocid="admin.about.tab">
                  About
                </TabsTrigger>
                <TabsTrigger value="contact" data-ocid="admin.contact.tab">
                  Contact & Hours
                </TabsTrigger>
                <TabsTrigger value="orders" data-ocid="admin.orders.tab">
                  Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hero">
                <HeroTab
                  settings={s}
                  onSave={(patch) =>
                    updateSettings.mutateAsync({ ...s, ...patch })
                  }
                  isSaving={updateSettings.isPending}
                />
              </TabsContent>

              <TabsContent value="menu">
                <MenuTab items={menuItems ?? []} isLoading={menuLoading} />
              </TabsContent>

              <TabsContent value="about">
                <AboutTab
                  settings={s}
                  onSave={(patch) =>
                    updateSettings.mutateAsync({ ...s, ...patch })
                  }
                  isSaving={updateSettings.isPending}
                />
              </TabsContent>

              <TabsContent value="contact">
                <ContactTab
                  settings={s}
                  onSave={(patch) =>
                    updateSettings.mutateAsync({ ...s, ...patch })
                  }
                  isSaving={updateSettings.isPending}
                />
              </TabsContent>

              <TabsContent value="orders">
                <OrdersTab />
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// ─── HERO TAB ───────────────────────────────────────────────────────────────
function HeroTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: BakerySettings;
  onSave: (p: Partial<BakerySettings>) => Promise<void>;
  isSaving: boolean;
}) {
  const [headline, setHeadline] = useState(settings.heroHeadline);
  const [subheading, setSubheading] = useState(settings.heroSubheading);
  const [ctaText, setCtaText] = useState(settings.heroCtaText);

  const handleSave = async () => {
    try {
      await onSave({
        heroHeadline: headline,
        heroSubheading: subheading,
        heroCtaText: ctaText,
      });
      toast.success("Hero settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  return (
    <div className="max-w-xl space-y-5" data-ocid="admin.hero.panel">
      <SectionHeader
        title="Hero Settings"
        desc="Customize the headline and CTA of your hero banner."
      />
      <div>
        <Label className="admin-label">Headline</Label>
        <Input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="mt-1"
          data-ocid="admin.hero.input"
        />
      </div>
      <div>
        <Label className="admin-label">Subheading</Label>
        <Textarea
          value={subheading}
          onChange={(e) => setSubheading(e.target.value)}
          rows={3}
          className="mt-1 resize-none"
          data-ocid="admin.hero.textarea"
        />
      </div>
      <div>
        <Label className="admin-label">CTA Button Text</Label>
        <Input
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          className="mt-1"
          data-ocid="admin.hero.input"
        />
      </div>
      <SaveButton onClick={handleSave} isPending={isSaving} />
    </div>
  );
}

// ─── MENU TAB ───────────────────────────────────────────────────────────────
function MenuTab({
  items,
  isLoading,
}: { items: MenuItem[]; isLoading: boolean }) {
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);

  if (isLoading)
    return (
      <div className="flex py-12 justify-center" data-ocid="menu.loading_state">
        <Loader2
          className="w-6 h-6 animate-spin"
          style={{ color: "oklch(var(--bakery-gold))" }}
        />
      </div>
    );

  return (
    <div data-ocid="admin.menu.panel">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader
          title="Menu Items"
          desc="Add, edit, or remove items from your menu."
        />
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 text-sm"
              style={{
                backgroundColor: "oklch(var(--bakery-gold))",
                color: "oklch(var(--bakery-text))",
              }}
              data-ocid="admin.menu.open_modal_button"
            >
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md" data-ocid="admin.menu.dialog">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Playfair Display', serif" }}>
                Add Menu Item
              </DialogTitle>
            </DialogHeader>
            <MenuItemForm
              onSubmit={async (data) => {
                try {
                  await createItem.mutateAsync(data);
                  toast.success("Menu item added!");
                  setAddOpen(false);
                } catch {
                  toast.error("Failed to add item.");
                }
              }}
              isPending={createItem.isPending}
              onCancel={() => setAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div
          className="text-center py-16 rounded border-2 border-dashed border-border"
          data-ocid="menu.empty_state"
        >
          <p
            className="text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            No menu items yet. Add your first item above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 rounded border border-border bg-card"
              data-ocid={`menu.item.${i + 1}`}
            >
              <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
                <img
                  src={
                    item.imageId
                      ? item.imageId.getDirectURL()
                      : "/assets/generated/menu-croissant.dim_400x300.jpg"
                  }
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-semibold text-sm"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "oklch(var(--bakery-text))",
                    }}
                  >
                    {item.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: "oklch(var(--bakery-gold) / 0.4)",
                      color: "oklch(var(--bakery-gold))",
                    }}
                  >
                    {item.category}
                  </Badge>
                  {!item.isAvailable && (
                    <Badge variant="secondary" className="text-xs">
                      Hidden
                    </Badge>
                  )}
                </div>
                <p
                  className="text-xs truncate mt-0.5"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {item.description}
                </p>
                <span
                  className="text-xs font-bold"
                  style={{ color: "oklch(var(--bakery-gold))" }}
                >
                  {item.price}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Dialog
                  open={editItem?.id === item.id}
                  onOpenChange={(open) => !open && setEditItem(null)}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setEditItem(item)}
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      data-ocid={`menu.item.edit_button.${i + 1}`}
                    >
                      <Pencil
                        className="w-4 h-4"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      />
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-md"
                    data-ocid="admin.menu.dialog"
                  >
                    <DialogHeader>
                      <DialogTitle
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Edit Menu Item
                      </DialogTitle>
                    </DialogHeader>
                    {editItem && (
                      <MenuItemForm
                        initial={editItem}
                        onSubmit={async (data) => {
                          try {
                            await updateItem.mutateAsync({
                              id: editItem.id,
                              item: {
                                ...data,
                                id: editItem.id,
                                createdAt: editItem.createdAt,
                                updatedAt: editItem.updatedAt,
                              },
                            });
                            toast.success("Item updated!");
                            setEditItem(null);
                          } catch {
                            toast.error("Failed to update item.");
                          }
                        }}
                        isPending={updateItem.isPending}
                        onCancel={() => setEditItem(null)}
                      />
                    )}
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="p-1.5 rounded hover:bg-muted transition-colors"
                      data-ocid={`menu.item.delete_button.${i + 1}`}
                    >
                      <Trash2
                        className="w-4 h-4"
                        style={{ color: "oklch(var(--destructive))" }}
                      />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent data-ocid="admin.menu.dialog">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{item.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel data-ocid="admin.menu.cancel_button">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          try {
                            await deleteItem.mutateAsync(item.id);
                            toast.success("Item deleted.");
                          } catch {
                            toast.error("Failed to delete item.");
                          }
                        }}
                        data-ocid="admin.menu.confirm_button"
                        style={{ backgroundColor: "oklch(var(--destructive))" }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MenuItemForm({
  initial,
  onSubmit,
  isPending,
  onCancel,
}: {
  initial?: MenuItem;
  onSubmit: (item: MenuItem) => Promise<void>;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [imageBlob, setImageBlob] = useState<ExternalBlob | null>(
    initial?.imageId ?? null,
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setUploadProgress(pct),
    );
    setImageBlob(blob);
    setUploadProgress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = BigInt(Date.now()) * BigInt(1_000_000);
    await onSubmit({
      id: initial?.id ?? "",
      name,
      description,
      price,
      category,
      isAvailable,
      imageId: imageBlob ?? undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="admin-label">Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1"
            data-ocid="admin.menu.input"
          />
        </div>
        <div>
          <Label className="admin-label">Price</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="$0.00"
            required
            className="mt-1"
            data-ocid="admin.menu.input"
          />
        </div>
      </div>
      <div>
        <Label className="admin-label">Category</Label>
        <Input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Bread, Pastry, Cake…"
          className="mt-1"
          data-ocid="admin.menu.input"
        />
      </div>
      <div>
        <Label className="admin-label">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 resize-none"
          data-ocid="admin.menu.textarea"
        />
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={isAvailable}
          onCheckedChange={setIsAvailable}
          id="available"
          data-ocid="admin.menu.switch"
        />
        <Label htmlFor="available" className="text-sm">
          Visible on public menu
        </Label>
      </div>
      <div>
        <Label className="admin-label">Photo</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1 flex items-center gap-3 p-3 rounded border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors text-left w-full"
          data-ocid="admin.menu.dropzone"
        >
          <Upload
            className="w-4 h-4"
            style={{ color: "oklch(var(--muted-foreground))" }}
          />
          <span
            className="text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {imageBlob ? "Photo selected" : "Click to upload image"}
          </span>
          {uploadProgress !== null && (
            <span className="text-xs ml-auto">{uploadProgress}%</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-ocid="admin.menu.upload_button"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="flex-1"
          style={{
            backgroundColor: "oklch(var(--bakery-gold))",
            color: "oklch(var(--bakery-text))",
          }}
          data-ocid="admin.menu.submit_button"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : initial ? (
            "Save Changes"
          ) : (
            "Add Item"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="admin.menu.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ─── ABOUT TAB ──────────────────────────────────────────────────────────────
function AboutTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: BakerySettings;
  onSave: (p: Partial<BakerySettings>) => Promise<void>;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(settings.aboutTitle);
  const [body, setBody] = useState(settings.aboutBody);
  const [imageUrl, setImageUrl] = useState(settings.aboutImageId ?? "");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) =>
      setUploadProgress(pct),
    );
    const url = blob.getDirectURL();
    setImageUrl(url);
    setUploadProgress(null);
  };

  const handleSave = async () => {
    try {
      await onSave({
        aboutTitle: title,
        aboutBody: body,
        aboutImageId: imageUrl || undefined,
      });
      toast.success("About section saved!");
    } catch {
      toast.error("Failed to save.");
    }
  };

  return (
    <div className="max-w-xl space-y-5" data-ocid="admin.about.panel">
      <SectionHeader
        title="About Section"
        desc="Edit your bakery's story and team photo."
      />
      <div>
        <Label className="admin-label">Section Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
          data-ocid="admin.about.input"
        />
      </div>
      <div>
        <Label className="admin-label">Body Text</Label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="mt-1 resize-none"
          data-ocid="admin.about.textarea"
        />
        <p
          className="text-xs mt-1"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          Separate paragraphs with a blank line.
        </p>
      </div>
      <div>
        <Label className="admin-label">Section Photo</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-1 flex items-center gap-3 p-3 rounded border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors text-left w-full"
          data-ocid="admin.about.dropzone"
        >
          <Upload
            className="w-4 h-4"
            style={{ color: "oklch(var(--muted-foreground))" }}
          />
          <span
            className="text-sm"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            {imageUrl ? "Photo selected" : "Click to upload image"}
          </span>
          {uploadProgress !== null && (
            <span className="text-xs ml-auto">{uploadProgress}%</span>
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          data-ocid="admin.about.upload_button"
        />
      </div>
      <SaveButton onClick={handleSave} isPending={isSaving} />
    </div>
  );
}

// ─── CONTACT TAB ────────────────────────────────────────────────────────────
function ContactTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: BakerySettings;
  onSave: (p: Partial<BakerySettings>) => Promise<void>;
  isSaving: boolean;
}) {
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [hours, setHours] = useState<{ day: string; hours: string }[]>(
    settings.openingHours.length > 0
      ? settings.openingHours
      : [{ day: "", hours: "" }],
  );

  const addHour = () => setHours((prev) => [...prev, { day: "", hours: "" }]);
  const removeHour = (i: number) =>
    setHours((prev) => prev.filter((_, idx) => idx !== i));
  const updateHour = (i: number, field: "day" | "hours", value: string) =>
    setHours((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)),
    );

  const handleSave = async () => {
    try {
      await onSave({ address, phone, email, openingHours: hours });
      toast.success("Contact info saved!");
    } catch {
      toast.error("Failed to save.");
    }
  };

  return (
    <div className="max-w-xl space-y-5" data-ocid="admin.contact.panel">
      <SectionHeader
        title="Contact & Hours"
        desc="Update your bakery's address, contact details, and opening times."
      />
      <div>
        <Label className="admin-label">Address</Label>
        <Textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          className="mt-1 resize-none"
          data-ocid="admin.contact.textarea"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="admin-label">Phone</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            data-ocid="admin.contact.input"
          />
        </div>
        <div>
          <Label className="admin-label">Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            data-ocid="admin.contact.input"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="admin-label">Opening Hours</Label>
          <button
            type="button"
            onClick={addHour}
            className="flex items-center gap-1 text-xs font-medium hover:opacity-80"
            style={{ color: "oklch(var(--bakery-gold))" }}
            data-ocid="admin.contact.button"
          >
            <Plus className="w-3 h-3" /> Add Row
          </button>
        </div>
        <div className="space-y-2">
          {hours.map((h, i) => (
            <div
              key={h.day || `hour-${i}`}
              className="flex gap-2 items-center"
              data-ocid={`admin.contact.row.${i + 1}`}
            >
              <Input
                placeholder="Day (e.g. Monday)"
                value={h.day}
                onChange={(e) => updateHour(i, "day", e.target.value)}
                className="flex-1"
                data-ocid="admin.contact.input"
              />
              <Input
                placeholder="Hours (e.g. 8am – 5pm)"
                value={h.hours}
                onChange={(e) => updateHour(i, "hours", e.target.value)}
                className="flex-1"
                data-ocid="admin.contact.input"
              />
              <button
                type="button"
                onClick={() => removeHour(i)}
                className="p-1 hover:opacity-70"
                data-ocid={`admin.contact.delete_button.${i + 1}`}
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <SaveButton onClick={handleSave} isPending={isSaving} />
    </div>
  );
}

// ─── SHARED HELPERS ──────────────────────────────────────────────────────────
function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-2">
      <h2
        className="text-xl font-bold"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "oklch(var(--bakery-text))",
        }}
      >
        {title}
      </h2>
      <p
        className="text-sm"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {desc}
      </p>
    </div>
  );
}

function SaveButton({
  onClick,
  isPending,
}: { onClick: () => void; isPending: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      className="font-semibold tracking-widest text-sm uppercase"
      style={{
        backgroundColor: "oklch(var(--bakery-gold))",
        color: "oklch(var(--bakery-text))",
      }}
      data-ocid="admin.save_button"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      {isPending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useGetAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const sorted = [...(orders ?? [])].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-600",
  };

  const statusLabels: Record<string, string> = {
    new: "New",
    in_progress: "In Progress",
    ready: "Ready",
    completed: "Completed",
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-16"
        data-ocid="admin.orders.loading_state"
      >
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "oklch(var(--bakery-gold))" }}
        />
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-xl border-2 border-dashed"
        style={{
          borderColor: "oklch(var(--border))",
          color: "oklch(var(--muted-foreground))",
        }}
        data-ocid="admin.orders.empty_state"
      >
        <p
          className="text-lg font-semibold mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          No orders yet
        </p>
        <p className="text-sm">Orders from customers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="admin.orders.list">
      <p
        className="text-sm"
        style={{ color: "oklch(var(--muted-foreground))" }}
      >
        {sorted.length} order{sorted.length !== 1 ? "s" : ""} total
      </p>
      {sorted.map((order, i) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-xl p-5 shadow-warm"
          style={{
            backgroundColor: "oklch(var(--card))",
            border: "1px solid oklch(var(--border))",
          }}
          data-ocid={`admin.orders.item.${i + 1}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <p
                className="font-semibold text-sm"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "oklch(var(--bakery-text))",
                }}
              >
                {order.customerName}
              </p>
              <p
                className="text-xs"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                {order.customerPhone} · {order.customerEmail}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                Order #{order.id.slice(0, 8)} ·{" "}
                {new Date(Number(order.createdAt) / 1_000_000).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {statusLabels[order.status] ?? order.status}
              </span>
              <Select
                value={order.status}
                onValueChange={(val) =>
                  updateStatus.mutate({ orderId: order.id, status: val })
                }
              >
                <SelectTrigger
                  className="h-7 text-xs w-32"
                  data-ocid={`admin.orders.select.${i + 1}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            {order.items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex justify-between text-xs"
              >
                <span style={{ color: "oklch(var(--bakery-text))" }}>
                  {item.name} × {item.quantity.toString()}
                </span>
                <span style={{ color: "oklch(var(--muted-foreground))" }}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between items-center pt-2 border-t"
            style={{ borderColor: "oklch(var(--border))" }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(var(--bakery-text))" }}
            >
              Total
            </span>
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(var(--bakery-gold))" }}
            >
              {order.totalPrice}
            </span>
          </div>
          {order.notes && (
            <p
              className="text-xs mt-2 italic"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Note: {order.notes}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
