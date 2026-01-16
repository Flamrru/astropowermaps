"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
// Sparkles import removed - not currently used
import mapboxgl from "mapbox-gl";
import { AstrocartographyResult, PlanetId, LineType, TooltipData } from "@/lib/astro/types";
import { getShortInterpretation } from "@/lib/astro/interpretations";
import { calculateAllPowerPlaces, LifeCategory } from "@/lib/astro/power-places";
import { MapHighlight } from "@/lib/reveal-state";
import MapControls from "./MapControls";
import LineModal from "./LineModal";
import CategoryFilters from "./CategoryFilters";
import PowerPlacesPanel from "./PowerPlacesPanel";
import MobileFloatingPill from "./MobileFloatingPill";
import WelcomeTutorial from "./WelcomeTutorial";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";
import { useTrack } from "@/lib/hooks/useTrack";

interface StellaContext {
  displayMessage: string;
  hiddenContext: string;
}

interface FlyToTarget {
  lat: number;
  lng: number;
  cityName: string;
}

interface AstroMapProps {
  data: AstrocartographyResult;
  onReset: () => void;
  // Background mode props
  mode?: "full" | "background";
  opacity?: number;
  highlight?: MapHighlight | null;
  interactive?: boolean;
  showPanels?: boolean;
  showControls?: boolean;
  showCityMarkers?: boolean | number;
  autoAnimation?: "reveal" | "none";
  onAnimationComplete?: () => void;
  // Stella integration (for dashboard mode)
  onAskStella?: (context: StellaContext) => void;
  // Optional fly-to target on initial load
  flyToOnLoad?: FlyToTarget;
}

// Category colors for city markers
const CATEGORY_MARKER_COLORS: Record<LifeCategory, { color: string; glow: string }> = {
  love: { color: "#E8A4C9", glow: "rgba(232, 164, 201, 0.6)" },
  career: { color: "#E8C547", glow: "rgba(232, 197, 71, 0.6)" },
  growth: { color: "#9B7ED9", glow: "rgba(155, 126, 217, 0.6)" },
  home: { color: "#C4C4C4", glow: "rgba(196, 196, 196, 0.5)" },
};

/**
 * Creates a custom marker element using safe DOM methods
 */
function createMarkerElement(): HTMLDivElement {
  const markerEl = document.createElement("div");
  markerEl.className = "birth-marker";

  const inner = document.createElement("div");
  inner.className = "marker-inner";

  const pulse = document.createElement("div");
  pulse.className = "marker-pulse";

  const dot = document.createElement("div");
  dot.className = "marker-dot";

  inner.appendChild(pulse);
  inner.appendChild(dot);
  markerEl.appendChild(inner);

  return markerEl;
}

/**
 * Creates a city marker element as a glowing map pin
 * @param animated - If true, marker will have pop-in animation
 */
function createCityMarkerElement(
  cityName: string,
  category: LifeCategory,
  _planetSymbol: string,
  animated: boolean = false
): HTMLDivElement {
  const colors = CATEGORY_MARKER_COLORS[category];

  const markerEl = document.createElement("div");
  markerEl.className = "city-pin-marker";

  // Marker container - NO transform here (Mapbox uses transform for positioning)
  markerEl.style.cssText = `
    cursor: pointer;
    width: 20px;
    height: 28px;
  `;

  // SVG Pin shape - simple and performant
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 20 28");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "28");

  // Apply animation to SVG (not the marker container) to avoid conflicting with Mapbox transforms
  const baseFilter = `drop-shadow(0 0 4px ${colors.glow}) drop-shadow(0 1px 2px rgba(0,0,0,0.5))`;
  if (animated) {
    svg.style.cssText = `
      display: block;
      filter: ${baseFilter};
      opacity: 0;
      transform: scale(0) translateY(10px);
      animation: cityPinPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    `;
  } else {
    svg.style.cssText = `
      display: block;
      filter: ${baseFilter};
    `;
  }

  // Pin body (teardrop shape) - pointing down
  const pinPath = document.createElementNS(svgNS, "path");
  pinPath.setAttribute("d", "M10 0C4.5 0 0 4.5 0 10c0 6 10 18 10 18s10-12 10-18C20 4.5 15.5 0 10 0z");
  pinPath.setAttribute("fill", colors.color);
  pinPath.setAttribute("stroke", "rgba(0, 0, 0, 0.3)");
  pinPath.setAttribute("stroke-width", "0.5");

  // Inner highlight circle
  const innerCircle = document.createElementNS(svgNS, "circle");
  innerCircle.setAttribute("cx", "10");
  innerCircle.setAttribute("cy", "9");
  innerCircle.setAttribute("r", "4");
  innerCircle.setAttribute("fill", "rgba(255, 255, 255, 0.3)");

  svg.appendChild(pinPath);
  svg.appendChild(innerCircle);
  markerEl.appendChild(svg);

  // Store city name
  markerEl.setAttribute("data-city", cityName);

  return markerEl;
}

