import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="font-semibold text-lg mb-2">About REFUEL</h4>
          <p className="text-sm text-gray-300">REFUEL is a leading energy drink company focused on performance, taste, and quality. Our products are formulated to provide sustained energy and hydration while keeping calories in check.</p>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2">Customer Support</h4>
          <p className="text-sm text-gray-300">Need help? Our support team is available Mon-Fri, 9am-6pm.</p>
          <p className="mt-2 text-sm text-gray-300">Email: <a href="mailto:support@refuel.com" className="text-[#8dc53e]">support@refuel.com</a></p>
          <p className="text-sm text-gray-300">Phone: <a href="tel:+919562703957" className="text-[#8dc53e]">+91 95627 03957</a></p>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-2">Company Address</h4>
          <p className="text-sm text-gray-300">REFUEL Beverages Pvt Ltd</p>
          <p className="text-sm text-gray-300">123 Refuel Street</p>
          <p className="text-sm text-gray-300">Energy City, EC 560001</p>
          <p className="text-sm text-gray-300">India</p>
        </div>
      </div>

      <div className="bg-gray-800 text-gray-400 text-center py-3">
        © {new Date().getFullYear()} REFUEL. All rights reserved.
      </div>
    </footer>
  );
}
