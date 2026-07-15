import React, { useMemo } from 'react';
import {
  Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem,
  Autocomplete, TextField, Switch, FormControlLabel, IconButton, Divider,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
  localePath,
  translateCategory,
  type ClientDictionary,
  type Locale,
} from '@/lib/i18n';

type SidebarProps = {
  dict: ClientDictionary;
  locale: Locale;
  data: any[];
  filterMode: 'all' | 'active' | 'expiring' | 'expired';
  setFilterMode: (mode: 'all' | 'active' | 'expiring' | 'expired') => void;
  isSidebarOpen?: boolean;
  onCollapseToggle: () => void;
  colorMode: 'default' | 'size' | 'category' | 'company' | 'startDate';
  setColorMode: (mode: 'default' | 'size' | 'category' | 'company' | 'startDate') => void;
  districtFilter: string;
  setDistrictFilter: (district: string) => void;
  availableDistricts: string[];
  mapStyle: 'dark' | 'light' | 'satellite' | 'terrain';
  setMapStyle: (mode: 'dark' | 'light' | 'satellite' | 'terrain') => void;
  companyFilter: string;
  setCompanyFilter: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  availableCategories: string[];
  heatmapOverlay: boolean;
  setHeatmapOverlay: (val: boolean) => void;
};

export default function Sidebar({
  dict,
  locale,
  data,
  filterMode,
  setFilterMode,
  isSidebarOpen = true,
  onCollapseToggle,
  colorMode,
  setColorMode,
  districtFilter,
  setDistrictFilter,
  availableDistricts,
  mapStyle,
  setMapStyle,
  companyFilter,
  setCompanyFilter,
  categoryFilter,
  setCategoryFilter,
  availableCategories,
  heatmapOverlay,
  setHeatmapOverlay
}: SidebarProps) {

  /** "VIII" -> "VIII. kerület" (hu) / "District VIII" (en) */
  const districtLabel = (key: string) => {
    if (key === '__other__') return dict.sidebar.otherDistrict;
    return locale === 'hu' ? `${key}${dict.sidebar.districtSuffix}` : `District ${key}`;
  };

  // Compute Top Companies and Categories
  const { topCompanies, topCategories, allCompanies } = useMemo(() => {
    const companiesCount: Record<string, number> = {};
    const categoriesCount: Record<string, number> = {};
    const companiesSet = new Set<string>();

    data.forEach((item) => {
      if (item.company) {
        companiesCount[item.company] = (companiesCount[item.company] || 0) + 1;
        if (item.company.toLowerCase() !== 'ismeretlen' && item.company.trim() !== '') {
          companiesSet.add(item.company);
        }
      }
      if (item.category) {
        categoriesCount[item.category] = (categoriesCount[item.category] || 0) + 1;
      }
    });

    return {
      topCompanies: Object.entries(companiesCount)
        .filter(([name]) => name.toLowerCase() !== 'ismeretlen' && name !== '')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      topCategories: Object.entries(categoriesCount)
        .filter(([name]) => name !== '')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      allCompanies: Array.from(companiesSet).sort()
    };
  }, [data]);

  return (
    <Paper
      elevation={4}
      sx={{
        width: { xs: '100%', sm: 380 },
        maxWidth: '100vw',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transition: 'transform 0.3s ease-in-out',
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        position: 'absolute',
        zIndex: 1000,
        bgcolor: 'background.paper',
        borderRadius: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">{dict.sidebar.title}</Typography>
          <Typography variant="body2" color="text.secondary">{dict.sidebar.subtitle}</Typography>
        </Box>
        <IconButton onClick={onCollapseToggle} size="small" sx={{ ml: 1 }} aria-label={dict.home.close}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2 }}>
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{dict.sidebar.mapSettings}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{dict.sidebar.mapStyle}</InputLabel>
              <Select value={mapStyle} label={dict.sidebar.mapStyle} onChange={(e) => setMapStyle(e.target.value as any)}>
                <MenuItem value="dark">{dict.sidebar.styleDark}</MenuItem>
                <MenuItem value="light">{dict.sidebar.styleLight}</MenuItem>
                <MenuItem value="satellite">{dict.sidebar.styleSatellite}</MenuItem>
                <MenuItem value="terrain">{dict.sidebar.styleTerrain}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{dict.sidebar.colorBy}</InputLabel>
              <Select value={colorMode} label={dict.sidebar.colorBy} onChange={(e) => setColorMode(e.target.value as any)}>
                <MenuItem value="default">{dict.sidebar.colorDefault}</MenuItem>
                <MenuItem value="category">{dict.sidebar.colorCategory}</MenuItem>
                <MenuItem value="company">{dict.sidebar.colorCompany}</MenuItem>
                <MenuItem value="size">{dict.sidebar.colorSize}</MenuItem>
                <MenuItem value="startDate">{dict.sidebar.colorStartDate}</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={<Switch checked={heatmapOverlay} onChange={(e) => setHeatmapOverlay(e.target.checked)} color="primary" />}
              label={dict.sidebar.heatmap}
            />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{dict.sidebar.filters}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{dict.sidebar.district}</InputLabel>
              <Select value={districtFilter} label={dict.sidebar.district} onChange={(e) => setDistrictFilter(e.target.value)}>
                <MenuItem value="all">{dict.sidebar.allDistricts}</MenuItem>
                {availableDistricts.map(d => (
                  <MenuItem key={d} value={d}>{districtLabel(d)}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>{dict.sidebar.usagePurpose}</InputLabel>
              <Select value={categoryFilter} label={dict.sidebar.usagePurpose} onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">{dict.sidebar.allTypes}</MenuItem>
                {availableCategories.map(c => (
                  <MenuItem key={c} value={c}>{translateCategory(c, locale)}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Autocomplete
              freeSolo
              options={allCompanies}
              value={companyFilter}
              onInputChange={(event, newInputValue) => {
                setCompanyFilter(newInputValue);
              }}
              renderInput={(params) => <TextField {...params} label={dict.sidebar.searchCompany} size="small" />}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>{dict.sidebar.status}</InputLabel>
              <Select value={filterMode} label={dict.sidebar.status} onChange={(e) => setFilterMode(e.target.value as any)}>
                <MenuItem value="all">{dict.sidebar.statusAll}</MenuItem>
                <MenuItem value="active">{dict.sidebar.statusActive}</MenuItem>
                <MenuItem value="expiring">{dict.sidebar.statusExpiring}</MenuItem>
                <MenuItem value="expired">{dict.sidebar.statusExpired}</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{dict.sidebar.stats}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 'bold' }}>{dict.sidebar.topCompanies}</Typography>
            {topCompanies.map(([name, count], idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>{name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{count}</Typography>
              </Box>
            ))}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>{dict.sidebar.topCategories}</Typography>
            {topCategories.map(([name, count], idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>{translateCategory(name, locale)}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{count}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ mt: 'auto', p: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {dict.sidebar.shownLocations} <strong>{data.length} {dict.sidebar.pieces}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {dict.sidebar.ctaQuestion}{' '}
          <a
            href={localePath(locale, '/a-projektrol')}
            style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}
          >
            {dict.sidebar.ctaLink}
          </a>
        </Typography>
      </Box>
    </Paper>
  );
}
