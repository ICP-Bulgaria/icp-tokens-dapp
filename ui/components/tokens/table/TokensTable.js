/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useContext } from 'react';

import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import {
  Alert,
  Paper,
  Skeleton
} from '@mui/material';
import { GeneralContext } from '../../../../contexts/general/General.Context';
import { isMobile } from 'react-device-detect';
import SupplyDetailsTooltip from '../SupplyDetailsTooltip';
import { useRouter } from 'next/router';
import useFetchTokens from '../../../hooks/useFetchTokens'; // Adjust the path as needed
import getTokenTableColDefs from './tokenTableColDefs'; 

function TokensTable() {
  const {formatPrice} = useContext(GeneralContext);
  const { data, loaded, error } = useFetchTokens(`${process.env.NEXT_PUBLIC_WEB2_API_URL}/tokens`);
  const router = useRouter();
  const colDefs = getTokenTableColDefs({formatPrice, isMobile})
  const defaultColDef = useMemo(() => {
    return {
      tooltipComponent: SupplyDetailsTooltip
    };
  }, []);
  useEffect(() => {
  }, []);
  const onRowClicked = params => {
    const canisterId = params.data['canister_id'];
    if (canisterId) {
      router.push(`/token/${canisterId}`);
    }
  };
  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}
      {!loaded && !error && <Skeleton variant="rounded" className='max-w-1500 mt-4' height={800} />}
      {loaded && data && (
        <Paper className="max-w-1500 mx-auto">
          <Paper className="ag-theme-quartz w-full h-full">
            <AgGridReact
              rowData={data}
              columnDefs={colDefs}
              domLayout="autoHeight"
              defaultColDef={defaultColDef}
              tooltipShowDelay={0}
              onRowClicked={onRowClicked}
              rowClass="cursor-pointer"
            />
          </Paper>
        </Paper>
      )}
    </>
  );
}
export default TokensTable;