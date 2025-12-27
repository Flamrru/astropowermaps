"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { AstrocartographyResult, PlanetId, LineType, TooltipData } from "@/lib/astro/types";
import { getShortInterpretation } from "@/lib/astro/interpretations";
import { calculateAllPowerPlaces, LifeCategory } from "@/lib/astro/power-places";
import { YearForecast } from "@/lib/astro/transit-types";
import { calculatePowerMonths, calculatePowerMonthsWithConfidence } from "@/lib/astro/power-months";
import MapControls from "./MapControls";
import LineTooltip from "./LineTooltip";
import CategoryFilters from "./CategoryFilters";
import PowerPlacesPanel, { PowerPlacesContent } from "./PowerPlacesPanel";
import PowerMonthsPanel, { PowerMonthsContent } from "./PowerMonthsPanel";
import MobileBottomNav, { MobileTab } from "./MobileBottomNav";
import { ForecastBottomSheet, PlacesBottomSheet, LinesBottomSheet } from "./MobileBottomSheet";
import WelcomeTutorial from "./WelcomeTutorial";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";

interface AstroMapProps {
  data: AstrocartographyResult;
  onReset: () => void;
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
 */
function createCityMarkerElement(
  cityName: string,
  category: LifeCategory,
  _planetSymbol: string
): HTMLDivElement {
  const colors = CATEGORY_MARKER_COLORS[category];

  const markerEl = document.createElement("div");
  markerEl.className = "city-pin-marker";
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
  svg.style.cssText = `
    display: block;
    filter: drop-shadow(0 0 4px ${colors.glow}) drop-shadow(0 1px 2px rgba(0,0,0,0.5));
  `;

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
 * Creates city popup content
 */
function createCityPopupContent(
  cityName: string,
  category: string,
  interpretation: string
): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "city-popup";
  container.style.cssText = `
    color: #050510;
    padding: 4px 0;
    font-size: 13px;
    line-height: 1.4;
    max-width: 200px;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  `;

  const strong = document.createElement("strong");
  strong.textContent = cityName;
  strong.style.cssText = `
    color: #0a0a1e;
    font-size: 14px;
  `;

  const badge = document.createElement("span");
  badge.textContent = category;
  badge.style.cssText = `
    background: rgba(201, 162, 39, 0.15);
    color: #8b6914;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
  `;

  header.appendChild(strong);
  header.appendChild(badge);

  const desc = document.createElement("p");
  desc.textContent = interpretation;
  desc.style.cssText = `
    color: #444;
    font-size: 12px;
    margin: 0;
  `;

  container.appendChild(header);
  container.appendChild(desc);

  return container;
}

export default function AstroMap({ data, onReset }: AstroMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const cityMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visiblePlanets, setVisiblePlanets] = useState<Set<PlanetId>>(
    new Set(data.planets.map((p) => p.id))
  );
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showTutorial, setShowTutorial] = useState(false);
  const [powerPlacesExpanded, setPowerPlacesExpanded] = useState(false);

  // Forecast state
  const [forecastData, setForecastData] = useState<YearForecast | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Mobile navigation state
  const [activeBottomTab, setActiveBottomTab] = useState<MobileTab>("places");
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

  // Calculate 2026 forecast when birth data is available
  useEffect(() => {
    const calculateForecast = async () => {
      if (!data.planets || data.planets.length === 0) return;

      setForecastLoading(true);

      try {
        // Extract natal positions from the astrocartography data
        const { calculateNatalPositions } = await import("@/lib/astro/calculations");
        const natalPositions = calculateNatalPositions(data.birthData);

        let forecast: YearForecast;

        if (data.birthData.timeUnknown && data.birthData.timeWindow) {
          // Calculate with confidence using time window sampling
          forecast = calculatePowerMonthsWithConfidence(
            data.birthData,
            data.birthData.timeWindow
          );
        } else {
          // Calculate with exact time
          forecast = calculatePowerMonths(natalPositions);
        }

        setForecastData(forecast);
      } catch (error) {
        console.error("Error calculating forecast:", error);
      } finally {
        setForecastLoading(false);
      }
    };

    calculateForecast();
  }, [data.birthData, data.planets]);

  // Show tutorial on first visit after map loads
  useEffect(() => {
    if (mapLoaded && !isFirstVisitLoading && isFirstVisit) {
      // Small delay to let the map settle
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mapLoaded, isFirstVisitLoading, isFirstVisit]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("Mapbox token not configured");
      return;
    }

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [0, 20],
      zoom: 1.5,
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

    // Fly to birth location
    currentMap.flyTo({
      center: [birthLng, birthLat],
      zoom: 2.5,
      duration: 2000,
    });
  }, [mapLoaded, data]);

  // Add city markers for power places
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const currentMap = map.current;

    // Clear existing city markers
    cityMarkersRef.current.forEach((marker) => marker.remove());
    cityMarkersRef.current = [];

    // Track which cities we've already added to avoid duplicates
    const addedCities = new Set<string>();

    // Add markers for all power places across categories
    const categories: LifeCategory[] = ["love", "career", "growth", "home"];

    categories.forEach((category) => {
      const categoryPlaces = powerPlaces[category];

      categoryPlaces.places.forEach((place) => {
        // Skip if we've already added this city
        const cityKey = `${place.city.name}-${place.city.lat}-${place.city.lng}`;
        if (addedCities.has(cityKey)) return;
        addedCities.add(cityKey);

        // Get planet symbol from PLANETS config
        const planetSymbol = getPlanetSymbol(place.planet);

        // Create marker element
        const markerEl = createCityMarkerElement(
          place.city.name,
          category,
          planetSymbol
        );

        // Create popup
        const popupContent = createCityPopupContent(
          place.city.name,
          categoryPlaces.label,
          place.interpretation
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
          .setLngLat([place.city.lng, place.city.lat])
          .setPopup(popup)
          .addTo(currentMap);

        cityMarkersRef.current.push(marker);
      });
    });

    return () => {
      // Cleanup markers on unmount
      cityMarkersRef.current.forEach((marker) => marker.remove());
      cityMarkersRef.current = [];
    };
  }, [mapLoaded, powerPlaces]);

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

      map.current.flyTo({
        center: [lng, lat],
        zoom: 5,
        duration: 2000,
      });

      // Close any open tooltip
      setTooltip(null);
    },
    []
  );

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
    <div className="relative w-full h-full" style={{ minHeight: '100vh' }}>
      {/* Map Container */}
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-[#050510] flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-[#C9A227] border-t-transparent rounded-full"
          />
        </div>
      )}

      {/* Category Filters - Top Center */}
      {mapLoaded && (
        <CategoryFilters
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Map Controls - Desktop only */}
      {mapLoaded && !isMobile && (
        <MapControls
          planets={data.planets}
          visiblePlanets={visiblePlanets}
          onTogglePlanet={togglePlanet}
          onShowAll={showAllPlanets}
          onHideAll={hideAllPlanets}
          onReset={onReset}
        />
      )}

      {/* Line Tooltip */}
      {tooltip && (
        <LineTooltip
          planet={tooltip.planet}
          lineType={tooltip.lineType}
          interpretation={tooltip.interpretation}
          position={tooltip.position}
          onClose={() => setTooltip(null)}
        />
      )}

      {/* Power Months Panel - Desktop only (left side) */}
      {mapLoaded && !isMobile && forecastData && (
        <PowerMonthsPanel
          forecast={forecastData}
          loading={forecastLoading}
        />
      )}

      {/* Power Places Panel - Desktop only (right side) */}
      {mapLoaded && !isMobile && (
        <PowerPlacesPanel
          lines={data.lines}
          onFlyToCity={handleFlyToCity}
          defaultExpanded={powerPlacesExpanded}
        />
      )}

      {/* Mobile Bottom Navigation */}
      {mapLoaded && isMobile && (
        <MobileBottomNav
          activeTab={activeBottomTab}
          onTabChange={setActiveBottomTab}
          hasForecast={!!forecastData}
        />
      )}

      {/* Mobile Bottom Sheets */}
      <AnimatePresence>
        {/* Forecast Sheet */}
        {isMobile && forecastData && (
          <ForecastBottomSheet
            isOpen={activeBottomTab === "forecast"}
            onClose={() => setActiveBottomTab("places")}
          >
            <PowerMonthsContent
              forecast={forecastData}
              loading={forecastLoading}
            />
          </ForecastBottomSheet>
        )}

        {/* Places Sheet */}
        {isMobile && (
          <PlacesBottomSheet
            isOpen={activeBottomTab === "places"}
            onClose={() => setActiveBottomTab("lines")}
          >
            <PowerPlacesContent
              lines={data.lines}
              onFlyToCity={(lat, lng, cityName) => {
                handleFlyToCity(lat, lng, cityName);
                // Close the sheet after selecting a city
                setActiveBottomTab("lines");
              }}
            />
          </PlacesBottomSheet>
        )}

        {/* Lines Sheet (planet visibility controls) */}
        {isMobile && (
          <LinesBottomSheet
            isOpen={activeBottomTab === "lines"}
            onClose={() => setActiveBottomTab("places")}
          >
            <div className="px-6 space-y-3">
              {data.planets.map((planet) => {
                const isVisible = visiblePlanets.has(planet.id);
                return (
                  <button
                    key={planet.id}
                    onClick={() => togglePlanet(planet.id)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl transition-all"
                    style={{
                      background: isVisible
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(255, 255, 255, 0.02)",
                      border: isVisible
                        ? `1px solid ${planet.color}40`
                        : "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  >
                    <span
                      className="text-2xl w-8 text-center"
                      style={{ color: isVisible ? planet.color : "rgba(255,255,255,0.3)" }}
                    >
                      {planet.symbol}
                    </span>
                    <span
                      className="flex-1 text-left font-medium"
                      style={{ color: isVisible ? "white" : "rgba(255,255,255,0.4)" }}
                    >
                      {planet.name}
                    </span>
                    <div
                      className="w-10 h-6 rounded-full flex items-center px-1 transition-all"
                      style={{
                        background: isVisible
                          ? `linear-gradient(90deg, ${planet.color}80, ${planet.color})`
                          : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <motion.div
                        animate={{ x: isVisible ? 16 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="w-4 h-4 rounded-full bg-white shadow-md"
                      />
                    </div>
                  </button>
                );
              })}

              {/* Show/Hide All Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={showAllPlanets}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.05)" }}
                >
                  Show All
                </button>
                <button
                  onClick={hideAllPlanets}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.05)" }}
                >
                  Hide All
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={onReset}
                className="w-full py-3 rounded-xl text-sm font-medium transition-all mt-4"
                style={{
                  background: "linear-gradient(135deg, rgba(232, 197, 71, 0.15) 0%, rgba(201, 162, 39, 0.1) 100%)",
                  border: "1px solid rgba(232, 197, 71, 0.3)",
                  color: "#E8C547",
                }}
              >
                Generate New Map
              </button>
            </div>
          </LinesBottomSheet>
        )}
      </AnimatePresence>

      {/* Welcome Tutorial (First Visit) */}
      {showTutorial && (
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
          padding: 12px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .mapboxgl-popup-close-button {
          font-size: 18px;
          padding: 4px 8px;
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
    </div>
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
