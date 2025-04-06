import React from 'react';
import Logo from './Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-8 mt-12">
      <div className="edu-container">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo />
            <p className="text-gray-500 mt-2 text-sm">
              Personalized AI education for K-12 students
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <h4 className="font-medium mb-2">About</h4>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>How it works</li>
                <li>Our approach</li>
                <li>For parents</li>
                <li>For teachers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Resources</h4>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>Help center</li>
                <li>Privacy policy</li>
                <li>Terms of use</li>
                <li>Contact us</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} KidScholar. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
