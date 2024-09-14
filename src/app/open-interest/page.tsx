'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import Head from 'next/head';
import Link from 'next/link'; // Add this line
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from 'plotly.js';
import styles from './OpenInterest.module.css';
import RootLayout from '../layout';

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
      const response = await axios.get('http://127.0.0.1:8000/api/market-status');
      setIsMarketOpen(response.data.is_open);
    } catch (error) {
      console.error('Error checking market status:', error);
    }
  };

  const fetchData = async (symbol: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/nifty-options/${symbol}`);
      setData(response.data);
      setExpiryDates(response.data.expiry_dates || []);
      setSelectedExpiry(response.data.selected_expiry || '');
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchDataForExpiry = async (symbol: string, expiry: string) => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/nifty-options/${symbol}/${expiry}`);
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

  const plotLayout: Partial<Layout> = {
    xaxis: {
      title: { text: 'Strike Price' },
      tickmode: 'array',
      tickvals: data?.strike_prices.filter(price => price % 100 === 0),
      gridcolor: 'rgba(0,0,0,0.1)',
      linecolor: 'rgba(0,0,0,0.2)',
      showgrid: false,
    },
    yaxis: {
      title: { text: 'Open Interest ' },
      gridcolor: 'rgba(0,0,0,0.1)',
      linecolor: 'rgba(0,0,0,0.2)',
      showgrid: false,
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
    },
    plot_bgcolor: '#f8f9fa',
    paper_bgcolor: '#ffffff',
  };

  const plotConfig = {
    displayModeBar: false,
    displaylogo: false,
    responsive: true,
  };

  return (
    <RootLayout>    
      <Head>
        <title>Options Open Interest Data</title>
      </Head>
      <div className={styles.container}>
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/"  className="text-2xl font-bold text-blue-600">
          MarketViz
          </Link>
        </nav>
      </header>
        <h1 className={styles.pageTitle}>Open Interest Analysis</h1>
        <div className={`${styles.marketStatus} ${isMarketOpen ? styles.open : styles.closed}`}>
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
                        title: { text: 'Change in Open Interest', font: { color: '#333' } },
                      }}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
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
                        title: { text: 'Overall Open Interest', font: { color: '#333' } },
                      }}
                      config={plotConfig}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </CardContent>
                </Card>
              </>
            )}
        </div>
      </div>
    
    </RootLayout>
  );
}

export default OpenInterest;