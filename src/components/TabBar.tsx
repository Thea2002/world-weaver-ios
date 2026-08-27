import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Share2, Globe2, Sparkles, Table2, Search, Settings, Home } from "lucide-react";

const TABS = [
  { to: "/", label: "Journal", icon: Home },
  { to: "/graph", label: "Graph", icon: Share2 },
  { to: "/world", label: "World", icon: Globe2 },
  { to: "/skills", label: "Skills", icon: Sparkles },
  { to: "/database", label: "DB", icon: Table2 },
  { to: "/search", label: "Suche", icon: Search },
  { to: "/settings", label: "Mehr", icon: Settings },
] as const;


export function TabBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/90 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? path === "/" || path.startsWith("/note") : path.startsWith(to);
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 rounded-xl py-1.5 text-[9px] font-medium tracking-wide transition-all duration-200 ${
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <Icon className="size-[20px]" strokeWidth={active ? 2.4 : 1.8} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
