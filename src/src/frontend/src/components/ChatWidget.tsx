import { Bot, MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

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
    "KYC (Know Your Customer) is a mandatory process to verify investor identity. You need Aadhaar, PAN card, and a photo. KYC must be completed before you can trade.",
  ],
  [
    /how to (start|do|begin) (trading|invest)/i,
    "To start trading:\n1. Register & complete KYC\n2. Pay ₹1 joining fee\n3. Get approved by admin\n4. Receive ₹1000000 virtual balance\n5. Practice buying & selling stocks\nUse this demo platform to learn before real money!",
  ],
  [
    /what is demat/i,
    "A Demat (Dematerialized) Account holds your securities electronically. When you buy stocks, they are stored in your Demat account instead of physical certificates.",
  ],
  [
    /what is intraday/i,
    "Intraday trading means buying and selling stocks within the same trading day. Positions are squared off before market close (3:30 PM IST). High-risk and requires active monitoring.",
  ],
  [
    /what is swing trading/i,
    "Swing trading involves holding stocks for a few days to weeks, capturing short-term price moves. Less risky than intraday but more active than long-term investing.",
  ],
  [
    /what is brokerage/i,
    "Brokerage is the fee charged by a broker for executing your trade. On this platform, brokerage is ₹0.50 flat per trade — very low to let you practice affordably.",
  ],
  [
    /what is stt|securities transaction tax/i,
    "STT (Securities Transaction Tax) is a tax levied by the government on stock trades. It's 0.1% of your trade value, charged on both buy and sell sides for delivery trades.",
  ],
  [
    /what is gst|goods and services tax/i,
    "GST (Goods & Services Tax) at 18% is charged on brokerage and exchange transaction charges — not on the full trade value. It's a standard tax on financial services.",
  ],
  [
    /what is virtual balance|demo account|practice account/i,
    "This is a demo/educational platform. Every registered member receives ₹1000000 in virtual balance to practice trading. This virtual money cannot be withdrawn — it's for learning only!",
  ],
  [
    /how to buy|how to sell|how to place (an? )?order/i,
    "To buy/sell on this platform:\n1. Go to the Trade page\n2. Search for any stock/ETF/F&O\n3. Click BUY or SELL button\n4. Enter quantity in the order panel\n5. Review charges (brokerage + taxes)\n6. Click Place Order to confirm.",
  ],
  [
    /what is watchlist/i,
    "A watchlist is a list of stocks you want to monitor. On this app, click the ⭐ star icon next to any stock to add it to your watchlist. Access your watchlist from the menu.",
  ],
  [
    /registration|joining fee|how to register|sign up/i,
    "To register:\n1. Click Register on the homepage\n2. Fill your details & KYC info (Aadhaar, PAN)\n3. Pay ₹1 joining fee via the UPI QR code (Google Pay)\n4. Upload payment proof\n5. Wait for admin approval\n6. Once approved, you get ₹1000000 virtual balance!",
  ],
  [
    /hello|hi|hey|namaste/i,
    "Hello! I'm your RAY INFOTECH Trading Assistant. Ask me anything about stocks, ETFs, F&O, brokerage, taxes, or how to use this platform!",
  ],
  [
    /thank/i,
    "You're welcome! Keep learning and practicing with your virtual balance. Remember: always research before investing real money!",
  ],
];

const DEFAULT_RESPONSE =
  "I'm not sure about that. Try asking: What is a stock? / What is ETF? / What is F&O? / How to buy/sell? / What is brokerage? / What is virtual balance? / How to register?";

function getBotResponse(input: string): string {
  for (const [pattern, response] of FAQ) {
    if (pattern.test(input)) return response;
  }
  return DEFAULT_RESPONSE;
}

const SUGGESTIONS = [
  "What is a stock?",
  "What is ETF?",
  "What is F&O?",
  "How to start trading?",
  "What is virtual balance?",
  "How to buy/sell?",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! 👋 I'm your RAY INFOTECH Trading Assistant. Ask me about stocks, ETFs, F&O, or how to use this platform!",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const sendMessage = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    const userMsg: Message = { role: "user", text: msg };
    const botMsg: Message = { role: "bot", text: getBotResponse(msg) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            data-ocid="chatwidget.panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              background: "oklch(var(--card))",
              border: "1px solid oklch(var(--border))",
              height: "460px",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: "oklch(var(--primary))" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    Trading Assistant
                  </p>
                  <p className="text-xs text-white/70">
                    RAY INFOTECH · Always here
                  </p>
                </div>
              </div>
              <button
                data-ocid="chatwidget.close_button"
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close chat"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((m, i) => {
                const key = `${m.role}-${i}`;
                return (
                  <div
                    key={key}
                    className={`flex gap-2 ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {m.role === "bot" && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: "oklch(var(--primary) / 0.2)",
                          border: "1px solid oklch(var(--primary) / 0.4)",
                        }}
                      >
                        <Bot
                          size={10}
                          style={{ color: "oklch(var(--primary))" }}
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-xs whitespace-pre-wrap leading-relaxed ${
                        m.role === "user"
                          ? "rounded-tr-none text-foreground"
                          : "rounded-tl-none"
                      }`}
                      style={
                        m.role === "user"
                          ? { background: "oklch(var(--primary) / 0.2)" }
                          : {
                              background: "oklch(var(--muted))",
                              border: "1px solid oklch(var(--border))",
                            }
                      }
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 pb-2 flex-shrink-0">
              <div className="flex gap-1.5 flex-wrap">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="text-[10px] px-2 py-1 rounded-full border border-border bg-muted/50 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-3 pb-3 flex-shrink-0 flex gap-2">
              <input
                ref={inputRef}
                data-ocid="chatwidget.input"
                className="flex-1 rounded-xl px-3 py-2 text-xs bg-background border border-border focus:outline-none focus:ring-1 placeholder:text-muted-foreground"
                style={
                  {
                    "--tw-ring-color": "oklch(var(--primary))",
                  } as React.CSSProperties
                }
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                data-ocid="chatwidget.submit_button"
                type="button"
                onClick={() => sendMessage()}
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80 active:scale-95"
                style={{ background: "oklch(var(--primary))" }}
                aria-label="Send message"
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        data-ocid="chatwidget.button"
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen((v) => !v)}
        className="relative w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{
          background: isOpen ? "oklch(var(--muted))" : "oklch(var(--primary))",
          border: "2px solid oklch(var(--border))",
        }}
        aria-label={isOpen ? "Close chat" : "Open trading assistant"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={22} className="text-foreground" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulsing notification dot */}
        {!isOpen && (
          <span className="absolute top-1 right-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
          </span>
        )}
      </motion.button>
    </div>
  );
}
