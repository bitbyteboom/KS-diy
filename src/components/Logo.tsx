import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 bg-edu-purple rounded-full opacity-70 animate-float"></div>
        <div className="absolute inset-0 transform translate-x-1 -translate-y-1 bg-edu-teal rounded-full opacity-70"></div>
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          KS
        </span>
      </div>
      <div className="text-xl font-bold bg-gradient-to-r from-edu-purple to-edu-teal bg-clip-text text-transparent">
        KidScholar
      </div>
    </div>
  );
};

export default Logo;
