"use client";

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import DataTable from '@/components/DataTable';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { differenceInDays } from 'date-fns';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { localePath, type ClientDictionary, type Locale } from '@/lib/i18n';

type Props = { dict: ClientDictionary; locale: Locale };

function HomeContent({ dict, locale }: Props) {
  const MapWithNoSSR = useMemo(
    () =>
      dynamic(() => import('@/components/Map'), {
        ssr: false,
        loading: () => (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#0f1115',
            }}
          >
            {dict.home.loadingMap}
          </div>
        ),
      }),
    [dict.home.loadingMap]
  );

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
            // Keep the raw district key locale-independent; the label is
            // rendered from it in the sidebar.
            const dist = match[1].toUpperCase();
            item.parsedDistrict = dist;
            districts.add(dist);
          } else {
            item.parsedDistrict = '__other__';
            districts.add('__other__');
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
  }, [data, filterMode, districtFilter, categoryFilter, companyFilter]);

  return (
    <>
      <div className="seo-header">
        <h1 className="sr-only">{dict.home.h1}</h1>
      </div>
      <div className="view-controls">
        <button
          className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('map');
            setIsSidebarOpen(true);
          }}
        >
          {dict.nav.map}
        </button>
        <button
          className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => {
            setViewMode('table');
            setIsSidebarOpen(false);
          }}
        >
          {dict.nav.list}
        </button>
        <Link
          href={localePath(locale, '/varhato/30-nap')}
          className="view-btn view-btn-upcoming"
          title={dict.nav.upcomingTitle}
        >
          {dict.nav.upcoming}
        </Link>
        <LanguageSwitcher
          locale={locale}
          label={dict.nav.langLabel}
          switchTo={dict.nav.switchTo}
          variant="compact"
        />
      </div>

      <Sidebar
        dict={dict}
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
        locale={locale}
      />

      <div className="map-wrapper" style={{ display: viewMode === 'map' ? 'block' : 'none' }}>
        {!isSidebarOpen && (
          <button
            className="desktop-sidebar-show-btn"
            onClick={() => setIsSidebarOpen(true)}
          >
            {dict.home.showFilters}
          </button>
        )}
        <MapWithNoSSR
          data={filteredData}
          colorMode={colorMode}
          mapStyle={mapStyle}
          heatmapOverlay={heatmapOverlay}
          dict={dict}
          locale={locale}
        />
      </div>

      {viewMode === 'table' && <DataTable data={filteredData} dict={dict} locale={locale} />}

      <button
        className="mobile-sidebar-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? dict.home.close : dict.home.filtersAndStats}
      </button>
    </>
  );
}

export default function HomeClient({ dict, locale }: Props) {
  return (
    <Suspense fallback={<div style={{ color: 'white' }}>{dict.home.loading}</div>}>
      <HomeContent dict={dict} locale={locale} />
    </Suspense>
  );
}
