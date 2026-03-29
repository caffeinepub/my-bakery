import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AdminPanel from "./components/AdminPanel";
import CheckoutPage from "./components/CheckoutPage";
import PublicSite from "./components/PublicSite";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsCallerAdmin } from "./hooks/useQueries";

export default function App() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: isAdmin } = useIsCallerAdmin();
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleAdminToggle = (show: boolean) => {
    setShowAdmin(show);
  };

  return (
    <>
      <Toaster position="top-right" />
      {showAdmin && isAuthenticated && isAdmin ? (
        <AdminPanel onExitAdmin={() => handleAdminToggle(false)} />
      ) : showCheckout ? (
        <CheckoutPage onBack={() => setShowCheckout(false)} />
      ) : (
        <PublicSite
          isAuthenticated={isAuthenticated}
          isAdmin={!!isAdmin}
          onAdminClick={() => handleAdminToggle(true)}
          onCheckout={() => setShowCheckout(true)}
        />
      )}
    </>
  );
}
