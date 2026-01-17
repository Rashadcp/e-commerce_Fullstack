import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background Video */}
      <video
        src="video4.mp4"
        autoPlay
        loop
        muted
        className="w-full h-full object-cover"
      />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg- bg-opacity-60 flex flex-col items-center justify-center text-center px-6">
        
  <h1 className="text-white text-5xl md:text-7xl font-bold font-[Russo+One] tracking-tight drop-shadow-[0_0_10px_#00b2fe]">
  Welcome to <span className="text-[#fe9d00]">REFUEL</span> Energy Drinks
</h1>







        <h5 className="text-[#b6ffb3] font-semibold text-2xl md:text-4xl drop-shadow-md mb-3">
          NO LIMITS. JUST FUEL.
        </h5>

        {/* <h6 className="text-gray-200 font-medium text-lg md:text-xl max-w-4xl leading-relaxed drop-shadow-md">
          From clean energy and laser focus to elite hydration and fast recovery,
          <br /> REFUEL is built for every part of your grind. No sugar. No crash.
          <br /> Just formulas that help you stay sharp, go longer, and come back
          stronger — no matter what’s in your way.
        </h6> */}

        {/* Navigation Button */}
        <div className="mt-8">
          <Link
            to="/products"
            className="bg-[#8dc53e] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#76b431] transition transform hover:scale-105 shadow-md"
          >
            View Products
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
