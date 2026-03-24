import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Briefcase,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Shield,
  Star,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (p: string) => location.pathname === p;
  const go = (path: string) => {
    navigate({ to: path });
    setOpen(false);
  };
  const isLoggedIn = !!user || isAdmin;

  const memberNav = [
    {
      path: "/dashboard",
      icon: <LayoutDashboard size={15} />,
      label: "Dashboard",
    },
    { path: "/market", icon: <BarChart2 size={15} />, label: "Market" },
    { path: "/trade", icon: <Briefcase size={15} />, label: "Trade" },
    { path: "/portfolio", icon: <BookOpen size={15} />, label: "Portfolio" },
    { path: "/watchlist", icon: <Star size={15} />, label: "Watchlist" },
    { path: "/chatbot", icon: <MessageCircle size={15} />, label: "Help" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <button
          type="button"
          onClick={() => go("/")}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
            <BarChart2 size={16} className="text-gold-400" />
          </div>
          <div className="leading-none">
            <div className="text-sm font-bold text-gold-400 tracking-widest">
              RAY INFOTECH
            </div>
            <div className="text-[9px] text-navy-400 tracking-wider uppercase">
              Demo Trading
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {!isAdmin && !user && (
            <button
              type="button"
              onClick={() => go("/")}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${isActive("/") ? "text-gold-400 bg-navy-700" : "text-navy-300 hover:text-gold-400 hover:bg-navy-800"}`}
            >
              <Home size={14} /> Home
            </button>
          )}
          {user &&
            memberNav.map((n) => (
              <button
                key={n.path}
                type="button"
                onClick={() => go(n.path)}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${isActive(n.path) ? "text-gold-400 bg-navy-700" : "text-navy-300 hover:text-gold-400 hover:bg-navy-800"}`}
              >
                {n.icon} {n.label}
              </button>
            ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => go("/admin")}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${isActive("/admin") ? "text-gold-400 bg-navy-700" : "text-navy-300 hover:text-gold-400 hover:bg-navy-800"}`}
            >
              <Shield size={14} /> Admin Panel
            </button>
          )}
        </nav>

        {/* Right */}
        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                logout();
                go("/");
              }}
              className="border-navy-500 text-navy-200 hover:bg-navy-700"
            >
              <LogOut size={14} className="mr-1" /> Logout
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => go("/login")}
                className="border-navy-500 text-navy-200 hover:bg-navy-700"
              >
                <LogIn size={14} className="mr-1" /> Login
              </Button>
              <Button
                size="sm"
                onClick={() => go("/register")}
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold"
              >
                Register
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-navy-300"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-navy-700 bg-navy-900 py-2 px-4 space-y-1">
          {!isAdmin && !user && (
            <button
              type="button"
              onClick={() => go("/")}
              className="w-full text-left px-3 py-2 text-sm text-navy-200 flex items-center gap-2"
            >
              <Home size={14} />
              Home
            </button>
          )}
          {user &&
            memberNav.map((n) => (
              <button
                key={n.path}
                type="button"
                onClick={() => go(n.path)}
                className="w-full text-left px-3 py-2 text-sm text-navy-200 flex items-center gap-2"
              >
                {n.icon}
                {n.label}
              </button>
            ))}
          {isAdmin && (
            <button
              type="button"
              onClick={() => go("/admin")}
              className="w-full text-left px-3 py-2 text-sm text-navy-200 flex items-center gap-2"
            >
              <Shield size={14} />
              Admin Panel
            </button>
          )}
          <div className="pt-2">
            {isLoggedIn ? (
              <Button
                size="sm"
                className="w-full"
                variant="outline"
                onClick={() => {
                  logout();
                  go("/");
                }}
              >
                <LogOut size={14} className="mr-1" />
                Logout
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  variant="outline"
                  onClick={() => go("/login")}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gold-500 text-navy-900"
                  onClick={() => go("/register")}
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
