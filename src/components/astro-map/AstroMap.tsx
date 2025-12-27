"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import { AstrocartographyResult, PlanetId, LineType, TooltipData } from "@/lib/astro/types";
import { getShortInterpretation } from "@/lib/astro/interpretations";
import MapControls from "./MapControls";
import LineTooltip from "./LineTooltip";
import CategoryFilters from "./CategoryFilters";
import PowerPlacesPanel from "./PowerPlacesPanel";
import WelcomeTutorial from "./WelcomeTutorial";
import { useFirstVisit } from "@/lib/hooks/useFirstVisit";

interface AstroMapProps {
  data: AstrocartographyResult;
  onReset: () => void;
}

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

export default function AstroMap({ data, onReset }: AstroMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visiblePlanets, setVisiblePlanets] = useState<Set<PlanetId>>(
    new Set(data.planets.map((p) => p.id))
  );
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showTutorial, setShowTutorial] = useState(false);

  // First visit detection for tutorial
  const { isFirstVisit, isLoading: isFirstVisitLoading, markVisited } = useFirstVisit("astro-map-visited");

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

  // Handle tutorial close
  const handleTutorialClose = useCallback(() => {
    setShowTutorial(false);
  }, []);

  // Handle "don't show again"
  const handleDontShowAgain = useCallback(() => {
    markVisited();
    setShowTutorial(false);
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

      {/* Map Controls */}
      {mapLoaded && (
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

      {/* Power Places Panel */}
      {mapLoaded && (
        <PowerPlacesPanel
          lines={data.lines}
          onFlyToCity={handleFlyToCity}
        />
      )}

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
