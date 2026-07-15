import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TableSortLabel, Box, Typography
} from '@mui/material';
import {
  localePath,
  translateCategory,
  translateAddress,
  formatDate,
  type ClientDictionary,
  type Locale,
} from '@/lib/i18n';

type DataTableProps = {
  data: any[];
  dict: ClientDictionary;
  locale: Locale;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export default function DataTable({ data, dict, locale }: DataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const sortedData = useMemo(() => {
    const sortableItems = [...data];
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
        } else if (sortConfig.key === 'category') {
          // Sort by what the reader actually sees.
          aValue = translateCategory(aValue, locale).toLowerCase();
          bValue = translateCategory(bValue, locale).toLowerCase();
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
  }, [data, sortConfig, locale]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const headers = [
    { key: 'id', label: dict.table.refNumber },
    { key: 'company', label: dict.table.applicant },
    { key: 'category', label: dict.table.purpose },
    { key: 'address', label: dict.table.location },
    { key: 'size', label: dict.table.size },
    { key: 'startDate', label: dict.table.startDate },
    { key: 'endDate', label: dict.table.endDate },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, flexGrow: 1, width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <TableContainer component={Paper} elevation={4} sx={{ height: '100%', borderRadius: 2 }}>
        <Table stickyHeader size="small" aria-label={dict.table.ariaLabel}>
          <TableHead>
            <TableRow>
              {headers.map((col) => (
                <TableCell
                  key={col.key}
                  sortDirection={sortConfig?.key === col.key ? sortConfig.direction : false}
                  sx={{ fontWeight: 'bold', bgcolor: 'background.paper', whiteSpace: 'nowrap' }}
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{item.id}</TableCell>
                <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.company}>
                  <Link href={localePath(locale, `/helyszin/${item.slug}`)} style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>
                    {item.company || dict.common.unknown}
                  </Link>
                </TableCell>
                <TableCell>{translateCategory(item.category, locale)}</TableCell>
                <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={translateAddress(item.address, locale)}>
                  {translateAddress(item.address, locale)}
                </TableCell>
                <TableCell align="right">{item.size}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(item.startDate, locale)}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(item.endDate, locale)}</TableCell>
              </TableRow>
            ))}
            {sortedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                  <Typography color="text.secondary">{dict.table.empty}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
