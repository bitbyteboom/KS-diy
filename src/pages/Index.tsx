import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProfile } from '@/context/ProfileContext';
import { BookOpen, Book, Calendar, Search } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  const features = [
    {
      icon: <BookOpen className="h-10 w-10 text-edu-purple" />,
      title: 'Personalized Learning',
      description: 'AI-powered education that adapts to your child\'s unique learning style and pace.'
    },
    {
      icon: <Book className="h-10 w-10 text-edu-teal" />,
      title: 'All K-12 Subjects',
      description: 'From basic math to advanced sciences, history, language arts, and more.'
    },
    {
      icon: <Search className="h-10 w-10 text-edu-purple" />,
      title: 'Smart Question Generator',
      description: 'Creates questions tailored to challenge students at just the right level.'
    },
    {
      icon: <Calendar className="h-10 w-10 text-edu-teal" />,
      title: 'Progress Tracking',
      description: 'Monitor learning achievements and identify areas for improvement.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-edu-purple/10 to-edu-teal/10 py-16">
          <div className="edu-container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-edu-purple to-edu-teal bg-clip-text text-transparent">
                    Your Child's Personal AI Learning Assistant
                  </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-700 mb-8">
                  KidScholar uses artificial intelligence to create a personalized learning 
                  experience for K-12 students. Our AI adapts to your child's needs, 
                  generates customized questions, and provides helpful feedback.
                </p>
                <div className="flex flex-wrap gap-4">
                  {profile ? (
                    <Button
                      size="lg"
                      className="bg-edu-purple hover:bg-edu-purple/90 text-lg px-8"
                      onClick={() => navigate('/learn')}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="bg-edu-purple hover:bg-edu-purple/90 text-lg px-8"
                      onClick={() => navigate('/profile')}
                    >
                      Get Started
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8"
                    onClick={() => navigate('/about')}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-edu-purple/20 rounded-full blur-3xl"></div>
                <img 
                  src="https://source.unsplash.com/iEEBWgY_6lA" 
                  alt="Student learning" 
                  className="rounded-2xl shadow-lg w-full object-cover max-h-[500px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="edu-container">
            <h2 className="text-3xl font-bold text-center mb-12">
              How KidScholar Helps Your Child Learn
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-16">
          <div className="edu-container text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Learning?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Start your child's journey with KidScholar today and watch them develop a 
              love for learning with personalized AI education.
            </p>
            <Button 
              size="lg" 
              className="bg-edu-teal hover:bg-edu-teal/90 text-lg px-10"
              onClick={() => navigate(profile ? '/learn' : '/profile')}
            >
              {profile ? 'Start Learning' : 'Create Profile'}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
