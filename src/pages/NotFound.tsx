import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-edu-purple">404</h1>
          <p className="text-2xl mt-4 mb-8">Oops! We couldn't find that page</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-edu-purple hover:bg-edu-purple/90"
          >
            Go Back Home
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
