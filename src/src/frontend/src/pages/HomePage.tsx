import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  BarChart2,
  BookOpen,
  Bot,
  Briefcase,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import React from "react";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const features = [
    {
      icon: <BarChart2 size={24} />,
      title: "Live Market Charts",
      desc: "Real NSE/BSE charts powered by TradingView",
    },
    {
      icon: <Briefcase size={24} />,
      title: "Practice Trading",
      desc: "Trade Equities, ETFs, and F&O with ₹1000000 virtual money",
    },
    {
      icon: <BookOpen size={24} />,
      title: "Portfolio Tracker",
      desc: "Track your holdings, P&L, and trade history",
    },
    {
      icon: <Star size={24} />,
      title: "Watchlist",
      desc: "Follow your favorite stocks and stay updated",
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Market Indices",
      desc: "Monitor Nifty 50, Sensex, and sector indices",
    },
    {
      icon: <Bot size={24} />,
      title: "AI Help Chatbot",
      desc: "Learn trading concepts with our educational assistant",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative bg-navy-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-4 bg-gold-500/20 text-gold-400 border-gold-500/30">
            Educational Platform
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Learn Stock Trading with
            <span className="text-gold-400"> Virtual Money</span>
          </h1>
          <p className="text-navy-200 text-lg max-w-2xl mx-auto mb-8">
            Practice trading Indian stocks (NSE/BSE) with ₹1000000 virtual
            balance. No real money involved — pure education.
          </p>
          {user ? (
            <Button
              onClick={() => navigate({ to: "/dashboard" })}
              size="lg"
              className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold"
            >
              Go to Dashboard <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate({ to: "/register" })}
                size="lg"
                className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold"
              >
                Start for ₹1 <ChevronRight size={18} className="ml-1" />
              </Button>
              <Button
                onClick={() => navigate({ to: "/login" })}
                size="lg"
                variant="outline"
                className="border-gold-500/40 text-gold-300 hover:bg-gold-500/10"
              >
                Sign In
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-navy-800 border-y border-gold-500/20">
        <div className="max-w-4xl mx-auto px-4 py-5 grid grid-cols-3 gap-4 text-center">
          {[
            { label: "Joining Fee", value: "₹1 Only" },
            { label: "Virtual Balance", value: "₹1000000" },
            { label: "Asset Classes", value: "3 (Equity, ETF, F&O)" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-xl font-bold text-gold-400">{s.value}</div>
              <div className="text-xs text-navy-300">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Everything You Need to Learn Trading
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <Card
                key={f.title}
                className="bg-card border border-gold-500/10 hover:border-gold-500/30 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="text-gold-400 mb-3">{f.icon}</div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && !isAdmin && (
        <section className="bg-navy-900 py-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to Start Learning?
          </h2>
          <p className="text-navy-300 mb-6">
            Pay just ₹1 and get access to a full trading simulator.
          </p>
          <Button
            onClick={() => navigate({ to: "/register" })}
            size="lg"
            className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold"
          >
            Register Now <ChevronRight size={18} className="ml-1" />
          </Button>
        </section>
      )}
    </div>
  );
}
