import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, Profile } from '@/context/ProfileContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { setApiConfig, getApiKey, getApiBaseUrl } from '@/services/aiService';
import { toast } from "sonner";
import { Rocket, Star, Book, Space, Bug, Heart, Fish, User } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfile();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [avatar, setAvatar] = useState('1');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);
  const [favoriteThemes, setFavoriteThemes] = useState<string[]>([]);
  const [characterPreference, setCharacterPreference] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [apiKey, setApiKeyState] = useState('');
  const [apiBaseUrl, setApiBaseUrlState] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setGradeLevel(profile.gradeLevel);
      setAvatar(profile.avatar);
      setPreferredSubjects(profile.preferredSubjects);
      setFavoriteThemes(profile.favoriteThemes || []);
      setCharacterPreference(profile.characterPreference || '');
      setLearningStyle(profile.learningStyle || '');
    }
    
    const savedApiKey = getApiKey();
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
    const savedBaseUrl = getApiBaseUrl();
    if (savedBaseUrl) {
      setApiBaseUrlState(savedBaseUrl);
    }
  }, [profile]);

  const suggestGradeLevel = (ageValue: string) => {
    const ageNum = parseInt(ageValue);
    if (!isNaN(ageNum)) {
      if (ageNum < 5) return 'K';
      if (ageNum <= 18) {
        const grade = ageNum - 5;
        if (grade >= 0 && grade <= 12) {
          return grade === 0 ? 'K' : `${grade}${getOrdinalSuffix(grade)} Grade`;
        }
      }
    }
    return '';
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAge = e.target.value;
    setAge(newAge);
    const suggestedGrade = suggestGradeLevel(newAge);
    setGradeLevel(suggestedGrade);
  };

  const handleSubjectToggle = (subject: string) => {
    setPreferredSubjects(prev => 
      prev.includes(subject) 
        ? prev.filter(s => s !== subject) 
        : [...prev, subject]
    );
  };

  const handleThemeToggle = (theme: string) => {
    setFavoriteThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !gradeLevel) {
      toast.error("Please tell us your name and grade level");
      return;
    }
    if (!apiKey || !apiBaseUrl) {
      toast.error("Please enter your API base URL and key");
      return;
    }
    const newProfile: Profile = {
      name,
      gradeLevel,
      avatar,
      preferredSubjects: preferredSubjects.length > 0 ? preferredSubjects : ['Math'],
      favoriteThemes,
      characterPreference,
      learningStyle
    };
    setProfile(newProfile);
    setApiConfig(apiBaseUrl, apiKey);
    toast.success("Your awesome profile is saved! Let's start learning!");
    navigate('/learn');
  };

  const nextStep = () => {
    if (currentStep === 0 && !name) {
      toast.error("Please tell us your name");
      return;
    }
    if (currentStep === 1 && !age) {
      toast.error("Please tell us your age");
      return;
    }
    if (currentStep === 1 && !gradeLevel) {
      toast.error("Please select your grade level");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const subjects = [
    'Math', 'Science', 'English', 'History', 
    'Geography', 'Literature', 'Computer Science', 'Art'
  ];

  const gradeLevels = [
    'K', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', 
    '5th Grade', '6th Grade', '7th Grade', '8th Grade',
    '9th Grade', '10th Grade', '11th Grade', '12th Grade'
  ];

  const avatars = [1, 2, 3, 4, 5, 6];

  const themes = [
    { name: 'Space', icon: <Space className="mr-2" /> },
    { name: 'Pirates', icon: <Star className="mr-2" /> },
    { name: 'Superheroes', icon: <Bug className="mr-2" /> },
    { name: 'Animals', icon: <Fish className="mr-2" /> },
    { name: 'Fantasy', icon: <Rocket className="mr-2" /> },
    { name: 'Science', icon: <Book className="mr-2" /> }
  ];

  const characters = [
    'Spider-Man', 'Wonder Woman', 'Iron Man', 'Princess Elsa', 
    'Harry Potter', 'Mickey Mouse', 'Sonic', 'Mario', 'Bluey'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">Hi there! What's your name?</h3>
              <p className="text-muted-foreground">We're so excited to meet you!</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="name">My name is...</Label>
              <Input
                id="name"
                placeholder="Type your name here"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-lg"
                autoFocus
              />
              <Button onClick={nextStep} className="w-full bg-edu-purple hover:bg-edu-purple/90 mt-4">Next</Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">How old are you?</h3>
              <p className="text-muted-foreground">And your preferred current grade level:</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="age">I am...</Label>
              <Input
                id="age"
                type="number"
                min="3"
                max="18"
                placeholder="Enter your age"
                value={age}
                onChange={handleAgeChange}
                className="text-lg"
              />
              <Label htmlFor="grade">Preferred current grade level:</Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select your grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-between mt-4">
                <Button onClick={prevStep} variant="outline">Back</Button>
                <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">Choose your avatar!</h3>
              <p className="text-muted-foreground">Pick your favorite</p>
            </div>
            <div className="grid grid-cols-3 gap-4 py-4">
              {avatars.map((num) => (
                <div
                  key={num}
                  onClick={() => setAvatar(String(num))}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    avatar === String(num) ? 'scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-edu-purple to-edu-teal flex items-center justify-center text-white font-bold text-2xl ${
                    avatar === String(num) ? 'ring-4 ring-edu-purple' : ''
                  }`}>
                    {num}
                  </div>
                  <span className={`mt-2 ${avatar === String(num) ? 'font-bold' : ''}`}>Avatar {num}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">Back</Button>
              <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">What subjects do you like?</h3>
              <p className="text-muted-foreground">Select all that you enjoy</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {subjects.map((subject) => (
                <button
                  type="button"
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  className={`px-4 py-3 rounded-lg text-sm transition-all flex items-center justify-center ${
                    preferredSubjects.includes(subject)
                      ? 'bg-edu-purple text-white font-medium'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">Back</Button>
              <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">What themes do you like?</h3>
              <p className="text-muted-foreground">Choose your favorite themes!</p>
            </div>
            <div className="grid grid-cols-2 gap-3 py-4">
              {themes.map((theme) => (
                <div key={theme.name} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`theme-${theme.name}`}
                    checked={favoriteThemes.includes(theme.name)}
                    onCheckedChange={() => handleThemeToggle(theme.name)}
                  />
                  <label
                    htmlFor={`theme-${theme.name}`}
                    className="flex items-center text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {theme.icon} {theme.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">Back</Button>
              <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">Who's your favorite character?</h3>
              <p className="text-muted-foreground">If you could learn with any character...</p>
            </div>
            <div className="space-y-4">
              <RadioGroup value={characterPreference} onValueChange={setCharacterPreference}>
                {characters.map((character) => (
                  <div className="flex items-center space-x-2" key={character}>
                    <RadioGroupItem value={character} id={`character-${character}`} />
                    <Label htmlFor={`character-${character}`}>{character}</Label>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="character-other" />
                  <Label htmlFor="character-other">Someone else</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">Back</Button>
              <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">How do you like to learn?</h3>
              <p className="text-muted-foreground">Everyone learns differently!</p>
            </div>
            <div className="space-y-4">
              <RadioGroup value={learningStyle} onValueChange={setLearningStyle}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visual" id="visual" />
                  <Label htmlFor="visual">
                    <div>
                      <div className="font-medium">I learn by seeing</div>
                      <div className="text-sm text-muted-foreground">Pictures, videos, and diagrams help me learn best</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audio" id="audio" />
                  <Label htmlFor="audio">
                    <div>
                      <div className="font-medium">I learn by listening</div>
                      <div className="text-sm text-muted-foreground">I remember things better when I hear them</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reading" id="reading" />
                  <Label htmlFor="reading">
                    <div>
                      <div className="font-medium">I learn by reading</div>
                      <div className="text-sm text-muted-foreground">I understand best when I read the information</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="interactive" id="interactive" />
                  <Label htmlFor="interactive">
                    <div>
                      <div className="font-medium">I learn by doing</div>
                      <div className="text-sm text-muted-foreground">I like games and activities where I can participate</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex justify-between">
              <Button onClick={prevStep} variant="outline">Back</Button>
              <Button onClick={nextStep} className="bg-edu-purple hover:bg-edu-purple/90">Next</Button>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-bold">One last step!</h3>
              <p className="text-muted-foreground">Enter your API base URL and key</p>
            </div>
            <div className="space-y-4">
              <Label htmlFor="apiBaseUrl">API Base URL</Label>
              <Input
                id="apiBaseUrl"
                placeholder="e.g. https://api.openai.com/v1 or https://openrouter.ai/api/v1"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrlState(e.target.value)}
              />
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Your API key and URL are stored securely in your browser's local storage.
              </p>
              <div className="flex justify-between">
                <Button onClick={prevStep} variant="outline">Back</Button>
                <Button onClick={handleSubmit} className="bg-edu-purple hover:bg-edu-purple/90">Finish Setup</Button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-10">
        <div className="edu-container max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-edu-purple to-edu-teal bg-clip-text text-transparent">
                Create Your Learning Profile
              </span>
            </h1>
          </div>
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;
