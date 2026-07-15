"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import L from 'leaflet';
import 'leaflet.heat';
import { differenceInDays } from 'date-fns';
import { useMap } from 'react-leaflet';
import {
  localePath,
  translateCategory,
  translateAddress,
  formatDate,
  type ClientDictionary,
  type Locale,
} from '@/lib/i18n';

type MapProps = {
  data: any[];
  colorMode: 'default' | 'size' | 'category' | 'company' | 'startDate';
  mapStyle: 'dark' | 'light' | 'satellite' | 'terrain';
  heatmapOverlay?: boolean;
  dict: ClientDictionary;
  locale: Locale;
};

function HeatmapLayer({ data }: { data: any[] }) {
  const map = useMap();
  
  useEffect(() => {
    const points = data
      .filter(item => item.lat && item.lon)
      .map(item => [item.lat, item.lon, 1]); // 1 intensity per item
      
    const heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 20,
      max: 5, // "if a place have too many places just flatten it"
      maxZoom: 15,
    }).addTo(map);
    
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [data, map]);
  
  return null;
}

// Create custom icons using DivIcon
const createCustomIcon = (isHot: boolean, color: string) => {
  const style = color ? `style="background-color: ${color} !important;"` : '';
  return L.divIcon({
    className: 'custom-icon-wrapper',
    html: `<div class="custom-marker ${isHot ? 'hot' : ''}" ${style}></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}

export default function Map({ data, colorMode, mapStyle, heatmapOverlay = false, dict, locale }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fix Leaflet's default icon path issues in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!mounted) return null;

  let tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"; // Default OSM
  if (mapStyle === 'satellite') {
    tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
  } else if (mapStyle === 'terrain') {
    tileUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
  }

  return (
    <div className={`map-container-wrapper ${mapStyle === 'dark' ? 'dark-map-tiles' : ''}`} style={{ width: '100%', height: '100%' }}>
      <MapContainer 
        center={[47.4979, 19.0402]} 
        zoom={13} 
        className="leaflet-container"
        zoomControl={false}
      >
      <TileLayer
        key={mapStyle}
        attribution='&copy; OpenStreetMap contributors'
        url={tileUrl}
      />
      <ZoomControl position="bottomright" />
      
      {heatmapOverlay && <HeatmapLayer data={data} />}
      
      {!heatmapOverlay && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
        >
        {data.map((item, idx) => {
        if (!item.lat || !item.lon) return null;

        // Logic for "hot": expired or expiring within 30 days
        let isHot = false;
        if (item.endDate) {
          const end = new Date(item.endDate);
          const now = new Date();
          const daysDiff = differenceInDays(end, now);
          // If it already expired or expires in < 30 days
          if (daysDiff <= 30) {
            isHot = true;
          }
        }

        // Deterministic jitter to prevent markers stacking perfectly
        // Use a simple hash of the ID or address
        let hash = 0;
        const strToHash = item.id + item.address;
        for (let i = 0; i < strToHash.length; i++) {
          hash = Math.imul(31, hash) + strToHash.charCodeAt(i) | 0;
        }
        
        // Jitter by roughly ~20-50 meters
        const jitterLat = item.lat + ((hash % 100) / 100 - 0.5) * 0.0003;
        const jitterLon = item.lon + (((hash >> 8) % 100) / 100 - 0.5) * 0.0003;

        // Determine color based on mode
        let color = '';
        if (colorMode === 'category') {
          // Hash the raw Hungarian value so a marker keeps its color across
          // languages.
          color = stringToColor(item.category || '__other__');
        } else if (colorMode === 'company') {
          color = stringToColor(item.company || '__unknown__');
        } else if (colorMode === 'size') {
          const size = parseFloat(item.size) || 0;
          const intensity = Math.min(255, Math.floor((size / 100) * 255));
          color = `rgb(255, ${255 - intensity}, 0)`; // Yellow to Red for size
        } else if (colorMode === 'startDate') {
          const timestamp = new Date(item.startDate || 0).getTime();
          const min = new Date('2023-01-01').getTime();
          const max = new Date('2026-12-31').getTime();
          const ratio = Math.max(0, Math.min(1, (timestamp - min) / (max - min)));
          const r = Math.floor(ratio * 255);
          const b = Math.floor((1 - ratio) * 255);
          color = `rgb(${r}, 100, ${b})`; // Blue to Red over time
        }

        return (
          <Marker 
            key={`${item.id}-${idx}`} 
            position={[jitterLat, jitterLon]}
            icon={createCustomIcon(isHot, color)}
          >
            <Popup>
              <div className="popup-content">
                <h3>{item.category ? translateCategory(item.category, locale) : dict.map.unknown}</h3>
                <p><strong>{dict.map.applicant}</strong> {item.company || dict.common.unknown}</p>
                <p><strong>{dict.map.location}</strong> {translateAddress(item.address, locale)}</p>
                <p><strong>{dict.map.size}</strong> {item.size} m²</p>
                <p><strong>{dict.map.period}</strong> {formatDate(item.startDate, locale)} – {formatDate(item.endDate, locale)}</p>
                <a
                  href={localePath(locale, `/helyszin/${item.slug}`)}
                  style={{ display: 'inline-block', marginTop: '12px', padding: '6px 12px', backgroundColor: 'var(--accent-color)', color: '#fff', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  {dict.map.details}
                </a>
                {isHot && (
                  <p style={{color: 'var(--danger-color)', fontWeight: 'bold', marginTop: '8px'}}>
                    {dict.map.expiringSoon}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
        </MarkerClusterGroup>
      )}
      </MapContainer>
    </div>
  );
}