/**
 * Creates popup content using safe DOM methods
 */
function createPopupContent(locationName: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "birth-popup";

  const strong = document.createElement("strong");
  strong.textContent = "Your Birth Location";

  const br = document.createElement("br");

  const text = document.createTextNode(locationName);

  container.appendChild(strong);
  container.appendChild(br);
  container.appendChild(text);

  return container;
}

/**
 * Category colors for popup theming
 */
const POPUP_CATEGORY_COLORS: Record<string, { primary: string; glow: string }> = {
  love: { primary: "#E8A4C9", glow: "rgba(232, 164, 201, 0.4)" },
  career: { primary: "#E8C547", glow: "rgba(232, 197, 71, 0.4)" },
  growth: { primary: "#9B7ED9", glow: "rgba(155, 126, 217, 0.4)" },
  home: { primary: "#C4C4C4", glow: "rgba(196, 196, 196, 0.3)" },
};

/**
 * Creates a single celestial star SVG element for ratings
 */
function createStarSVG(
  state: "full" | "half" | "empty",
  color: string,
  size: number = 12,
  index: number = 0
): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", size.toString());
  svg.setAttribute("height", size.toString());
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.style.cssText = state !== "empty" ? `filter: drop-shadow(0 0 2px ${color}80);` : "";

  // Add gradient definition for half stars
  if (state === "half") {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
    gradient.setAttribute("id", `popupHalfGrad-${index}`);
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("offset", "50%");
    stop1.setAttribute("stop-color", color);

    const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("offset", "50%");
    stop2.setAttribute("stop-color", "transparent");

    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
  }

  // 4-pointed celestial star path
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M8 1L9.2 5.8L14 7L9.2 8.2L8 13L6.8 8.2L2 7L6.8 5.8L8 1Z");
  path.setAttribute(
    "fill",
    state === "full"
      ? color
      : state === "half"
      ? `url(#popupHalfGrad-${index})`
      : "transparent"
  );
  path.setAttribute("stroke", state === "empty" ? "rgba(255,255,255,0.2)" : color);
  path.setAttribute("stroke-width", state === "empty" ? "0.8" : "0.5");
  path.setAttribute("stroke-linejoin", "round");
  svg.appendChild(path);

  // Center sparkle for filled stars
  if (state !== "empty") {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "8");
    circle.setAttribute("cy", "7");
    circle.setAttribute("r", "0.6");
    circle.setAttribute("fill", "rgba(255,255,255,0.9)");
    svg.appendChild(circle);
  }

  return svg;
}

/**
 * Creates city popup content with celestial dark theme
 */
