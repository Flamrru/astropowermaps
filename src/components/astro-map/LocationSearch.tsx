"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
          )}.json?access_token=${token}&types=place,locality,region&limit=5`
        );

        if (!response.ok) throw new Error("Geocoding failed");

        const data = await response.json();
        setResults(data.features || []);
        setIsOpen(data.features?.length > 0);
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
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // Fallback to UTC if lookup fails
    }

    const location: BirthLocation = {
      name: result.place_name,
      lng,
      lat,
      timezone, // Now uses accurate timezone from GeoNames!
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
            w-full pl-12 pr-10 py-4 rounded-xl
            bg-white/10 backdrop-blur-xl
            border border-white/20
            text-white placeholder:text-white/40
            text-base
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

      {/* Dropdown Results */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="
              absolute z-50 w-full mt-2
              bg-[#0a0a1e]
              border border-white/20 rounded-xl
              shadow-[0_10px_40px_rgba(0,0,0,0.5)]
              overflow-hidden
            "
          >
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(result)}
                className="
                  w-full px-4 py-3 text-left
                  flex items-center gap-3
                  text-white/80 hover:text-white
                  hover:bg-white/10
                  border-b border-white/5 last:border-b-0
                  transition-colors
                "
              >
                <MapPin size={16} className="text-[#C9A227] flex-shrink-0" />
                <span className="truncate">{result.place_name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
