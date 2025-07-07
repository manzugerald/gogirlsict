'use client';

import React, { useRef, useState } from 'react';
import {
  Map,
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  FullscreenControl,
  ScaleControl,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useTheme } from 'next-themes';

const HQ_LAT = parseFloat(process.env.NEXT_PUBLIC_HQ_LAT!);
const HQ_LNG = parseFloat(process.env.NEXT_PUBLIC_HQ_LNG!);
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;

const MAPBOX_STYLES = [
  { label: 'Streets', value: 'mapbox://styles/mapbox/streets-v12' },
  { label: 'Outdoors', value: 'mapbox://styles/mapbox/outdoors-v12' },
  { label: 'Light', value: 'mapbox://styles/mapbox/light-v11' },
  { label: 'Dark', value: 'mapbox://styles/mapbox/dark-v11' },
  { label: 'Satellite', value: 'mapbox://styles/mapbox/satellite-v9' },
  { label: 'Satellite Streets', value: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { label: 'Navigation Day', value: 'mapbox://styles/mapbox/navigation-day-v1' },
  { label: 'Navigation Night', value: 'mapbox://styles/mapbox/navigation-night-v1' },
];

// South Sudan bounding box: southwest [lon, lat], northeast [lon, lat]
const SOUTH_SUDAN_BOUNDS: [[number, number], [number, number]] = [
  [23.44, 3.47],
  [35.95, 12.24],
];

const HeadQuartersMap = () => {
  const { resolvedTheme } = useTheme();

  const [viewState, setViewState] = useState({
    latitude: HQ_LAT,
    longitude: HQ_LNG,
    zoom: 7.5,
    bearing: 0,
    pitch: 0,
  });

  const [mapStyle, setMapStyle] = useState(MAPBOX_STYLES[0].value);
  const mapRef = useRef<any>(null);

  // Popup theme-aware classes for text only
  const popupTitleClass =
    'text-sm font-semibold ' + (resolvedTheme === 'dark' ? 'text-gray-800' : 'text-gray-900');
  const popupAddressClass =
    'text-xs mt-1 text-center ' + (resolvedTheme === 'dark' ? 'text-gray-600' : 'text-gray-700');

  return (
    <div className="w-full h-[440px] rounded-xl overflow-hidden shadow relative">
      {/* Map Style Switcher */}
      <div className="absolute top-3 right-3 z-20 bg-white/80 border border-gray-200 rounded px-2 py-1 flex items-center gap-2">
        <label htmlFor="map-style" className="text-xs text-black font-medium mr-1">
          Map Type:
        </label>
        <select
          id="map-style"
          className="rounded p-1 text-xs bg-white text-black border border-gray-300"
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value)}
        >
          {MAPBOX_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
      </div>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        cooperativeGestures={true}
        attributionControl={false} // disables native attribution
        minZoom={5}
        maxZoom={18}
        maxBounds={SOUTH_SUDAN_BOUNDS}
      >
        {/* Marker at HQ */}
        <Marker latitude={HQ_LAT} longitude={HQ_LNG} anchor="bottom">
          <div className="relative">
            <svg height={40} viewBox="0 0 24 24" style={{ display: 'block' }}>
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="#d02670"
              />
              <circle cx="12" cy="9" r="2.5" fill="white" />
            </svg>
          </div>
        </Marker>
        {/* Popup for HQ */}
        <Popup
          latitude={HQ_LAT}
          longitude={HQ_LNG}
          anchor="top"
          closeButton={false}
          offset={3}
          focusAfterOpen={false}
        >
          <div className="flex flex-col items-center">
            <div className={popupTitleClass}>GoGirls ICT HeadQuaters</div>
            <div className={popupAddressClass} style={{ lineHeight: 1.2 }}>
              Plot #208 Suk Militia, Munuki Payam,
              <br />
              Juba County, Juba City - South Sudan
            </div>
          </div>
        </Popup>

        {/* Navigation & rich controls */}
        <NavigationControl position="bottom-right" showCompass showZoom />
        <GeolocateControl
          position="top-left"
          showAccuracyCircle={true}
          showUserLocation={true}
          trackUserLocation={true}
          auto
        />
        <FullscreenControl position="top-left" />
        <ScaleControl position="bottom-left" maxWidth={120} unit="metric" />
      </Map>

      {/* Custom Copyright */}
      <div className="absolute bottom-1 left-2 text-xs text-gray-500 z-10 bg-white/80 px-2 py-0.5 rounded">
        2025 &copy;GoGirls ICT &nbsp; &copy;Mapbox
      </div>
    </div>
  );
};

export default HeadQuartersMap;
