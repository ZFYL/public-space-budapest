"use client";

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import { differenceInDays, isBefore, isAfter, parseISO } from 'date-fns';

// Dynamically import the map to avoid SSR issues with Leaflet
const MapWithNoSSR = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1115' }}>Térkép betöltése...</div>
});

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function HomeContent() {
  const [data, setData] = useState<any[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const viewMode = searchParams.get('view') === 'table' ? 'table' : 'map';

  const setViewMode = (mode: 'map' | 'table') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`${pathname}?${params.toString()}`);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [colorMode, setColorMode] = useState<'default' | 'size' | 'category' | 'company' | 'startDate'>('default');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [heatmapOverlay, setHeatmapOverlay] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'dark' | 'light' | 'satellite' | 'terrain'>('dark');

  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(json => {
        const districts = new Set<string>();
        const categories = new Set<string>();
        const validData = json.filter((item: any) => item.lat !== null && item.lon !== null).map((item: any) => {
          const match = item.address.match(/(?:Budapest\s+)?([IVXLCDM0-9]+)\.\s*ker/i);
          if (match) {
            let dist = match[1].toUpperCase() + '. kerület';
            item.parsedDistrict = dist;
            districts.add(dist);
          } else {
            item.parsedDistrict = 'Egyéb';
            districts.add('Egyéb');
          }
          if (item.category) categories.add(item.category);
          return item;
        });
        
        setAvailableDistricts(Array.from(districts).sort());
        setAvailableCategories(Array.from(categories).sort());
        setData(validData);
      })
      .catch(err => console.error("Failed to load data", err));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (districtFilter !== 'all' && item.parsedDistrict !== districtFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (companyFilter && (!item.company || !item.company.toLowerCase().includes(companyFilter.toLowerCase()))) return false;
      if (filterMode !== 'all') {
        if (!item.endDate) return false;
        const end = new Date(item.endDate);
        const start = item.startDate ? new Date(item.startDate) : new Date(0);
        const now = new Date();
        const daysDiff = differenceInDays(end, now);
        
        if (filterMode === 'expired') return daysDiff < 0;
        if (filterMode === 'expiring') return daysDiff >= 0 && daysDiff <= 30;
        if (filterMode === 'active') return daysDiff >= 0 && (!item.startDate || now >= start);
      }
      return true;
    });
  }, [data, filterMode, districtFilter]);

  return (
    <>
      <div className="seo-header">
        <h1 className="sr-only">Ki foglalja el a közterületet Budapesten? Nézze meg a hivatalos térképet!</h1>
      </div>
      <div className="view-controls">
        <button 
          className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('map');
            setIsSidebarOpen(true);
          }}
        >
          Térkép
        </button>
        <button
          className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('table');
            setIsSidebarOpen(false);
          }}
        >
          Lista
        </button>
        <Link
          href="/varhato/30-nap"
          className="view-btn view-btn-upcoming"
          title="Mi indul Budapesten a következő 30 napban?"
        >
          Közelgő ✨
        </Link>
      </div>

      <Sidebar 
        data={filteredData} 
        filterMode={filterMode} 
        setFilterMode={setFilterMode} 
        isSidebarOpen={isSidebarOpen}
        onCollapseToggle={() => setIsSidebarOpen(false)}
        colorMode={colorMode}
        setColorMode={setColorMode}
        districtFilter={districtFilter}
        setDistrictFilter={setDistrictFilter}
        availableDistricts={availableDistricts}
        mapStyle={mapStyle}
        setMapStyle={setMapStyle}
        companyFilter={companyFilter}
        setCompanyFilter={setCompanyFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        availableCategories={availableCategories}
        heatmapOverlay={heatmapOverlay}
        setHeatmapOverlay={setHeatmapOverlay}
      />
      
      <div className="map-wrapper" style={{ display: viewMode === 'map' ? 'block' : 'none' }}>
        {!isSidebarOpen && (
          <button 
            className="desktop-sidebar-show-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            Szűrők megjelenítése
          </button>
        )}
        <MapWithNoSSR data={filteredData} colorMode={colorMode} mapStyle={mapStyle} heatmapOverlay={heatmapOverlay} />
      </div>

      {viewMode === 'table' && (
        <DataTable data={filteredData} />
      )}

      <button 
        className="mobile-sidebar-toggle" 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? 'Bezárás' : 'Szűrés & Statisztika'}
      </button>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{color:'white'}}>Betöltés...</div>}>
      <HomeContent />
    </Suspense>
  );
}
