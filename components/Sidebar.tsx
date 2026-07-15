import React, { useMemo } from 'react';
import { 
  Paper, Typography, Box, FormControl, InputLabel, Select, MenuItem, 
  Autocomplete, TextField, Switch, FormControlLabel, IconButton, Divider,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

type SidebarProps = {
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
        width: 380, 
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
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }} color="primary">Budapest Közterület</Typography>
          <Typography variant="body2" color="text.secondary">Közterület-használati határozatok</Typography>
        </Box>
        <IconButton onClick={onCollapseToggle} size="small" sx={{ ml: 1 }}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2 }}>
        <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Térkép Beállítások</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Térkép Stílusa</InputLabel>
              <Select value={mapStyle} label="Térkép Stílusa" onChange={(e) => setMapStyle(e.target.value as any)}>
                <MenuItem value="dark">Sötét (Dark)</MenuItem>
                <MenuItem value="light">Világos (Light)</MenuItem>
                <MenuItem value="satellite">Műhold (Satellite)</MenuItem>
                <MenuItem value="terrain">Domborzat (Terrain)</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Színezés Alapján</InputLabel>
              <Select value={colorMode} label="Színezés Alapján" onChange={(e) => setColorMode(e.target.value as any)}>
                <MenuItem value="default">Alapértelmezett (Lejárat)</MenuItem>
                <MenuItem value="category">Használat célja (Típus)</MenuItem>
                <MenuItem value="company">Kérelmező (Cég)</MenuItem>
                <MenuItem value="size">Méret (nm)</MenuItem>
                <MenuItem value="startDate">Kezdés dátuma</MenuItem>
              </Select>
            </FormControl>
            
            <FormControlLabel
              control={<Switch checked={heatmapOverlay} onChange={(e) => setHeatmapOverlay(e.target.checked)} color="primary" />}
              label="Hőtérkép bekapcsolása"
            />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Szűrők</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Kerület</InputLabel>
              <Select value={districtFilter} label="Kerület" onChange={(e) => setDistrictFilter(e.target.value)}>
                <MenuItem value="all">Minden Kerület</MenuItem>
                {availableDistricts.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Használati Cél</InputLabel>
              <Select value={categoryFilter} label="Használati Cél" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">Minden Típus</MenuItem>
                {availableCategories.map(c => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
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
              renderInput={(params) => <TextField {...params} label="Cég keresése" size="small" />}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Státusz (Lejárat)</InputLabel>
              <Select value={filterMode} label="Státusz (Lejárat)" onChange={(e) => setFilterMode(e.target.value as any)}>
                <MenuItem value="all">Összes</MenuItem>
                <MenuItem value="active">Érvényes</MenuItem>
                <MenuItem value="expiring">Hamarosan lejár</MenuItem>
                <MenuItem value="expired">Lejárt</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>

        <Accordion disableGutters elevation={0} sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Statisztika (Top 5)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', fontWeight: 'bold' }}>Top Cégek</Typography>
            {topCompanies.map(([name, count], idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>{name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{count}</Typography>
              </Box>
            ))}

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 2, textTransform: 'uppercase', fontWeight: 'bold' }}>Top Célok</Typography>
            {topCategories.map(([name, count], idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" noWrap sx={{ maxWidth: '80%' }}>{name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{count}</Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </Box>

      <Box sx={{ mt: 'auto', p: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Megjelenített helyszínek: <strong>{data.length} db</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Hasonló elemzést szeretne a saját piacáról?{' '}
          <a href="/a-projektrol" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
            Bonvo Consulting →
          </a>
        </Typography>
      </Box>
    </Paper>
  );
}
