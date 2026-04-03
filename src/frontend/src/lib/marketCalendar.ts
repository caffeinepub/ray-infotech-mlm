export interface MarketStatus {
  isOpen: boolean;
  reason: "open" | "closed" | "weekend" | "holiday";
  holidayName?: string;
  message: string;
}

// NSE 2026 trading holidays (YYYY-MM-DD format)
const NSE_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-26": "Republic Day",
  "2026-02-26": "Maha Shivaratri",
  "2026-03-25": "Holi",
  "2026-04-02": "Ram Navami",
  "2026-04-03": "Good Friday",
  "2026-04-14": "Dr. Ambedkar Jayanti / Baisakhi",
  "2026-05-01": "Maharashtra Day",
  "2026-06-05": "Eid Al Adha (Bakri Id)",
  "2026-08-15": "Independence Day",
  "2026-08-27": "Ganesh Chaturthi",
  "2026-10-02": "Gandhi Jayanti",
  "2026-10-22": "Dussehra",
  "2026-11-11": "Diwali (Laxmi Puja)",
  "2026-11-12": "Diwali (Balipratipada)",
  "2026-11-25": "Guru Nanak Jayanti",
  "2026-12-25": "Christmas",
};

export function getMarketStatus(): MarketStatus {
  const now = new Date();
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);

  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  const dateKey = `${year}-${month}-${day}`;

  // Check holiday
  if (NSE_HOLIDAYS_2026[dateKey]) {
    const holidayName = NSE_HOLIDAYS_2026[dateKey];
    return {
      isOpen: false,
      reason: "holiday",
      holidayName,
      message: `Market Closed \u2013 ${holidayName}`,
    };
  }

  // Check weekend (IST)
  const istDay = ist.getUTCDay();
  if (istDay === 0 || istDay === 6) {
    return {
      isOpen: false,
      reason: "weekend",
      message:
        "Market Closed \u2013 Weekend (Mon\u2013Fri: 9:15 AM to 3:30 PM IST)",
    };
  }

  // Check trading hours
  const hours = ist.getUTCHours();
  const minutes = ist.getUTCMinutes();
  const totalMins = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  if (totalMins >= marketOpen && totalMins <= marketClose) {
    return {
      isOpen: true,
      reason: "open",
      message: "Market Open \u2013 9:15 AM to 3:30 PM IST",
    };
  }

  return {
    isOpen: false,
    reason: "closed",
    message:
      "Market Closed \u2013 Trading hours: 9:15 AM to 3:30 PM IST (Mon\u2013Fri)",
  };
}
