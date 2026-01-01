"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, X } from "lucide-react";
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
  context?: Array<{ id: string; text: string }>;
}

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

  // Close dropdown when clicking/tapping outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
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
    let timezone = 'UTC';
    try {
      const response = await fetch(`/api/timezone?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      timezone = data.timezone;

      if (data.error) {
        console.warn('Timezone lookup warning:', data.error);
      }
    } catch (error) {
      console.error('Timezone lookup failed, using UTC:', error);
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Search size={20} />
            </motion.div>
          ) : (
            <MapPin size={20} />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="
            w-full pl-11 pr-10 py-4 rounded-xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            text-white placeholder:text-white/40
            text-base text-left
            caret-white
            focus:outline-none focus:border-[#C9A227]/50
            focus:shadow-[0_0_20px_rgba(201,162,39,0.15)]
            transition-all duration-300
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Dropdown - simple absolute positioning, no portal */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            backgroundColor: "#0a0a1e",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              onClick={() => handleSelect(result)}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleSelect(result);
              }}
              className="
                w-full px-4 py-3 text-left
                flex items-center gap-3
                text-white/80 hover:text-white hover:bg-[#15152a]
                active:bg-[#15152a]
                border-b border-white/5 last:border-b-0
                transition-colors
              "
              style={{
                backgroundColor: "#0a0a1e",
              }}
            >
              <MapPin size={16} className="text-[#C9A227] flex-shrink-0" />
              <span className="truncate">{result.place_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
