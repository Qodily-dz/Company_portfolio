"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LoginScreen } from "@/components/admin/LoginScreen";
import { adminApi, getStoredToken, storeSession, useAdminUser } from "@/components/admin/api";
import type { AdminSection } from "@/components/admin/data";
import Overview from "@/components/admin/sections/Overview";
import Projects from "@/components/admin/sections/Projects";
import Services from "@/components/admin/sections/Services";
import Insights from "@/components/admin/sections/Insights";
import Messages from "@/components/admin/sections/Messages";
import Media from "@/components/admin/sections/Media";
import Website from "@/components/admin/sections/Website";
import Navigation from "@/components/admin/sections/Navigation";
import Seo from "@/components/admin/sections/Seo";
import Settings from "@/components/admin/sections/Settings";

export default function AdminPage() {
  const user = useAdminUser();
  const [active, setActive] = useState<AdminSection>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [newContacts, setNewContacts] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (getStoredToken()) {
      adminApi
        .dashboard()
        .then((r) => setNewContacts(r.data.stats.newContacts))
        .catch(() => {});
    }
  }, [user]);

  async function logout() {
    await adminApi.logout();
    storeSession(null, null);
  }

  if (!user) {
    return <LoginScreen onSuccess={() => {}} />;
  }

  return (
    <AdminShell
      active={active}
      onNavigate={setActive}
      collapsed={collapsed}
      onToggle={() => setCollapsed((v) => !v)}
      newContacts={newContacts}
      user={user}
      onLogout={logout}
    >
      {active === "dashboard" && <Overview />}
      {active === "projects" && <Projects mode="projects" />}
      {active === "case-studies" && <Projects mode="case-studies" />}
      {active === "services" && <Services />}
      {active === "insights" && <Insights />}
      {active === "messages" && <Messages />}
      {active === "media" && <Media />}
      {active === "website" && <Website />}
      {active === "navigation" && <Navigation />}
      {active === "seo" && <Seo />}
      {active === "settings" && <Settings onLogout={logout} />}
    </AdminShell>
  );
}