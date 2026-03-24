import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { Bot, Send, User } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface Message {
  role: "user" | "bot";
  text: string;
}

const FAQ: [RegExp, string][] = [
  [
    /what is (a )?stock|what are stocks/i,
    "A stock (or share) represents ownership in a company. When you buy a stock, you own a small piece of that company. Stock prices rise and fall based on the company's performance and market sentiment.",
  ],
  [
    /what is (an? )?etf/i,
    "An ETF (Exchange-Traded Fund) is a basket of securities (like stocks or bonds) that trades on an exchange. ETFs offer diversification at low cost. Examples: Nifty BeES (tracks Nifty 50), Gold BeES (tracks gold prices).",
  ],
  [
    /what is f&o|futures|options|fno/i,
    "Futures & Options (F&O) are derivative contracts.\n• Futures: Agreement to buy/sell an asset at a set price on a future date.\n• Options: Right (not obligation) to buy (Call) or sell (Put) at a set price.\nF&O involves higher risk and requires understanding of leverage.",
  ],
  [
    /what is nifty|nifty 50/i,
    "Nifty 50 is India's benchmark stock index, tracking the top 50 companies listed on the NSE (National Stock Exchange). It's a key indicator of the Indian stock market performance.",
  ],
  [
    /what is sensex/i,
    "Sensex (Sensitive Index) is India's oldest stock market index, tracking the top 30 companies on BSE (Bombay Stock Exchange). It was started in 1986.",
  ],
  [
    /what is p&l|profit and loss|pnl/i,
    "P&L (Profit & Loss) is the difference between your selling price and buying price.\n• P&L = (Current Price - Avg Buy Price) × Quantity\n• Positive P&L = Profit; Negative P&L = Loss.",
  ],
  [
    /what is portfolio/i,
    "A portfolio is the collection of all your investments (stocks, ETFs, F&O). It shows your total invested amount, current value, and overall P&L.",
  ],
  [
    /what is candlestick|candle chart/i,
    "A candlestick chart shows price movement for a period.\n• Green candle: Price closed higher than it opened\n• Red candle: Price closed lower than it opened\n• The body shows open-close range; wicks show high-low range.",
  ],
  [
    /what is volume/i,
    "Volume is the number of shares traded in a given period. High volume usually means high interest/activity in a stock. Volume spikes can signal important price moves.",
  ],
  [
    /what is (market cap|capitalization)/i,
    "Market Cap = Current Stock Price × Total Shares Outstanding. It represents the total market value of a company.\n• Large-cap: > ₹20,000 Cr\n• Mid-cap: ₹5,000–20,000 Cr\n• Small-cap: < ₹5,000 Cr",
  ],
  [
    /bull|bearish|bear market|bullish/i,
    "Bull Market: Prices are rising, investors are optimistic. Bear Market: Prices are falling 20%+ from recent highs, pessimism dominates. Bulls push prices up; Bears push prices down.",
  ],
  [
    /what is bid|ask price/i,
    "Bid Price: Highest price a buyer is willing to pay. Ask Price: Lowest price a seller will accept. The difference is called the spread.",
  ],
  [
    /what is kyc/i,
    "KYC (Know Your Customer) is a mandatory process to verify investor identity. You need Aadhaar, PAN card, and sometimes a photo. KYC is required before you can trade.",
  ],
  [
    /how to (start|do|begin) (trading|invest)/i,
    "To start trading:\n1. Complete KYC (Aadhaar + PAN)\n2. Open a Demat & Trading account\n3. Add funds\n4. Research stocks/ETFs\n5. Start with small amounts\n6. Diversify — don't put all money in one stock.\nUse this demo platform to practice before using real money!",
  ],
  [
    /what is demat/i,
    "A Demat (Dematerialized) Account holds your securities electronically. When you buy stocks, they are stored in your Demat account instead of physical certificates.",
  ],
  [
    /what is intraday/i,
    "Intraday trading means buying and selling stocks within the same trading day. Positions are squared off before market close. It's high-risk and requires active monitoring.",
  ],
  [
    /what is swing trading/i,
    "Swing trading involves holding stocks for a few days to weeks, capturing short-term price moves. It's less risky than intraday but more active than long-term investing.",
  ],
  [
    /hello|hi|hey|namaste/i,
    "Hello! I'm your trading assistant. Ask me anything about stocks, ETFs, F&O, or trading concepts. I'm here to help you learn!",
  ],
  [
    /thank/i,
    "You're welcome! Keep learning and practicing. Remember: always research before investing real money!",
  ],
];

const DEFAULT_RESPONSE =
  "I'm not sure about that. Try asking about: stocks, ETFs, F&O, Nifty, Sensex, P&L, portfolio, candlestick charts, market cap, KYC, how to trade, or trading terms like bid/ask, bull/bear, volume.";

function getBotResponse(input: string): string {
  for (const [pattern, response] of FAQ) {
    if (pattern.test(input)) return response;
  }
  return DEFAULT_RESPONSE;
}

export default function ChatbotPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! I'm your trading education assistant. Ask me about stocks, ETFs, F&O, market concepts, or how to trade. How can I help you?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!user) return null;

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { role: "user", text };
    const botMsg: Message = { role: "bot", text: getBotResponse(text) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const suggestions = [
    "What is a stock?",
    "What is ETF?",
    "What is F&O?",
    "What is Nifty?",
    "How to start trading?",
  ];

  return (
    <div
      className="max-w-2xl mx-auto px-4 py-6 flex flex-col"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Bot size={20} className="text-gold-400" /> Trading Assistant
      </h1>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setInput(s);
            }}
            className="text-xs bg-muted/50 hover:bg-muted border border-border rounded-full px-3 py-1 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => {
          const msgKey = `${m.role}-${i}-${m.text.slice(0, 10)}`;
          return (
            <div
              key={msgKey}
              className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-gold-400" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-gold-500/20 text-foreground rounded-tr-sm"
                    : "bg-card border border-border rounded-tl-sm"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          className="flex-1 border border-border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-gold-500"
          placeholder="Ask about stocks, ETFs, F&O..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button
          onClick={sendMessage}
          className="bg-gold-500 hover:bg-gold-600 text-navy-900 font-semibold px-4"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  );
}
