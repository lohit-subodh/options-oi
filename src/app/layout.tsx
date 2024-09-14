// src/app/layout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import './globals.css';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
   /* <html lang="en">
      <body className="inter">
        {children}
      </body>
    </html>
    */
    <html lang="en">
      
      <body className="inter">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;