import { createChart } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { Button, ButtonGroup, IconButton, Tooltip } from '@mui/material';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// const periodDataMap = {
//   '1D': candleSeriesDayData,
//   '1W': candleSeriesWeekData,
//   '1M': candleSeriesMonthData,
//   '1Y': candleSeriesData
// };
const periods = ['1D', '1W', '1M', '1Y'];

const ChartComponent = ({ data, colors }) => {
  const {
    backgroundColor = 'white',
    textColor = 'black',
    upCandleColor = '#26a69a',
    downCandleColor = '#ef5350',
    primaryColor = '#019A9AFF'
  } = colors || {};

  const chartContainerRef = useRef();
  const chartRef = useRef();
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [chartType, setChartType] = useState('area');
  const toolTipRef = useRef(null);
  const buttons = periods.map(period => (
    <Button
      key={period.toLowerCase()}
      value={period}
      style={{
        backgroundColor: selectedPeriod === period ? primaryColor : '#ffffff',
        color: selectedPeriod === period ? '#ffffff' : primaryColor
      }}
    >
      {period}
    </Button>
  ));

  useEffect(() => {
    if (!chartRef.current) {
      // Create a new chart when the component mounts
      chartRef.current = createChart(chartContainerRef.current, {
        layout: {
          textColor,
          background: { type: 'solid', color: backgroundColor }
        },
        height: 400,
        autoSize: true
      });

      // Create series based on chart type
      if (chartType === 'area') {
        const areaData = data.chart_prices.map(el => {
          return {
            time: el.date,
            value: parseFloat(el.close),
            high: parseFloat(el.high),
            low: parseFloat(el.low)
          };
        });
        setupAreaChart(areaData);
      } else if (chartType === 'candle') {
        const chartData = data?.chart_prices.map(el => ({
          time: el.date,
          open: parseFloat(el.open),
          high: parseFloat(el.high),
          low: parseFloat(el.low),
          close: parseFloat(el.close)
        }));

        setupChart(chartData);
      }
    }

    // Clean up when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartType]);

  // /**
  //  * useEffect for the dynamic change of the chart periods.
  //  */
  // useEffect(() => {
  //   if (chartRef.current) {
  //     chartRef.current.remove();
  //   }
  //
  //   const chartData = data?.chart_prices.map(el => ({
  //     time: el.date,
  //     value: parseFloat(el.close)
  //   }));
  //
  //   setupAreaChart(chartData);
  // }, [selectedPeriod]);

  /**
   * This function is used only for testing purposes.
   * @return {*[]}
   */
  const generateVolumeData = () => {
    const startDate = new Date('2023-01-01');
    const endDate = new Date('2023-12-31');
    const volumeData = [];

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const volume =
        Math.floor(Math.random() * (2000000 - 500000 + 1)) + 500000; // Adjust range as needed
      const originalDate = new Date(currentDate);
      const formattedDate = `${originalDate.getFullYear().toString()}-${(originalDate.getMonth() + 1).toString().padStart(2, '0')}-${originalDate.getDate().toString().padStart(2, '0')}`;
      volumeData.push({ time: formattedDate, value: volume });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return volumeData;
  };

  /**
   * Function which creates an area chart with chart options.
   * @param chartData
   * @return {(function(): void)|*}
   */
  const setupAreaChart = chartData => {
    const areaSeries = chartRef.current.addAreaSeries({
      lineColor: '#019A9A',
      topColor: '#019A9A',
      bottomColor: 'rgb(1,154,154, 0.28)'
    });

    const volumeSeries = chartRef.current.addHistogramSeries({
      color: 'rgb(211,208,208)',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: ''
    });

    areaSeries.setData(chartData);

    volumeSeries.setData(generateVolumeData().sort((a, b) => a.time - b.time));

    chartRef.current.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0
      }
    });

    const container = chartContainerRef.current;
    const toolTip = document.createElement('div');
    const toolTipWidth = 80;
    const toolTipHeight = 80;
    const toolTipMargin = 15;

    toolTip.style.cssText = `
      height: 80px;
      position: absolute;
      display: none;
      padding: 8px;
      box-sizing: border-box;
      font-size: 12px;
      text-align: left;
      z-index: 1000;
      top: 12px;
      left: 12px;
      pointer-events: none;
      border: 1px solid;
      border-radius: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: white;
      color: black;
      border-color: #019A9AFF;
    `;

    container.appendChild(toolTip);
    toolTipRef.current = toolTip;

    const updateToolTip = (param, tokenName) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data = param.seriesData.get(areaSeries);
        const price = data?.value !== undefined ? data?.value : data?.close;
        const high = data?.high !== undefined ? data?.high : 'No data.';
        const low = data?.low !== undefined ? data?.low : 'No data.';
        toolTip.innerHTML = `<div style="color: #019A9AFF">${tokenName}</div>
        <div style="font-size: 16px; margin: 4px 0px; color: black">
          <p>${parseFloat(price).toFixed(8)}</p>
        </div>
        <div style="color: black">
          ${dateStr}
        </div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > container.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > container.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + 'px';
        toolTip.style.top = top + 'px';
      }
    };

    const crosshairMoveHandler = param => {
      updateToolTip(param, data?.symbol);
    };

    chartRef.current.subscribeCrosshairMove(crosshairMoveHandler);

    return () => {
      chartRef.current.unsubscribeCrosshairMove(crosshairMoveHandler);
    };
  };

  /**
   * Function which creates a candle chart with chart options.
   * @param chartData - Chart data.
   */
  const setupChart = chartData => {
    const candleSeries = chartRef.current.addCandlestickSeries({
      upColor: upCandleColor,
      downColor: downCandleColor,
      borderDownColor: downCandleColor,
      borderUpColor: upCandleColor,
      wickDownColor: downCandleColor,
      wickUpColor: upCandleColor
    });

    candleSeries.setData(chartData);

    const volumeSeries = chartRef.current.addHistogramSeries({
      color: 'rgb(211,208,208)',
      priceFormat: {
        type: 'volume'
      },
      priceScaleId: ''
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.9,
        bottom: 0
      }
    });

    volumeSeries.setData(generateVolumeData().sort((a, b) => a.time - b.time));

    const container = chartContainerRef.current;
    const toolTip = document.createElement('div');
    const toolTipWidth = 80;
    const toolTipHeight = 80;
    const toolTipMargin = 15;

    toolTip.style.cssText = `
      height: 120px;
      position: absolute;
      display: none;
      padding: 8px;
      box-sizing: border-box;
      font-size: 12px;
      text-align: left;
      z-index: 1000;
      top: 12px;
      left: 12px;
      pointer-events: none;
      border: 1px solid;
      border-radius: 2px;
      font-family: -apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: white;
      color: black;
      border-color: #019A9AFF;
    `;

    container.appendChild(toolTip);
    toolTipRef.current = toolTip;

    const updateToolTip = (param, tokenName) => {
      if (
        param.point === undefined ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        toolTip.style.display = 'none';
      } else {
        const dateStr = param.time;
        toolTip.style.display = 'block';
        const data = param.seriesData.get(candleSeries);
        console.log(data);
        const price = data?.value !== undefined ? data?.value : data?.close;
        const high = data?.high !== undefined ? data?.high : 'No data.';
        const low = data?.low !== undefined ? data?.low : 'No data.';
        toolTip.innerHTML = `<div style="color: #019A9AFF">${tokenName}</div>
        <div style="font-size: 16px; margin: 4px 0px; color: black">
          <p>${parseFloat(price).toFixed(8)}</p>
          <p style="font-size: 11px">High: ${parseFloat(high).toFixed(8)}</p>
          <p style="font-size: 11px">Low: ${parseFloat(low).toFixed(8)}</p>
        </div>
        <div style="color: black">
          ${dateStr}
        </div>`;

        const y = param.point.y;
        let left = param.point.x + toolTipMargin;
        if (left > container.clientWidth - toolTipWidth) {
          left = param.point.x - toolTipMargin - toolTipWidth;
        }

        let top = y + toolTipMargin;
        if (top > container.clientHeight - toolTipHeight) {
          top = y - toolTipHeight - toolTipMargin;
        }
        toolTip.style.left = left + 'px';
        toolTip.style.top = top + 'px';
      }
    };

    const crosshairMoveHandler = param => {
      updateToolTip(param, data?.symbol);
    };

    chartRef.current.subscribeCrosshairMove(crosshairMoveHandler);

    return () => {
      chartRef.current.unsubscribeCrosshairMove(crosshairMoveHandler);
    };
  };

  return (
    <div className="flex flex-col justify-center gap-4 max-w-6xl">
      <div className="flex gap-1">
        <ButtonGroup size="small" aria-label="text button group">
          <Tooltip title="Area Chart">
            <Button
              color="primary"
              onClick={() => {
                setChartType('area');
              }}
              className="cursor-pointer"
              style={{
                backgroundColor:
                  chartType === 'area' ? primaryColor : '#ffffff',
                color: chartType === 'area' ? '#ffffff' : primaryColor
              }}
            >
              <ShowChartIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Candle Chart">
            <Button
              color="primary"
              onClick={() => {
                setChartType('candle');
              }}
              className="cursor-pointer"
              style={{
                backgroundColor:
                  chartType === 'candle' ? primaryColor : '#ffffff',
                color: chartType === 'candle' ? '#ffffff' : primaryColor
              }}
            >
              <CandlestickChartIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </div>
      <div ref={chartContainerRef} />
      <ButtonGroup
        onClick={value => {
          setSelectedPeriod(event.target.value);
        }}
        variant="outlined"
        aria-label="outlined primary button group"
        fullWidth={true}
        className="max-w-lg m-auto"
      >
        {buttons}
      </ButtonGroup>
    </div>
  );
};

export default ChartComponent;
