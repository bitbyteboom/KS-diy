import React from 'react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Header: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-gray-100 py-4">
      <div className="edu-container flex justify-between items-center">
        <Logo />
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/profile')}
            className="hidden sm:flex gap-2"
          >
            <User size={18} /> My Profile
          </Button>
          <Button
            variant="ghost" 
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          <Button 
            className="bg-edu-purple hover:bg-edu-purple/90"
            onClick={() => navigate('/learn')}
          >
            Start Learning
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
