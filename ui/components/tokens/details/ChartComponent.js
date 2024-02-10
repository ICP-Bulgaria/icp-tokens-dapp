import React, { useEffect, useRef, useState, useContext } from 'react';
import { GeneralContext } from '../../../../contexts/general/General.Context';
import { createChart } from 'lightweight-charts';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import useFetchOHLCVData from '../../../hooks/useFetchOHLCVData'

// Define available periods for the chart
const periods = ['7d', '30d', '90d', 'All'];

// Define available intervals for candlestick charts
const intervals = ['1h', '1d', '1w'];

const ChartComponent = ({ canister_id }) => {
  const chartContainerRef = useRef(null); // Ref for the div container of the chart
  const [selectedPeriod, setSelectedPeriod] = useState('90d'); // State for the selected period
  const [selectedInterval, setSelectedInterval] = useState('1h'); // State for selected interval for candlestick charts
  const [chartType, setChartType] = useState('area'); // State for the chart type (area or candle)

  const { parseTimestampToUnix, calculatePrecisionAndMinMove } = useContext(GeneralContext)
    
  // Use the custom hook to fetch data
  const { data, loading, error } = useFetchOHLCVData(canister_id, selectedInterval, selectedPeriod);

  const setupAreaChart = (chart, data, min) => {
    const { precision, minMove } = calculatePrecisionAndMinMove(min);

    let priceFormat = {
      type: 'price'
    }

    if(precision && minMove) {
      priceFormat.precision = precision
      priceFormat.minMove = minMove
    }

    const series = chart.addAreaSeries({
      topColor: 'rgba(1, 154, 154, 0.56)', // Lighter shade with opacity for the top
      bottomColor: 'rgba(1, 154, 154, 0.04)', // Very light shade with low opacity for the bottom
      lineColor: 'rgba(1, 154, 154, 1)', // Solid color for the line
      lineWidth: 2,
      priceFormat: {
        type: 'price',
        precision: precision, // Adjusted based on min value
        minMove: minMove,
      },
    });
    series.setData(data);
  };  
  
  const setupCandleChart = (chart, data, min) => {
    const { precision, minMove } = calculatePrecisionAndMinMove(min);

    const series = chart.addCandlestickSeries({
      upColor: 'rgb(38,166,154)',
      downColor: 'rgb(239,83,80)',
      borderDownColor: 'rgb(239,83,80)',
      borderUpColor: 'rgb(38,166,154)',
      wickDownColor: 'rgb(239,83,80)',
      wickUpColor: 'rgb(38,166,154)',
      priceFormat: {
        type: 'price',
        precision: precision, // Adjusted based on min value
        minMove: minMove,
      },
    });
    series.setData(data);
  };

  useEffect(() => {
    if (!chartContainerRef.current || loading || error) return;

    // Initialize the chart with basic configuration
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: '#ffffff',
        textColor: 'rgba(33, 56, 77, 1)',
      },
      grid: {
        vertLines: {
          color: 'rgba(197, 203, 206, 0.7)',
        },
        horzLines: {
          color: 'rgba(197, 203, 206, 0.7)',
        },
      },
      crosshair: {
        mode: 1, // Corresponds to CrosshairMode.Normal if using the LightweightCharts namespace
      },
      priceScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 1)',
      },
    });

    let transformedData;
    if (chartType === 'area') {
      transformedData = data.data.map(d => ({
        time: parseTimestampToUnix(d.timestamp),
        value: parseFloat(d.close) // Ensure value is a number
      }));
      setupAreaChart(chart, transformedData, data.min);
    } else if (chartType === 'candle') {
      transformedData = data.data.map(d => ({
        time: parseTimestampToUnix(d.timestamp),
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close) // Ensure all numeric fields are converted
      }));
      setupCandleChart(chart, transformedData, data.min);
    }

    // Assuming `data.start_date` and `data.end_date` are in a format recognized by your `parseTimestampToUnix` function
    // Adjust the chart's visible range
    if (data.start_date && data.end_date) {
      const startTime = parseTimestampToUnix(data.start_date);
      const endTime = parseTimestampToUnix(data.end_date);
      chart.timeScale().setVisibleRange({ from: startTime, to: endTime });
    }

    return () => chart.remove();
  }, [chartType, data, loading, error]); // Reinitialize the chart when these dependencies change

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Function to handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    // Automatically set interval to '1d' when switching to candle chart
    if (newType === 'candle') {
      setSelectedInterval('1d');
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4 max-w-6xl">
      <div className="flex gap-1 justify-between">
        {/* Left side: UI for toggling chart type */}
        <ButtonGroup size="small" aria-label="chart type buttons">
          <Tooltip title="Area Chart">
            <Button 
              variant={chartType === 'area' ? "contained" : "outlined"}
              {...(chartType === 'area' && { color: "primary" })}
              onClick={() => handleChartTypeChange('area')}
            >
              <ShowChartIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Candle Chart">
            <Button 
              variant={chartType === 'candle' ? "contained" : "outlined"}
              {...(chartType === 'candle' && { color: "primary" })}
              onClick={() => handleChartTypeChange('candle')}
            >
              <CandlestickChartIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>

        {/* Right side: UI for selecting intervals (only if chart type is 'candle') */}
        {chartType === 'candle' && (
          <ButtonGroup size="small" aria-label="chart interval buttons">
            {intervals.map((interval) => (
              <Tooltip key={interval} title={`${interval} Interval`}>
                <Button
                  variant={selectedInterval === interval ? "contained" : "outlined"}
                  {...(selectedInterval === interval && { color: "primary" })}
                  onClick={() => setSelectedInterval(interval)}
                >
                  {interval}
                </Button>
              </Tooltip>
            ))}
          </ButtonGroup>
        )}
      </div>
      <div ref={chartContainerRef} className="w-full h-96" />
      {/* Period Selection UI */}
      <ButtonGroup 
        variant="outlined"
        aria-label="outlined primary button group"
        fullWidth={true}
        className="max-w-lg m-auto mt-6"
      >
          {periods.map((period) => (
            <Tooltip key={period} title={`${period} Period`}>
              <Button
                variant={selectedPeriod === period ? "contained" : "outlined"}
                {...(selectedPeriod === period && { color: "primary" })}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            </Tooltip>
          ))}
        </ButtonGroup>
    </div>
  );
};

export default ChartComponent;
