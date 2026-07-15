import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TableSortLabel, Box, Typography 
} from '@mui/material';

type DataTableProps = {
  data: any[];
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function DataTable({ data }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'size') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === 'startDate' || sortConfig.key === 'endDate') {
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
        } else {
          aValue = String(aValue || '').toLowerCase();
          bValue = String(bValue || '').toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const headers = [
    { key: 'id', label: 'Iktatószám' },
    { key: 'company', label: 'Kérelmező' },
    { key: 'category', label: 'Cél' },
    { key: 'address', label: 'Hely' },
    { key: 'size', label: 'Méret (nm)' },
    { key: 'startDate', label: 'Kezdete' },
    { key: 'endDate', label: 'Vége' },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, flexGrow: 1, width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <TableContainer component={Paper} elevation={4} sx={{ height: '100%', borderRadius: 2 }}>
        <Table stickyHeader size="small" aria-label="Közterület táblázat">
          <TableHead>
            <TableRow>
              {headers.map((col) => (
                <TableCell 
                  key={col.key} 
                  sortDirection={sortConfig?.key === col.key ? sortConfig.direction : false}
                  sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}
                >
                  <TableSortLabel
                    active={sortConfig?.key === col.key}
                    direction={sortConfig?.key === col.key ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort(col.key)}
                  >
                    {col.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((item, idx) => (
              <TableRow 
                key={`${item.id}-${idx}`}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.company}>
                  <Link href={`/helyszin/${item.slug}`} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>
                    {item.company}
                  </Link>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.address}>
                  {item.address}
                </TableCell>
                <TableCell align="right">{item.size}</TableCell>
                <TableCell>{item.startDate}</TableCell>
                <TableCell>{item.endDate}</TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">Nincs megjeleníthető adat a kiválasztott szűrőkkel.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
