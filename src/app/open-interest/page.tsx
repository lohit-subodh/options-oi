//import { NextPage } from 'next';
//import React from 'react';

//const OpenInterestPage: React.FC = () => {
//  return (
//    <div style={{ padding: '20px', textAlign: 'center' }}>
//      <h1>Open Interest Page</h1>
//      <p>This is a simple page for Open Interest.</p>
//    </div>
//  );
//}

//export default OpenInterestPage;

'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import Head from 'next/head';
//import './OpenInterest.css';
//import { Helmet } from 'react-helmet';
//import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from 'plotly.js';
import styles from './OpenInterest.module.css';

// Define types for the state variables
interface OpenInterestData {
  strike_prices: number[];
  ce_open_interests: number[];
  pe_open_interests: number[];
  ce_open_interests_change: number[];
  pe_open_interests_change: number[];
  underlying_value: number;
  expiry_dates?: string[];
  selected_expiry?: string;
}

function OpenInterest() {
  const [data, setData] = useState<OpenInterestData | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NIFTY');
  const [expiryDates, setExpiryDates] = useState<string[]>([]);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [isMarketOpen, setIsMarketOpen] = useState<boolean>(false);

  useEffect(() => {
    checkMarketStatus();
    fetchData(selectedSymbol);

    const intervalId = setInterval(() => {
      checkMarketStatus();
      if (isMarketOpen) {
        fetchData(selectedSymbol);
      }
    }, 180000); // 3 minutes in milliseconds

    return () => clearInterval(intervalId);
  }, [selectedSymbol, isMarketOpen]);

  useEffect(() => {
    if (selectedExpiry) {
      fetchDataForExpiry(selectedSymbol, selectedExpiry);
    }
  }, [selectedExpiry, selectedSymbol]);

  const checkMarketStatus = async () => {
    try {
      const response = await axios.get(' http://127.0.0.1:8000/api/market-status');
      setIsMarketOpen(response.data.is_open);
    } catch (error) {
      console.error('Error checking market status:', error);
    }
  };

  const fetchData = async (symbol: string) => {
    try {
      const response = await axios.get(` http://127.0.0.1:8000/api/nifty-options/${symbol}`);
      setData(response.data);
      setExpiryDates(response.data.expiry_dates || []);
      setSelectedExpiry(response.data.selected_expiry || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchDataForExpiry = async (symbol: string, expiry: string) => {
    try {
      const response = await axios.get(` http://127.0.0.1:8000/api/nifty-options/${symbol}/${expiry}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data for expiry:', error);
    }
  };

  const handleExpiryChange = (expiry: string) => {
    setSelectedExpiry(expiry);
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  if (!data) {
    return (
      <div className={styles.container}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const plotLayout : Partial<Layout>  = {
    //paper_bgcolor: 'rgba(74, 20, 140, 0.5)',
    //plot_bgcolor: 'rgba(0,0,0,0)',
    //font: { color: '#ffffff' },
    //title: { text: '', font: { color: '#ffffff' } },
    xaxis: {
      title: { text: 'Strike Price' },
      tickmode: 'array',
      tickvals: data?.strike_prices.filter(price => price % 100 === 0),
      gridcolor: 'rgba(0,0,0,0.1)',
      linecolor: 'rgba(0,0,0,0.2)',
    },
    yaxis: {
        title: { text: 'Open Interest (in thousands)' },
        gridcolor: 'rgba(0,0,0,0.1)',
        linecolor: 'rgba(0,0,0,0.2)',
      },
    barmode: 'group',
    autosize: true,
    height: 500,
    margin: { l: 50, r: 50, b: 50, t: 80, pad: 4 },
    shapes: [
      {
        type: 'line',
        x0: data?.underlying_value,
        y0: 0,
        x1: data?.underlying_value,
        y1: 1,
        yref: 'paper',
        line: {
          color: 'red',
          width: 2,
          dash: 'dash',
        },
      },
    ],
    legend: {
      x: 0,
      y: 1.1,
      orientation: 'h',
     // font: { color: '#ffffff' },
    },
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff',
  };

  const plotConfig = {
    displayModeBar: true, // Set to false to hide the modebar entirely
    displaylogo: false, // Hide the Plotly logo on the modebar
    modeBarButtonsToRemove: [
      'zoom2d',      // Remove zoom tool
      'pan2d',       // Remove pan tool
      'select2d',    // Remove box select tool
      'zoomIn2d',    // Remove zoom in tool
      'zoomOut2d',   // Remove zoom out tool
      'autoScale2d', // Remove autoscale tool
      'resetScale2d', // Remove reset scale tool
      'lasso2d',   // Remove lasso select tool
      'toImage',      // Remove download plot as PNG tool
  
    ],
    responsive: true
  };

  return (
    <>
    <Head>
        <title>Options Open Interest Data</title>
      </Head>
    
    <div className={styles.container}>
      
      {/*<header>
        <nav>
          <div className="logo">
            <Link to="/">
              <img src="./marketViz_logo.png" alt="Logo" className="logo-image" />
              MartketViz
            </Link>
          </div>
        </nav>
      </header>*/}
      <h1 className={styles.pageTitle}>Open Interest Analysis</h1>
      <div className={`${styles.marketStatus} ${isMarketOpen ? 'open' : 'closed'}`}>
        <span className={styles.statusIcon}></span>
        Market Status: {isMarketOpen ? 'Open' : 'Closed'}
      </div>
      <div className={styles.controls}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>{selectedSymbol}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handleSymbolChange('NIFTY')}>NIFTY</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSymbolChange('BANKNIFTY')}>BANKNIFTY</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSymbolChange('FINNIFTY')}>FINNIFTY</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleSymbolChange('MIDCPNIFTY')}>MIDCPNIFTY</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>{selectedExpiry}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {expiryDates.map((date) => (
              <DropdownMenuItem key={date} onSelect={() => handleExpiryChange(date)}>
                {date}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={styles.plotContainer}>
        {data && Array.isArray(data.strike_prices) && 
         Array.isArray(data.ce_open_interests) && 
         Array.isArray(data.pe_open_interests) && (
          <>
          <Card className={styles.plotWrapper}>
          <CardContent>
          <Plot
              key={`oi-change-${selectedSymbol}-${selectedExpiry}`}
              data={[
                {
                  x: data.strike_prices,
                  y: data.ce_open_interests_change,
                  type: 'bar',
                  name: 'CE OI Change',
                  marker: { color: 'rgba(0, 128, 0, 0.7)' },
                },
                {
                  x: data.strike_prices,
                  y: data.pe_open_interests_change,
                  type: 'bar',
                  name: 'PE OI Change',
                  marker: { color: 'rgba(255, 0, 0, 0.7)' },
                },
              ]}
              layout={{
                ...plotLayout,
                title: { text: 'Change in Open Interest',font: { color: '#333' } },
              }}
              config={plotConfig}
              style={{width: '100%', height: '100%'}}
              />
              </CardContent>
          </Card>
          <Card className={styles.plotWrapper}>
          <CardContent>
          <Plot
          key={`OI-${selectedSymbol}-${selectedExpiry}`}
            data={[
              {
                x: data.strike_prices,
                y: data.ce_open_interests,
                type: 'bar',
                name: 'CE OI Overall',
                marker: { color: 'rgba(0, 128, 0, 0.7)' },
              },
              {
                x: data.strike_prices,
                y: data.pe_open_interests,
                type: 'bar',
                name: 'PE OI Overall',
                marker: { color: 'rgba(255, 0, 0, 0.7)' },
              },
            ]}
            layout={{
              ...plotLayout,
              title:  { text: 'Overall Open Interest',font: { color: '#333' } },
            }}
            config={plotConfig}
            style={{width: '100%', height: '100%'}}
            />
            </CardContent>
          </Card>
          </>
        )}
      </div>
    </div>
    </>
  );
}

export default OpenInterest;
