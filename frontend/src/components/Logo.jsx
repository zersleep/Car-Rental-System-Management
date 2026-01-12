import { Car } from "lucide-react";

export default function Logo({ className = "w-8 h-8" }) {
  return (
    <img
      src="/logo.png"
      alt="Logo"
      className={className + " object-contain"}
      onError={(e) => {
        // fallback to icon when file missing
        e.target.onerror = null;
        e.target.style.display = "none";
      }}
    />
  );
}
