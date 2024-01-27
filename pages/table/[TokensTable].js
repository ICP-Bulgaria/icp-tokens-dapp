/* eslint-disable @next/next/no-img-element */
import React, { useContext, useMemo } from 'react';
import { GeneralContext } from '../../contexts/General.Context';
import { AgGridReact } from 'ag-grid-react'; // React Grid Logic
import 'ag-grid-community/styles/ag-grid.css'; // Core CSS
import 'ag-grid-community/styles/ag-theme-quartz.css'; // Theme
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { testData } from './seedData';
import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import CustomTooltip from '../../ui/components/CustomTooltip';
import { isMobile } from 'react-device-detect';

const CurrencyPriceChart = ({ value }) => {
  return (
    <ResponsiveContainer>
      <LineChart
        width={600}
        height={300}
        data={value}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <Line type="natural" dataKey="price" stroke="#019a9a" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};
const PriceMovementIndicatorRenderer = ({ value }) => (
  <Typography component='span' className="inline-flex justify-center h-full items-center">
     {value.movement === 'up' 
     ? <ArrowDropUpIcon className='text-green-500' fontSize='large'/> 
     : <ArrowDropDownIcon className='text-red-500' fontSize='large'/>}
    <Typography className="ml-2">{value.percent}%</Typography>
  </Typography>
);
const TokensLogoRenderer = ({ value, data }) => (
  <Typography component='span' className="inline-flex h-full w-full items-center">
    {value && (
      <img
        alt={`${value} Logo`}
        src={data.icon}
        className="block w-30 h-30 mr-2 brightness-110"
        style={{ width: '30px', height: '30px' }}
      />
    )}
    {isMobile && <Typography>{data.symbol}</Typography>}
    {!isMobile && (
      <Typography className='text-30'>
        {value} {data.symbol}
      </Typography>
    )}
  </Typography>
);
const CirculatingSupplyRenderer = ({value}) => (
  <Box className="items-center leading-normal">
    <Typography className="overflow-hidden whitespace-nowrap overflow-ellipsis">
      {value.circulatingSupply}
    </Typography>
    {value.percent < 100 && (
      <LinearProgress
        value={value.percent}
        variant="determinate"
        sx={{
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#019a9a'
          }
        }}
      />
    )}
  </Box>
)
function TokensTable() {
  const {identity, setIdentity} = useContext(GeneralContext);
  // console.log(identity)
  const colDefs = [
    {
      field: 'id',
      width: 50,
      headerName: '#',
      pinned: 'left'
    },
    {
      field: 'name',
      headerName: 'Coin',
      cellRenderer: TokensLogoRenderer,
      filter: true,
      autoWidth: `${!isMobile ? true : false}`,
      width: `${isMobile && 100}`,
      pinned: 'left'
    },
    {
      field: 'price',
      headerName: 'Price',
      autoWidth: `${!isMobile ? true : false}`,
      width: `${isMobile && 100}`,
      valueFormatter: params => {
        return '$' + params.value.toLocaleString();
      }
    },
    {
      field: '24%',
      headerName: '24h %',
      autoWidth: true,
      cellRenderer: PriceMovementIndicatorRenderer
    },
    {
      field: 'marketCap',
      headerName: 'Market Cap',
      autoWidth: true,
      valueFormatter: params => {
        return '$' + params.value.toLocaleString();
      }
    },
    {
      field: 'volume24H',
      headerName: 'Volume(24h)',
      autoWidth: true,
      autoHeight: true,
      sortable: false,
      cellRenderer: params => (
        <Box className="leading-normal items-center">
          <Typography>{params.value.dollars}</Typography>
          <Typography>{params.value.currency}</Typography>
        </Box>
      )
    },
    {
      field: 'circulatingSupply',
      headerName: 'Circulating Supply',
      autoWidth: true,
      autoHeight: true,
      sortable: false,
      tooltipField: 'circulatingSupply',
      tooltipComponentParams: { color: 'white' },
      cellRenderer: CirculatingSupplyRenderer
    },
    {
      field: 'chartData',
      headerName: 'Last 7 Days',
      width: 220,
      sortable: false,
      cellRenderer: CurrencyPriceChart
    }
  ];
  const defaultColDef = useMemo(() => {
    return {
      tooltipComponent: CustomTooltip,
    };
  }, []);
  return (
    <Paper className="max-w-1500 mx-auto">
      <Paper className="ag-theme-quartz w-full h-full">
        <AgGridReact
          rowData={testData}
          columnDefs={colDefs}
          domLayout="autoHeight"
          defaultColDef={defaultColDef}
          tooltipShowDelay={0}
        />
      </Paper>
    </Paper>
  );
}
export default TokensTable;