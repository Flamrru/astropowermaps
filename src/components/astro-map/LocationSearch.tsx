"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, X, Loader2 } from "lucide-react";
import { BirthLocation } from "@/lib/astro/types";

interface LocationSearchProps {
  value: BirthLocation | null;
  onChange: (location: BirthLocation | null) => void;
  placeholder?: string;
}

interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
}

/**
 * LocationSearch - Inline dropdown city search
 * Simple approach: dropdown renders directly below input (no portal)
 */
export default function LocationSearch({
  value,
  onChange,
  placeholder = "Enter your birth city...",
}: LocationSearchProps) {
  const [query, setQuery] = useState(value?.name || "");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync query with value
  useEffect(() => {
    if (value?.name) {
      setQuery(value.name);
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    // Don't search if query matches selected value
    if (value && query === value.name) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        if (!token) {
          console.error("Mapbox token not configured");
          return;
        }

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${token}&types=place,locality,region&limit=3`
        );

        if (!response.ok) throw new Error("Geocoding failed");

        const data = await response.json();
        setResults(data.features || []);
        if (data.features?.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Location search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = async (result: GeocodingResult) => {
    const lat = result.center[1];
    const lng = result.center[0];

    // Fetch timezone from our API
    let timezone = "UTC";
    try {
      const response = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      timezone = data.timezone || "UTC";
    } catch (error) {
      console.error("Timezone lookup failed, using UTC:", error);
    }

    const location: BirthLocation = {
      name: result.place_name,
      lng,
      lat,
      timezone,
    };

    setQuery(result.place_name);
    onChange(location);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
          {isLoading ? (
            <Loader2 size={18} className="animate-spin text-[#E8C547]/60" />
          ) : (
            <MapPin size={18} />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="
            w-full px-4 py-3 rounded-xl
            bg-white/[0.06]
            border border-white/10
            text-white placeholder:text-white/30
            text-[14px] leading-normal
            focus:outline-none focus:border-gold/40 focus:bg-white/[0.08]
            transition-all duration-200
          "
          style={{
            paddingLeft: 44,
            paddingRight: query ? 40 : 16,
            WebkitAppearance: "none",
          }}
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Inline Dropdown - positioned relative to container */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 z-50 rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, rgba(15, 15, 30, 0.98) 0%, rgba(10, 10, 25, 0.99) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              className="
                w-full px-4 py-3 text-left
                flex items-center gap-3
                hover:bg-white/[0.06]
                active:bg-white/[0.08]
                transition-colors duration-150
                group
              "
              style={{
                borderBottom: index < results.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              {/* Gold dot indicator */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform duration-200 group-hover:scale-150"
                style={{
                  background: "linear-gradient(135deg, #E8C547 0%, #C9A227 100%)",
                  boxShadow: "0 0 6px rgba(232, 197, 71, 0.5)",
                }}
              />
              <span className="text-white/80 text-[13px] truncate group-hover:text-white/95 transition-colors">
                {result.place_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