function createCityPopupContent(
  cityName: string,
  flag: string,
  category: string,
  planetSymbol: string,
  lineType: string,
  distance: number,
  interpretation: string,
  stars: number
): HTMLDivElement {
  const colors = POPUP_CATEGORY_COLORS[category] || POPUP_CATEGORY_COLORS.career;

  // Main container
  const container = document.createElement("div");
  container.className = "city-popup-celestial";
  container.style.cssText = `
    padding: 0;
    max-width: 220px;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  // Accent line at top (category colored)
  const accentLine = document.createElement("div");
  accentLine.style.cssText = `
    height: 2px;
    background: linear-gradient(90deg, transparent, ${colors.primary}, transparent);
    margin-bottom: 12px;
    border-radius: 1px;
  `;
  container.appendChild(accentLine);

  // Header: Flag + City Name
  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  `;

  const flagEl = document.createElement("span");
  flagEl.textContent = flag;
  flagEl.style.cssText = `
    font-size: 20px;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;

  const cityNameEl = document.createElement("span");
  cityNameEl.textContent = cityName;
  cityNameEl.style.cssText = `
    color: rgba(255, 255, 255, 0.95);
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    flex: 1;
  `;

  header.appendChild(flagEl);
  header.appendChild(cityNameEl);
  container.appendChild(header);

  // Star Rating Row
  const ratingRow = document.createElement("div");
  ratingRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 10px;
  `;

  // Create 5 stars
  for (let i = 0; i < 5; i++) {
    const position = i + 1;
    let state: "full" | "half" | "empty";
    if (stars >= position) state = "full";
    else if (stars >= position - 0.5) state = "half";
    else state = "empty";

    const starSvg = createStarSVG(state, colors.primary, 14, i);
    ratingRow.appendChild(starSvg);
  }

  // Star value text
  const starValue = document.createElement("span");
  starValue.textContent = stars.toFixed(1);
  starValue.style.cssText = `
    margin-left: 6px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 11px;
    font-weight: 500;
  `;
  ratingRow.appendChild(starValue);

  container.appendChild(ratingRow);

  // Info badges row: Planet badge + Distance
  const badgeRow = document.createElement("div");
  badgeRow.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  `;

  // Planet + Line Type badge
  const planetBadge = document.createElement("span");
  planetBadge.textContent = `${planetSymbol} ${lineType}`;
  planetBadge.style.cssText = `
    background: ${colors.primary}20;
    color: ${colors.primary};
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 6px;
    font-weight: 600;
    border: 1px solid ${colors.primary}30;
    letter-spacing: 0.03em;
  `;

  // Distance indicator
  const distanceEl = document.createElement("span");
  distanceEl.textContent = `${distance} km`;
  distanceEl.style.cssText = `
    color: rgba(255, 255, 255, 0.4);
    font-size: 11px;
    font-weight: 500;
  `;

  badgeRow.appendChild(planetBadge);
  badgeRow.appendChild(distanceEl);
  container.appendChild(badgeRow);

  // Divider
  const divider = document.createElement("div");
  divider.style.cssText = `
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    margin-bottom: 10px;
  `;
  container.appendChild(divider);

  // Interpretation text
  const desc = document.createElement("p");
  desc.textContent = interpretation;
  desc.style.cssText = `
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
    font-style: italic;
  `;
  container.appendChild(desc);

  return container;
}

export default function AstroMap({
  data,
  onReset,
  mode = "full",
  opacity = 1,
  highlight = null,
  interactive = true,
  showPanels = true,
  showControls = true,
  showCityMarkers = true,
  autoAnimation = "none",
  onAnimationComplete,
  onAskStella,
  flyToOnLoad,
}: AstroMapProps) {
  const isBackgroundMode = mode === "background";
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const cityMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const track = useTrack();
  const [visiblePlanets, setVisiblePlanets] = useState<Set<PlanetId>>(
    new Set(data.planets.map((p) => p.id))
  );
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showTutorial, setShowTutorial] = useState(false);
  const [powerPlacesExpanded, setPowerPlacesExpanded] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // First visit detection for tutorial
  const { isFirstVisit, isLoading: isFirstVisitLoading, markVisited } = useFirstVisit("astro-map-visited");

  // Calculate power places for city markers
  const powerPlaces = useMemo(() => {
    return calculateAllPowerPlaces(data.lines);
  }, [data.lines]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // OLD tutorial disabled - using new OnboardingProvider flow instead
  // useEffect(() => {
  //   if (mapLoaded && !isFirstVisitLoading && isFirstVisit) {
  //     const timer = setTimeout(() => {
  //       setShowTutorial(true);
  //     }, 1500);
  //     return () => clearTimeout(timer);
  //   }
  // }, [mapLoaded, isFirstVisitLoading, isFirstVisit]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    // In reveal mode, start zoomed in on birth city; otherwise use world view
    const isReveal = autoAnimation === "reveal";
    const initialCenter: [number, number] = isReveal
      ? [data.birthData.location.lng, data.birthData.location.lat]
      : [0, 20];
    const initialZoom = isReveal ? 5 : 1.5;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCenter,
      zoom: initialZoom,
      projection: "mercator",
      attributionControl: false,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // Add attribution control in custom position
    map.current.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.current.on("load", () => {
      // Wait a moment for style to be fully ready
      setTimeout(() => {
        setMapLoaded(true);
      }, 300);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Auto-animation for reveal mode - ZOOM OUT from birth location
  useEffect(() => {
    if (!mapLoaded || !map.current || autoAnimation !== "reveal") return;

    const currentMap = map.current;
    const birthLng = data.birthData.location.lng;
    const birthLat = data.birthData.location.lat;

    // Step 1: Start ZOOMED IN on birth location (so user sees "this is where I was born")
    currentMap.setCenter([birthLng, birthLat]);
    currentMap.setZoom(5);

    // Step 2: Smooth zoom OUT to show the entire planet over 2.5 seconds
    // This creates the "holy shit, this is everywhere" moment
    const zoomOutTimer = setTimeout(() => {
      currentMap.easeTo({
        center: [birthLng, birthLat + 15], // Pan up more for better global view
        zoom: 1.0, // Zoomed out further to show entire world map
        duration: 2500,
        easing: (t) => t * (2 - t), // Ease-out for smooth deceleration
      });
    }, 800);

    // Step 3: After zoom completes, signal animation done (for UI updates)
    // NOTE: We no longer auto-advance - the callback just signals zoom is done
    const completeTimer = setTimeout(() => {
      onAnimationComplete?.();
    }, 3500);

    return () => {
      clearTimeout(zoomOutTimer);
      clearTimeout(completeTimer);
    };
  }, [mapLoaded, autoAnimation, data.birthData.location, onAnimationComplete]);

  // Add planetary lines when map is loaded
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const currentMap = map.current;

    // Apply custom styling for cosmic theme (wrap in try-catch as layers may vary)
    try {
      // Try to darken the water - layer name varies by style version
      const waterLayers = ["water", "water-depth", "waterway"];
      waterLayers.forEach((layer) => {
        if (currentMap.getLayer(layer)) {
          currentMap.setPaintProperty(layer, "fill-color", "#0a0a1e");
        }
      });
    } catch {
      // Style customization is optional, continue without it
    }

    // Add lines for each planet
    data.lines.forEach((line) => {
      const sourceId = `line-${line.id}`;
      const layerId = `layer-${line.id}`;

      // Skip if already added
      if (currentMap.getSource(sourceId)) return;

      try {
        // Create GeoJSON for the line
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          properties: {
            planet: line.planet,
            lineType: line.lineType,
          },
          geometry: {
            type: "LineString",
            coordinates: line.coordinates,
          },
        };

        currentMap.addSource(sourceId, {
          type: "geojson",
          data: geojson,
        });

        // Build paint properties - only add dasharray if line should be dashed
        const paintProps: mapboxgl.LinePaint = {
          "line-color": line.color,
          "line-width": line.lineType === "MC" || line.lineType === "AC" ? 2.5 : 2,
          "line-opacity": 0.9,
        };

        // Add dash pattern for IC and DC lines
        if (line.dashArray && line.dashArray.length >= 2) {
          paintProps["line-dasharray"] = line.dashArray;
        }

        currentMap.addLayer(
          {
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: paintProps,
          },
          // Add layer on top of all other layers (no beforeId = on top)
        );
      } catch (err) {
        console.error(`Error adding line ${line.id}:`, err);
      }
    });

    // Add birth location marker
    const birthLng = data.birthData.location.lng;
    const birthLat = data.birthData.location.lat;

    // Create custom marker element using safe DOM methods
    const markerEl = createMarkerElement();
    const popupContent = createPopupContent(data.birthData.location.name);

    const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);

    new mapboxgl.Marker(markerEl)
      .setLngLat([birthLng, birthLat])
      .setPopup(popup)
      .addTo(currentMap);

    // Fly to birth location (only if not in auto-animation mode)
    if (autoAnimation !== "reveal") {
      currentMap.flyTo({
        center: [birthLng, birthLat],
        zoom: 2.5,
        duration: 2000,
      });
    }
  }, [mapLoaded, data, autoAnimation]);

  // Add city markers for power places
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const currentMap = map.current;
    const timeouts: NodeJS.Timeout[] = [];

    // Clear existing city markers
    cityMarkersRef.current.forEach((marker) => marker.remove());
    cityMarkersRef.current = [];

    // Skip if city markers are disabled
    if (showCityMarkers === false) return;

    // Determine marker limit (number = limit, true = no limit)
    const markerLimit = typeof showCityMarkers === "number" ? showCityMarkers : Infinity;

    // Track which cities we've already added to avoid duplicates
    const addedCities = new Set<string>();

    // Collect all places to add
    const categories: LifeCategory[] = ["love", "career", "growth", "home"];
    const placesToAdd: Array<{
      place: typeof powerPlaces.love.places[0];
      category: LifeCategory;
      label: string;
    }> = [];

    categories.forEach((category) => {
      const categoryPlaces = powerPlaces[category];
      categoryPlaces.places.forEach((place) => {
        const cityKey = `${place.city.name}-${place.city.lat}-${place.city.lng}`;
        if (!addedCities.has(cityKey) && placesToAdd.length < markerLimit) {
          addedCities.add(cityKey);
          placesToAdd.push({ place, category, label: categoryPlaces.label });
        }
      });
    });

    // Animation settings for reveal mode
    // Zoom animation: starts at 800ms, duration 2500ms, finishes at ~3300ms
    const isRevealMode = autoAnimation === "reveal";
    const startDelay = isRevealMode ? 3400 : 0; // Start AFTER zoom out completes
    const staggerDelay = isRevealMode ? 60 : 0; // 60ms between each pin - fast cascade for overwhelming effect

    // Shuffle array for random appearance in reveal mode
    if (isRevealMode) {
      for (let i = placesToAdd.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [placesToAdd[i], placesToAdd[j]] = [placesToAdd[j], placesToAdd[i]];
      }
    }

    // Add markers (staggered if in reveal mode)
    placesToAdd.forEach((item, index) => {
      const addMarker = () => {
        const planetSymbol = getPlanetSymbol(item.place.planet);

        // Create marker element (animated in reveal mode)
        const markerEl = createCityMarkerElement(
          item.place.city.name,
          item.category,
          planetSymbol,
          isRevealMode // Enable pop-in animation
        );

        // Create popup with celestial design
        const popupContent = createCityPopupContent(
          item.place.city.name,
          item.place.flag,
          item.category, // category id for color lookup
          planetSymbol,
          item.place.lineType,
          item.place.distance,
          item.place.interpretation,
          item.place.stars
        );

        const popup = new mapboxgl.Popup({
          offset: 15,
          closeButton: false,
          closeOnClick: true,
        }).setDOMContent(popupContent);

        // Create and add marker - anchor at bottom so pin tip is at location
        const marker = new mapboxgl.Marker({
          element: markerEl,
          anchor: "bottom",
        })
          .setLngLat([item.place.city.lng, item.place.city.lat])
          .setPopup(popup)
          .addTo(currentMap);

        cityMarkersRef.current.push(marker);
      };

      if (isRevealMode) {
        // Stagger marker additions during reveal
        const timeout = setTimeout(addMarker, startDelay + index * staggerDelay);
        timeouts.push(timeout);
      } else {
        // Add immediately in normal mode
        addMarker();
      }
    });

    return () => {
      // Cleanup timeouts and markers on unmount
      timeouts.forEach((t) => clearTimeout(t));
      cityMarkersRef.current.forEach((marker) => marker.remove());
      cityMarkersRef.current = [];
    };
  }, [mapLoaded, powerPlaces, showCityMarkers, autoAnimation]);

  // Handle line click for tooltips
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const currentMap = map.current;

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const features = currentMap.queryRenderedFeatures(e.point, {
        layers: data.lines.map((l) => `layer-${l.id}`),
      });

      if (features.length > 0) {
        const feature = features[0];
        const planet = feature.properties?.planet as PlanetId;
        const lineType = feature.properties?.lineType as LineType;

        if (planet && lineType) {
          // Track line tap
          track("line_tap", { planet, line_type: lineType }, "map");

          setTooltip({
            planet,
            lineType,
            interpretation: getShortInterpretation(planet, lineType),
            position: { x: e.point.x, y: e.point.y },
          });
        }
      } else {
        setTooltip(null);
      }
    };

    // Change cursor on hover
    const handleMouseEnter = () => {
      currentMap.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      currentMap.getCanvas().style.cursor = "";
    };

    currentMap.on("click", handleClick);

    data.lines.forEach((line) => {
      const layerId = `layer-${line.id}`;
      currentMap.on("mouseenter", layerId, handleMouseEnter);
      currentMap.on("mouseleave", layerId, handleMouseLeave);
    });

    return () => {
      currentMap.off("click", handleClick);
      data.lines.forEach((line) => {
        const layerId = `layer-${line.id}`;
        currentMap.off("mouseenter", layerId, handleMouseEnter);
        currentMap.off("mouseleave", layerId, handleMouseLeave);
      });
    };
  }, [mapLoaded, data]);

  // Handle highlight prop for background mode (dim/highlight specific lines)
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const currentMap = map.current;

    // Reset all lines to normal state first
    data.lines.forEach((line) => {
      const layerId = `layer-${line.id}`;
      if (!currentMap.getLayer(layerId)) return;

      // Reset to normal opacity and width
      currentMap.setPaintProperty(layerId, "line-opacity", 0.9);
      currentMap.setPaintProperty(
        layerId,
        "line-width",
        line.lineType === "MC" || line.lineType === "AC" ? 2.5 : 2
      );
    });

    // If no highlight or "none", keep all lines normal
    if (!highlight || highlight.kind === "none") return;

    // Apply highlight/dim based on highlight type
    data.lines.forEach((line) => {
      const layerId = `layer-${line.id}`;
      if (!currentMap.getLayer(layerId)) return;

      let shouldHighlight = false;

      if (highlight.kind === "planetLine") {
        // Highlight specific planets
        shouldHighlight = highlight.ids.includes(line.planet);
      } else if (highlight.kind === "lineType") {
        // Highlight specific line types (MC, AC, DC, IC)
        shouldHighlight = highlight.ids.includes(line.lineType);
      }
      // City highlight doesn't affect lines, handled separately

      if (shouldHighlight) {
        // Highlighted lines: brighter, thicker
        currentMap.setPaintProperty(layerId, "line-opacity", 1);
        currentMap.setPaintProperty(layerId, "line-width", 4);
      } else {
        // Dimmed lines: more transparent
        currentMap.setPaintProperty(layerId, "line-opacity", 0.15);
      }
    });

    // Handle city highlight - fly to and pulse the city marker
    if (highlight.kind === "city" && highlight.ids.length > 0) {
      const targetCity = highlight.ids[0];
      const marker = cityMarkersRef.current.find(
        (m) => m.getElement().getAttribute("data-city") === targetCity
      );
      if (marker) {
        const lngLat = marker.getLngLat();
        currentMap.flyTo({
          center: [lngLat.lng, lngLat.lat],
          zoom: 4,
          duration: 1500,
        });
        // Add pulse class if specified
        if (highlight.pulse) {
          marker.getElement().classList.add("city-marker-pulse");
        }
      }
    }
  }, [mapLoaded, data.lines, highlight]);

  // Toggle planet visibility
  const togglePlanet = useCallback(
    (planetId: PlanetId) => {
      if (!map.current) return;

      const newVisible = new Set(visiblePlanets);
      if (newVisible.has(planetId)) {
        newVisible.delete(planetId);
      } else {
        newVisible.add(planetId);
      }
      setVisiblePlanets(newVisible);

      // Update layer visibility
      data.lines
        .filter((l) => l.planet === planetId)
        .forEach((line) => {
          const layerId = `layer-${line.id}`;
          if (map.current?.getLayer(layerId)) {
            map.current.setLayoutProperty(
              layerId,
              "visibility",
              newVisible.has(planetId) ? "visible" : "none"
            );
          }
        });
    },
    [visiblePlanets, data.lines]
  );

  const showAllPlanets = useCallback(() => {
    const allPlanets = new Set(data.planets.map((p) => p.id));
    setVisiblePlanets(allPlanets);

    data.lines.forEach((line) => {
      const layerId = `layer-${line.id}`;
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, "visibility", "visible");
      }
    });
  }, [data]);

  const hideAllPlanets = useCallback(() => {
    setVisiblePlanets(new Set());

    data.lines.forEach((line) => {
      const layerId = `layer-${line.id}`;
      if (map.current?.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, "visibility", "none");
      }
    });
  }, [data]);

  // Handle category filter changes
  const handleCategoryChange = useCallback(
    (categoryId: string, planets: PlanetId[]) => {
      setActiveCategory(categoryId);

      // Update visible planets to only those in the category
      const newVisible = new Set(planets);
      setVisiblePlanets(newVisible);

      // Update all map layers
      data.lines.forEach((line) => {
        const layerId = `layer-${line.id}`;
        if (map.current?.getLayer(layerId)) {
          map.current.setLayoutProperty(
            layerId,
            "visibility",
            newVisible.has(line.planet) ? "visible" : "none"
          );
        }
      });
    },
    [data.lines]
  );

  // Handle flying to a city from Power Places panel
  const handleFlyToCity = useCallback(
    (lat: number, lng: number, cityName: string) => {
      if (!map.current) return;

      // Close any open tooltip
      setTooltip(null);

      // Fly to the city
      map.current.flyTo({
        center: [lng, lat],
        zoom: 5,
        duration: 2000,
      });

      // After fly animation completes, find and open the city marker popup
      setTimeout(() => {
        // Find the marker for this city
        const marker = cityMarkersRef.current.find(
          (m) => m.getElement().getAttribute("data-city") === cityName
        );

        if (marker) {
          // Open the popup
          marker.togglePopup();

          // Add a pulse effect to draw attention
          const element = marker.getElement();
          element.classList.add("city-marker-pulse");

          // Remove pulse after animation
          setTimeout(() => {
            element.classList.remove("city-marker-pulse");
          }, 3000);
        }
      }, 2200); // Wait for fly animation to complete
    },
    []
  );

  // Handle flyToOnLoad - fly to a specific city on initial load
  useEffect(() => {
    if (!mapLoaded || !map.current || !flyToOnLoad) return;

    // Small delay to let city markers render first
    const timer = setTimeout(() => {
      handleFlyToCity(flyToOnLoad.lat, flyToOnLoad.lng, flyToOnLoad.cityName);
    }, 500);

    return () => clearTimeout(timer);
  }, [mapLoaded, flyToOnLoad, handleFlyToCity]);

  // Handle tutorial close - auto-expand Power Places panel
  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false);
    // Auto-expand Power Places panel after tutorial
    setTimeout(() => {
      setPowerPlacesExpanded(true);
    }, 500);
  }, []);

  // Handle "don't show again" - also auto-expand Power Places
  const handleDontShowAgain = useCallback(() => {
    markVisited();
    setShowTutorial(false);
    // Auto-expand Power Places panel after tutorial
    setTimeout(() => {
      setPowerPlacesExpanded(true);
    }, 500);
  }, [markVisited]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full"
      style={{
        minHeight: isBackgroundMode ? "100%" : "100vh",
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading Overlay - only in full mode */}
      {!mapLoaded && !isBackgroundMode && (
        <div className="absolute inset-0 bg-[#050510] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-[#C9A227] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Category Filters - Top Center (full mode + showControls) */}
      {mapLoaded && showControls && !isBackgroundMode && (
        <CategoryFilters
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Map Controls / Legend - Desktop only (full mode + showControls) */}
      {mapLoaded && !isMobile && showControls && !isBackgroundMode && (
        <MapControls
          planets={data.planets}
          visiblePlanets={visiblePlanets}
          onTogglePlanet={togglePlanet}
          onShowAll={showAllPlanets}
          onHideAll={hideAllPlanets}
          onReset={onReset}
          isExpanded={legendExpanded}
          onExpandedChange={setLegendExpanded}
        />
      )}

      {/* Line Modal */}
      <LineModal
        planet={tooltip?.planet ?? "sun"}
        lineType={tooltip?.lineType ?? "MC"}
        isOpen={!!tooltip}
        onClose={() => setTooltip(null)}
        onAskStella={onAskStella}
      />

      {/* Power Places Panel - Desktop only (right side, full mode + showPanels) */}
      {mapLoaded && !isMobile && showPanels && !isBackgroundMode && (
        <PowerPlacesPanel
          lines={data.lines}
          onFlyToCity={handleFlyToCity}
          defaultExpanded={powerPlacesExpanded}
        />
      )}

      {/* Mobile Floating Pill Interface (full mode + showPanels) */}
      {mapLoaded && isMobile && showPanels && !isBackgroundMode && (
        <MobileFloatingPill
          lines={data.lines}
          planets={data.planets}
          visiblePlanets={visiblePlanets}
          onTogglePlanet={togglePlanet}
          onShowAllPlanets={showAllPlanets}
          onHideAllPlanets={hideAllPlanets}
          onFlyToCity={handleFlyToCity}
          onReset={onReset}
        />
      )}

      {/* Welcome Tutorial (First Visit) - full mode only */}
      {showTutorial && !isBackgroundMode && (
        <WelcomeTutorial
          onClose={handleTutorialClose}
          onDontShowAgain={handleDontShowAgain}
        />
      )}


      {/* Custom marker styles */}
      <style jsx global>{`
        .birth-marker {
          cursor: pointer;
        }

        .marker-inner {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .marker-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #e8c547;
          border-radius: 50%;
          border: 2px solid #050510;
          box-shadow: 0 0 10px rgba(232, 197, 71, 0.6);
        }

        .marker-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background: rgba(232, 197, 71, 0.3);
          border-radius: 50%;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }

        .city-pin-marker {
          transition: filter 0.15s ease;
        }

        .city-pin-marker:hover svg {
          filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 16px currentColor) drop-shadow(0 1px 2px rgba(0,0,0,0.5));
        }

        .city-marker-pulse {
          animation: city-pulse 1.5s ease-in-out infinite;
        }

        @keyframes city-pulse {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 4px currentColor) drop-shadow(0 1px 2px rgba(0,0,0,0.5));
          }
          50% {
            transform: scale(1.2);
            filter: drop-shadow(0 0 12px currentColor) drop-shadow(0 0 24px currentColor) drop-shadow(0 1px 2px rgba(0,0,0,0.5));
          }
        }

        .birth-popup {
          color: #050510;
          padding: 4px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .birth-popup strong {
          color: #8b6914;
        }

        .mapboxgl-popup-content {
          padding: 14px 16px 16px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(15, 15, 35, 0.95) 0%, rgba(5, 5, 16, 0.98) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 0 60px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .mapboxgl-popup-tip {
          border-top-color: rgba(15, 15, 35, 0.95) !important;
          border-bottom-color: rgba(15, 15, 35, 0.95) !important;
        }

        .mapboxgl-popup-close-button {
          font-size: 18px;
          padding: 4px 10px;
          color: rgba(255, 255, 255, 0.4);
          transition: color 0.2s ease;
        }

        .mapboxgl-popup-close-button:hover {
          color: rgba(255, 255, 255, 0.8);
          background: transparent;
        }

        .mapboxgl-ctrl-group {
          background: rgba(10, 10, 30, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          backdrop-filter: blur(10px);
        }

        .mapboxgl-ctrl-group button {
          background: transparent !important;
        }

        .mapboxgl-ctrl-group button:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .mapboxgl-ctrl-group button span {
          filter: invert(1);
        }
      `}</style>
    </motion.div>
  );
}

// Helper to get planet symbol
function getPlanetSymbol(planetId: PlanetId): string {
  const symbols: Record<PlanetId, string> = {
    sun: "☉",
    moon: "☽",
    mercury: "☿",
    venus: "♀",
    mars: "♂",
    jupiter: "♃",
    saturn: "♄",
    uranus: "♅",
    neptune: "♆",
    pluto: "♇",
  };
  return symbols[planetId] || "★";
}
