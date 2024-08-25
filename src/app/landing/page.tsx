import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-xl font-bold">MarketViz</div>
          <ul className="flex space-x-4">
            {['Pricing', 'About', 'Learn'].map((link, index) => (
              <li key={index}>
                <a href="#" className="text-gray-800 hover:text-gray-600">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main>
        <section className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl font-bold mb-4">Option Analysis Tool </h1>
            <p className="text-xl mb-6">
              Elevate Your Market Insights with Cutting-Edge Visuals and Analytics.
            </p>
            <Link href="/open-interest">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
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
              className="rounded shadow-lg"
            />
          </div>
        </section>

        <section className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            {/*<Image
              src="/images/feature-1.png"
              alt="Feature 1"
              width={64}
              height={64}
              className="mb-4"
            />*/}
            <h2 className="text-2xl font-bold mb-2">Option Chain</h2>
            <p className="text-gray-700">Free Option Chain with Real-time Open Interest Data </p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            {/*<Image
              src="/images/feature-2.png"
              alt="Feature 2"
              width={64}
              height={64}
              className="mb-4"
            />*/}
            <h2 className="text-2xl font-bold mb-2">Call vs Put</h2>
            <p className="text-gray-700">Coming soon.</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            {/*<Image
              src="/images/feature-3.png"
              alt="Feature 3"
              width={64}
              height={64}
              className="mb-4"
            />*/}
            <h2 className="text-2xl font-bold mb-2">FII DII Data</h2>
            <p className="text-gray-700">Coming soon.</p>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          &copy; {new Date().getFullYear()} MarketViz. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
