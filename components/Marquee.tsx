import React from 'react';

interface MarqueeProps {
  text: string;
}

const Marquee: React.FC<MarqueeProps> = ({ text }) => {
  return (
    <div 
      className="sticky top-20 text-white py-3 overflow-hidden shadow-md z-40 border-b border-blue-900/20 flex select-none gap-0"
      style={{
        // Khmer flag gradient: Blue top (25%), Red middle (50%), Blue bottom (25%)
        // Colors: Blue #0f299c, Red #ce2c2d
        background: "linear-gradient(180deg, #0f299c 25%, #ce2c2d 25%, #ce2c2d 75%, #0f299c 75%)"
      }}
    >
      {/* Three copies of the text for seamless infinite scrolling */}
      <div className="animate-marquee hover-pause whitespace-nowrap shrink-0 flex items-center">
        <span className="mx-4 pt-[1px] font-sans font-bold tracking-wide text-sm md:text-base drop-shadow-md">{text}</span>
      </div>
      <div className="animate-marquee hover-pause whitespace-nowrap shrink-0 flex items-center">
        <span className="mx-4 pt-[1px] font-sans font-bold tracking-wide text-sm md:text-base drop-shadow-md">{text}</span>
      </div>
      <div className="animate-marquee hover-pause whitespace-nowrap shrink-0 flex items-center">
        <span className="mx-4 pt-[1px] font-sans font-bold tracking-wide text-sm md:text-base drop-shadow-md">{text}</span>
      </div>
    </div>
  );
};

export default Marquee;