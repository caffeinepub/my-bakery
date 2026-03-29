import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Settings,
  Wheat,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef } from "react";
import type { BakerySettings, MenuItem } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAvailableMenuItems,
  useGetBakerySettings,
} from "../hooks/useQueries";

const DEFAULT_SETTINGS: BakerySettings = {
  heroHeadline: "Fresh Baked With Love",
  heroSubheading:
    "Every morning we craft artisan breads, pastries and cakes using time-honored recipes and the finest ingredients.",
  heroCtaText: "Explore Our Menu",
  aboutTitle: "Our Baking Passion",
  aboutBody:
    "For over two decades, our family bakery has been rising before the sun to bring you the finest handcrafted baked goods. We believe that great baking is equal parts art and science — combining traditional techniques with locally sourced, seasonal ingredients.\n\nEvery loaf we shape, every pastry we fold, every cake we layer carries the warmth of our kitchen and the care of our hands. From our slow-fermented sourdough to our buttery croissants, we put heart into every bite.",
  address: "42 Maple Street, Old Town\nSpringfield, IL 62701",
  phone: "+1 (555) 284-7632",
  email: "hello@artisanbakery.com",
  openingHours: [
    { day: "Monday – Friday", hours: "7:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "7:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "8:00 AM – 2:00 PM" },
  ],
};

const SAMPLE_MENU: {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
}[] = [
  {
    name: "Butter Croissant",
    description:
      "Flaky, golden layers of hand-rolled pastry dough with rich European butter.",
    price: "$3.50",
    category: "Pastry",
    image: "/assets/generated/menu-croissant.dim_400x300.jpg",
  },
  {
    name: "Country Sourdough",
    description:
      "72-hour fermented loaf with a crisp crust and tangy, chewy crumb.",
    price: "$8.00",
    category: "Bread",
    image: "/assets/generated/menu-sourdough.dim_400x300.jpg",
  },
  {
    name: "Cinnamon Roll",
    description:
      "Pillowy soft roll swirled with cinnamon sugar, finished with cream cheese icing.",
    price: "$4.25",
    category: "Pastry",
    image: "/assets/generated/menu-cinnamon-roll.dim_400x300.jpg",
  },
  {
    name: "Blueberry Muffin",
    description:
      "Bursting with fresh blueberries, topped with a crunchy streusel crumble.",
    price: "$3.75",
    category: "Muffin",
    image: "/assets/generated/menu-muffin.dim_400x300.jpg",
  },
  {
    name: "Classic Baguette",
    description:
      "Crisp crust and airy interior baked fresh every morning the traditional French way.",
    price: "$4.50",
    category: "Bread",
    image: "/assets/generated/menu-baguette.dim_400x300.jpg",
  },
  {
    name: "Chocolate Layer Cake",
    description:
      "Three layers of dark chocolate sponge with silky ganache and chocolate shavings.",
    price: "$42.00",
    category: "Cake",
    image: "/assets/generated/menu-chocolate-cake.dim_400x300.jpg",
  },
];

interface Props {
  onCheckout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onAdminClick: () => void;
}

