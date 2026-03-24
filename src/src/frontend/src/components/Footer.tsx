import React from "react";

export default function Footer() {
  return (
    <footer className="bg-navy-900 border-t border-navy-700 py-4 text-center text-xs text-navy-400">
      &copy; {new Date().getFullYear()} RAY INFOTECH — Demo Trading Platform.
      For educational purposes only.
    </footer>
  );
}
