import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import RootLayout from '../layout';

const LandingPage: React.FC = () => {
  return (
    <RootLayout>
    
      <Head>
        <title>MarketViz - Option Analysis Tool</title>
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">MarketViz</div>
          <ul className="flex space-x-6">
            {['Pricing', 'About', 'Learn'].map((link, index) => (
              <li key={index}>
                <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-6 py-16 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">Option Analysis Tool</h1>
            <p className="text-lg text-gray-600 mb-8">
              Elevate Your Market Insights with Cutting-Edge Visuals and Analytics.
            </p>
            <Link href="/open-interest">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </Link>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <Image
              src="/images/heading.png"
              alt="Market Visualization"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Option Chain</h2>
            <p className="text-gray-600">Free Option Chain with Real-time Open Interest Data</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Call vs Put</h2>
            <p className="text-gray-600">Coming soon.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">FII DII Data</h2>
            <p className="text-gray-600">Coming soon.</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} MarketViz. All rights reserved.
        </div>
      </footer>
    </div>
    </RootLayout>
  );
};

export default LandingPage;