export default function PublicSite({
  isAuthenticated,
  isAdmin,
  onAdminClick,
  onCheckout,
}: Props) {
  const { login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: settings, isLoading: settingsLoading } = useGetBakerySettings();
  const { data: menuItems, isLoading: menuLoading } =
    useGetAvailableMenuItems();

  const menuRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const contactRef = useRef<HTMLElement>(null);

  const s = settings ?? DEFAULT_SETTINGS;
  const displayMenu = menuItems && menuItems.length > 0 ? menuItems : null;

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (e: any) {
        if (e?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "oklch(var(--background))" }}
    >
      {/* ── HEADER ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          background:
            "linear-gradient(180deg, oklch(var(--bakery-brown)) 0%, oklch(var(--bakery-brown-light)) 100%)",
        }}
        data-ocid="header.section"
      >
        <div className="max-w-[1100px] mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Wheat
              className="w-6 h-6"
              style={{ color: "oklch(var(--bakery-gold))" }}
            />
            <span
              className="text-xl font-bold tracking-wide"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "oklch(var(--bakery-nav-muted))",
              }}
            >
              Bakery
            </span>
          </div>

          {/* Nav */}
          <nav
            className="hidden md:flex items-center gap-7"
            data-ocid="nav.section"
          >
            {[
              {
                label: "HOME",
                action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
              },
              { label: "MENU", action: () => scrollTo(menuRef) },
              { label: "OUR STORY", action: () => scrollTo(storyRef) },
              { label: "CONTACT", action: () => scrollTo(contactRef) },
            ].map(({ label, action }) => (
              <button
                type="button"
                key={label}
                onClick={action}
                className="text-xs font-medium tracking-widest transition-colors hover:opacity-80"
                style={{ color: "oklch(var(--bakery-nav-muted))" }}
                data-ocid={`nav.${label.toLowerCase().replace(" ", "_")}.link`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && isAdmin && (
              <button
                type="button"
                onClick={onAdminClick}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                style={{
                  color: "oklch(var(--bakery-gold))",
                  border: "1px solid oklch(var(--bakery-gold) / 0.5)",
                }}
                data-ocid="admin.panel.button"
              >
                <Settings className="w-3 h-3" />
                Admin Panel
              </button>
            )}
            <button
              type="button"
              onClick={handleAuthClick}
              disabled={isLoggingIn}
              className="px-3 py-1.5 rounded text-xs font-medium tracking-wider border transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{
                color: "oklch(var(--bakery-nav-muted))",
                borderColor: "oklch(var(--bakery-nav-muted) / 0.5)",
              }}
              data-ocid="auth.button"
            >
              {isLoggingIn ? "..." : isAuthenticated ? "LOGOUT" : "[LOGIN]"}
            </button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section
        className="relative w-full h-[580px] flex items-center overflow-hidden"
        data-ocid="hero.section"
      >
        <img
          src="/assets/generated/hero-bakery.dim_1400x700.jpg"
          alt="Fresh baked goods"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(30,18,10,0.72) 0%, rgba(30,18,10,0.2) 60%, transparent 100%)",
          }}
        />
        <motion.div
          className="relative max-w-[1100px] mx-auto px-6 max-w-lg"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {settingsLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          ) : (
            <>
              <h1
                className="text-4xl md:text-5xl font-bold leading-tight mb-4 uppercase tracking-wide"
                style={{
                  color: "#F4EADB",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {s.heroHeadline}
              </h1>
              <p
                className="text-base mb-8 leading-relaxed"
                style={{ color: "rgba(244,234,219,0.85)", maxWidth: "420px" }}
              >
                {s.heroSubheading}
              </p>
              <button
                type="button"
                onClick={() => scrollTo(menuRef)}
                className="px-8 py-3 font-semibold text-sm tracking-widest uppercase transition-all hover:opacity-90 active:scale-95"
                style={{
                  backgroundColor: "oklch(var(--bakery-gold))",
                  color: "oklch(var(--bakery-text))",
                }}
                data-ocid="hero.primary_button"
              >
                {s.heroCtaText}
              </button>
              <button
                type="button"
                onClick={onCheckout}
                className="px-8 py-3 font-semibold text-sm tracking-widest uppercase transition-all hover:opacity-90 active:scale-95 border-2"
                style={{
                  borderColor: "oklch(var(--bakery-gold))",
                  color: "oklch(var(--bakery-gold))",
                  backgroundColor: "transparent",
                }}
                data-ocid="hero.secondary_button"
              >
                Order Now
              </button>
            </>
          )}
        </motion.div>
      </section>

      {/* ── MENU ── */}
      <section
        id="menu"
        ref={menuRef}
        className="py-20"
        style={{ backgroundColor: "oklch(var(--bakery-cream))" }}
        data-ocid="menu.section"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs tracking-[0.25em] font-medium mb-2"
              style={{ color: "oklch(var(--bakery-gold))" }}
            >
              FROM OUR OVEN
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold uppercase tracking-wider"
              style={{
                color: "oklch(var(--bakery-text))",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Daily Fresh Bakes
            </h2>
            <div
              className="mt-3 mx-auto w-16 h-0.5"
              style={{ backgroundColor: "oklch(var(--bakery-gold))" }}
            />
          </motion.div>

          {menuLoading ? (
            <div
              className="flex justify-center py-12"
              data-ocid="menu.loading_state"
            >
              <Loader2
                className="w-8 h-8 animate-spin"
                style={{ color: "oklch(var(--bakery-gold))" }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayMenu
                ? displayMenu.map((item: MenuItem, i: number) => (
                    <BackendMenuCard key={item.id} item={item} index={i + 1} />
                  ))
                : SAMPLE_MENU.map((item, i) => (
                    <SampleMenuCard key={item.name} item={item} index={i + 1} />
                  ))}
            </div>
          )}
          <div className="text-center mt-10">
            <button
              type="button"
              onClick={onCheckout}
              className="px-10 py-4 font-bold text-sm tracking-widest uppercase transition-all hover:opacity-90 active:scale-95 shadow-warm"
              style={{
                backgroundColor: "oklch(var(--bakery-brown))",
                color: "white",
              }}
              data-ocid="menu.primary_button"
            >
              Order Now — Place Your Order Online
            </button>
          </div>
        </div>
      </section>
      <section
        id="our-story"
        ref={storyRef}
        className="py-20"
        style={{ backgroundColor: "oklch(var(--bakery-cream-dark))" }}
        data-ocid="about.section"
      >
        <div className="max-w-[1100px] mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p
              className="text-xs tracking-[0.25em] font-medium mb-3"
              style={{ color: "oklch(var(--bakery-gold))" }}
            >
              ABOUT US
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold uppercase tracking-wide mb-6"
              style={{
                color: "oklch(var(--bakery-text))",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              {s.aboutTitle}
            </h2>
            <div className="space-y-4">
              {s.aboutBody.split("\n\n").map((para) => (
                <p
                  key={para.substring(0, 20)}
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(var(--muted-foreground))" }}
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded shadow-warm">
              <img
                src={
                  s.aboutImageId
                    ? `${s.aboutImageId}`
                    : "/assets/generated/about-baker.dim_600x500.jpg"
                }
                alt="Our baker at work"
                className="w-full h-80 object-cover"
              />
            </div>
            <div
              className="mt-3 text-center text-xs italic"
              style={{ color: "oklch(var(--muted-foreground))" }}
            >
              Crafting every loaf with care since 2003
            </div>
          </motion.div>
        </div>
      </section>
      <section
        id="contact"
        ref={contactRef}
        className="py-20"
        style={{ backgroundColor: "oklch(var(--bakery-cream))" }}
        data-ocid="contact.section"
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-xs tracking-[0.25em] font-medium mb-2"
              style={{ color: "oklch(var(--bakery-gold))" }}
            >
              GET IN TOUCH
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold uppercase tracking-wide"
              style={{
                color: "oklch(var(--bakery-text))",
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Visit Us
            </h2>
            <div
              className="mt-3 mx-auto w-16 h-0.5"
              style={{ backgroundColor: "oklch(var(--bakery-gold))" }}
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <form
                className="space-y-5"
                onSubmit={(e) => e.preventDefault()}
                data-ocid="contact.modal"
              >
                <div>
                  <Label
                    htmlFor="contact-name"
                    className="text-xs tracking-wider uppercase mb-1 block"
                    style={{ color: "oklch(var(--bakery-text))" }}
                  >
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    className="bg-white border-border"
                    data-ocid="contact.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-email"
                    className="text-xs tracking-wider uppercase mb-1 block"
                    style={{ color: "oklch(var(--bakery-text))" }}
                  >
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white border-border"
                    data-ocid="contact.input"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="contact-message"
                    className="text-xs tracking-wider uppercase mb-1 block"
                    style={{ color: "oklch(var(--bakery-text))" }}
                  >
                    Message
                  </Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className="bg-white border-border resize-none"
                    data-ocid="contact.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full tracking-widest text-sm font-semibold uppercase"
                  style={{
                    backgroundColor: "oklch(var(--bakery-gold))",
                    color: "oklch(var(--bakery-text))",
                  }}
                  data-ocid="contact.submit_button"
                >
                  Send Message
                </Button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-8"
            >
              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-widest mb-4"
                  style={{
                    color: "oklch(var(--bakery-text))",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Find Us
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                      style={{ color: "oklch(var(--bakery-gold))" }}
                    />
                    <p
                      className="text-sm whitespace-pre-line"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      {s.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "oklch(var(--bakery-gold))" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      {s.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "oklch(var(--bakery-gold))" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "oklch(var(--muted-foreground))" }}
                    >
                      {s.email}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  className="text-sm font-semibold uppercase tracking-widest mb-4"
                  style={{
                    color: "oklch(var(--bakery-text))",
                    fontFamily: "'Playfair Display', serif",
                  }}
                >
                  Opening Hours
                </h3>
                <div className="space-y-2">
                  {s.openingHours.map((oh, i) => (
                    <div
                      key={oh.day || String(i)}
                      className="flex items-center gap-3"
                    >
                      <Clock
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "oklch(var(--bakery-gold))" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "oklch(var(--muted-foreground))" }}
                      >
                        <span
                          className="font-medium"
                          style={{ color: "oklch(var(--bakery-text))" }}
                        >
                          {oh.day}:
                        </span>{" "}
                        {oh.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      <footer
        className="py-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(var(--bakery-brown-light)) 0%, oklch(var(--bakery-brown)) 100%)",
        }}
        data-ocid="footer.section"
      >
        <div className="max-w-[1100px] mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wheat
              className="w-5 h-5"
              style={{ color: "oklch(var(--bakery-gold))" }}
            />
            <span
              className="text-lg font-bold"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "oklch(var(--bakery-nav-muted))",
              }}
            >
              Bakery
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {[
              { label: "Shop", action: () => scrollTo(menuRef) },
              { label: "Visit", action: () => scrollTo(contactRef) },
              { label: "Our Story", action: () => scrollTo(storyRef) },
            ].map(({ label, action }) => (
              <button
                type="button"
                key={label}
                onClick={action}
                className="text-xs tracking-wider hover:opacity-80 transition-opacity"
                style={{ color: "oklch(var(--bakery-nav-muted))" }}
                data-ocid={`footer.${label.toLowerCase().replace(" ", "_")}.link`}
              >
                {label}
              </button>
            ))}
          </div>
          <p
            className="text-xs"
            style={{ color: "oklch(var(--bakery-nav-muted) / 0.6)" }}
          >
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
              style={{ color: "oklch(var(--bakery-nav-muted) / 0.6)" }}
            >
              Built with ♥ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function SampleMenuCard({
  item,
  index,
}: { item: (typeof SAMPLE_MENU)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="rounded overflow-hidden shadow-warm group"
      style={{ backgroundColor: "oklch(var(--card))" }}
      data-ocid={`menu.item.${index}`}
    >
      <div className="overflow-hidden h-44">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-semibold text-sm"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "oklch(var(--bakery-text))",
            }}
          >
            {item.name}
          </h3>
          <span
            className="font-bold text-sm"
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
          className="text-xs leading-relaxed"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

function BackendMenuCard({ item, index }: { item: MenuItem; index: number }) {
  const imageUrl = item.imageId ? item.imageId.getDirectURL() : null;
  const fallbacks = [
    "/assets/generated/menu-croissant.dim_400x300.jpg",
    "/assets/generated/menu-sourdough.dim_400x300.jpg",
    "/assets/generated/menu-cinnamon-roll.dim_400x300.jpg",
    "/assets/generated/menu-muffin.dim_400x300.jpg",
    "/assets/generated/menu-baguette.dim_400x300.jpg",
    "/assets/generated/menu-chocolate-cake.dim_400x300.jpg",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index - 1) * 0.07 }}
      className="rounded overflow-hidden shadow-warm group"
      style={{ backgroundColor: "oklch(var(--card))" }}
      data-ocid={`menu.item.${index}`}
    >
      <div className="overflow-hidden h-44">
        <img
          src={imageUrl ?? fallbacks[(index - 1) % fallbacks.length]}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3
            className="font-semibold text-sm"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "oklch(var(--bakery-text))",
            }}
          >
            {item.name}
          </h3>
          <span
            className="font-bold text-sm"
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
          className="text-xs leading-relaxed"
          style={{ color: "oklch(var(--muted-foreground))" }}
        >
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}
