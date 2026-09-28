import type { ReactNode } from "react";
import DeskRuntime from "./desk-runtime";
import { MarketTracker } from "./market-tracker";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, BookOpen, Layers, LayoutGrid, LineChart, ListChecks, ShieldCheck, UserRound, Workflow } from "lucide-react";
import { AgeGate } from "@/components/desk/age-gate";
import { CardRail } from "@/components/desk/card-rail";
import { StatusBar } from "@/components/desk/status-bar";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/record", label: "Record", icon: ListChecks },
  { to: "/slate", label: "Slate", icon: LayoutGrid },
  { to: "/book", label: "Book", icon: BookOpen },
  { to: "/parlay", label: "Parlays", icon: Layers },
  { to: "/props", label: "Props", icon: UserRound, hideOnMobile: true },
  { to: "/agents", label: "Agents", icon: Workflow },
  { to: "/learn", label: "Review", icon: LineChart },
  { to: "/gates", label: "Gates", icon: ShieldCheck, hideOnMobile: true },
] as const;

function isDeskPath(pathname: string) {
  return pathname !== "/" && pathname !== "/plans" && pathname !== "/legal" && pathname !== "/gates";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const desk = isDeskPath(pathname);

  return (
    <div className="desk-grid min-h-dvh bg-background text-foreground">
      <MarketTracker />
      {desk ? <DeskRuntime /> : null}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-h-11 items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
                <Activity className="size-4" strokeWidth={1.75} />
              </span>
              <span className="leading-none">
                <span className="block text-sm font-medium tracking-tight">SyndicateSports</span>
                <span className="block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Week 03 · 2026
                </span>
              </span>
            </Link>
            <Link
              to="/plans"
              className="font-mono text-xs uppercase tracking-wider text-warn hover:underline"
            >
              Pilot
            </Link>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "inline-flex h-10 min-h-10 items-center gap-2 rounded-md px-2.5 text-sm transition-colors lg:px-3",
                    active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={1.75} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <Link
            to="/plans"
            className={cn(
              "hidden min-h-10 items-center font-mono text-xs text-muted-foreground md:inline-flex",
              pathname.startsWith("/plans") ? "text-foreground" : "hover:text-foreground",
            )}
          >
            Plans
          </Link>
        </div>
      </header>
      <AgeGate />
      <StatusBar />
      {desk ? <CardRail /> : null}

      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 md:pb-12">
        {children}
      </main>

      <footer className="mx-auto hidden w-full max-w-6xl gap-4 px-4 pb-8 pt-2 font-mono text-xs text-muted-foreground md:flex">
        <Link to="/gates" className="hover:text-foreground">
          Launch gates
        </Link>
        <Link to="/legal" className="hover:text-foreground">
          Terms
        </Link>
        <Link to="/plans" className="hover:text-foreground">
          Pilot
        </Link>
        <span>21+ · 1-800-GAMBLER</span>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
        <ul className="grid grid-cols-6">
          {NAV.filter((item) => !("hideOnMobile" in item && item.hideOnMobile)).map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
