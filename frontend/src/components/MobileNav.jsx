import React from "react";
import { LayoutDashboard, Orbit, Search, PlusCircle, Menu } from "lucide-react";

// R3 — Bottom tab bar for phones/tablets (rendered with lg:hidden).
// Tabs: Dashboard · Graph (HITL pending badge) · Search · FIR ingest · Menu.
export default function MobileNav({
  activeTab,
  onTabChange,
  pendingCount = 0,
  onOpenSearch,
  onOpenMenu,
  onOpenIngest
}) {
  const go = (id) => {
    if (onTabChange) onTabChange(id);
  };

  const tabs = [
    { id: "dashboard", label: "Home", icon: LayoutDashboard, onTap: () => go("dashboard") },
    { id: "graph", label: "Graph", icon: Orbit, badge: pendingCount, onTap: () => go("graph") },
    { id: "search", label: "Search", icon: Search, onTap: () => onOpenSearch && onOpenSearch() },
    { id: "fir", label: "FIR", icon: PlusCircle, onTap: () => onOpenIngest && onOpenIngest() },
    { id: "menu", label: "Menu", icon: Menu, onTap: () => onOpenMenu && onOpenMenu() }
  ];

  return (
    <nav className="mobile-nav lg:hidden" aria-label="Mobile primary navigation">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={t.onTap}
            className={`mobile-nav-tab ${isActive ? "active" : ""}`}
            aria-label={t.label}
          >
            <Icon size={20} />
            <span>{t.label}</span>
            {t.badge > 0 && (
              <span className="mobile-nav-count">{t.badge > 99 ? "99+" : t.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
