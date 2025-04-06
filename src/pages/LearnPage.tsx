import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  generateResponse,
  ChatMessage,
  generateQuestion,
  checkAnswer
} from '@/services/aiService';
import { toast } from "sonner";

const LearnPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();
  
  useEffect(() => {
    if (!profile) {
      navigate('/profile');
    }
  }, [profile, navigate]);
  
  const [subject, setSubject] = useState<string>('All');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [subjectQueue, setSubjectQueue] = useState<string[]>([]);
  const [subjectIndex, setSubjectIndex] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  
  useEffect(() => {
    if (profile) {
      const subs = profile.preferredSubjects.length > 0 ? profile.preferredSubjects : ['Math', 'Science', 'English'];
      setSubjectQueue(subs);
      setSubject('All');
      setSubjectIndex(0);
      setQuestionCount(0);
    }
  }, [profile]);
  
  const getCurrentSubject = () => {
    if (subject !== 'All') return subject;
    return subjectQueue[subjectIndex % subjectQueue.length];
  };
  
  const handleSendMessage = async () => {
    if (!userMessage.trim() || isLoading) return;
    const newUserMessage: ChatMessage = { role: 'user', content: userMessage };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    try {
      const gradeLevel = profile?.gradeLevel || '5th Grade';
      const assistantResponse = await generateResponse(
        [...chatMessages, newUserMessage],
        getCurrentSubject(),
        gradeLevel
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Couldn't get a response");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateQuestion = async () => {
    if (!profile || isGeneratingQuestion) return;
    setIsGeneratingQuestion(true);
    setUserAnswer('');
    setFeedback(null);
    setIsAnswerCorrect(null);
    try {
      const { question, correctAnswer: answer } = await generateQuestion(
        getCurrentSubject(),
        profile.gradeLevel,
        previousQuestions
      );
      setCurrentQuestion(question);
      setCorrectAnswer(answer);
      setPreviousQuestions(prev => [...prev, question]);
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };
  
  const handleCheckAnswer = async () => {
    if (!userAnswer.trim() || !currentQuestion || !correctAnswer) return;
    setIsLoading(true);
    try {
      const result = await checkAnswer(
        currentQuestion,
        userAnswer,
        correctAnswer,
        getCurrentSubject(),
        profile?.gradeLevel || '5th Grade'
      );
      setFeedback(result.explanation);
      setIsAnswerCorrect(result.isCorrect);
    } catch (error) {
      console.error('Error checking answer:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedback(null);
    setIsAnswerCorrect(null);
    if (subject === 'All' && questionCount >= 5) {
      setQuestionCount(0);
      setSubjectIndex((prev) => (prev + 1) % subjectQueue.length);
    }
    handleGenerateQuestion();
  };
  
  useEffect(() => {
    if (profile) {
      handleGenerateQuestion();
    }
  }, [subjectQueue, subjectIndex]); // eslint-disable-line react-hooks/exhaustive-deps
  
  if (!profile) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-6">
        <div className="edu-container">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-edu-purple to-edu-teal flex items-center justify-center text-white font-bold">
                {profile.avatar}
              </div>
              <div>
                <h2 className="font-semibold">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.gradeLevel}</p>
              </div>
            </div>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Subjects</SelectItem>
                {subjectQueue.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="quiz" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="quiz">Quest Mode</TabsTrigger>
              <TabsTrigger value="chat">Ask Rune</TabsTrigger>
            </TabsList>
            <TabsContent value="quiz" className="border-none p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-md border p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{getCurrentSubject()} Challenge</h2>
                      <Button variant="outline" onClick={handleGenerateQuestion} disabled={isGeneratingQuestion}>
                        New Question
                      </Button>
                    </div>
                    {currentQuestion ? (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-lg">{currentQuestion}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4 animate-pulse">
                        <p className="text-gray-400">Generating question...</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your answer here..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        className="min-h-[100px]"
                        disabled={isLoading || !currentQuestion}
                      />
                      <div className="flex justify-end gap-2">
                        {isAnswerCorrect ? (
                          <Button
                            onClick={handleNextQuestion}
                            className="bg-edu-teal hover:bg-edu-teal/90"
                          >
                            Next Question
                          </Button>
                        ) : (
                          <Button
                            onClick={handleCheckAnswer}
                            disabled={isLoading || !userAnswer.trim() || !currentQuestion}
                            className="bg-edu-purple hover:bg-edu-purple/90"
                          >
                            Check Answer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="bg-white rounded-xl shadow-md border p-6 h-full">
                    <h2 className="text-xl font-semibold mb-4">Rune's Feedback</h2>
                    {feedback ? (
                      <div>
                        <div className={`p-4 rounded-lg mb-4 ${
                          isAnswerCorrect 
                            ? 'bg-edu-green/40 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          <p className="font-semibold mb-1">
                            {isAnswerCorrect ? 'Correct! 🎉' : 'Not quite right 🤔'}
                          </p>
                          <p className="text-sm">{feedback}</p>
                        </div>
                        {!isAnswerCorrect && (
                          <p className="text-sm text-gray-600 mb-4">
                            Try again or see the next question!
                          </p>
                        )}
                        {isAnswerCorrect && (
                          <Button
                            onClick={handleNextQuestion}
                            className="w-full bg-edu-teal hover:bg-edu-teal/90"
                          >
                            Next Question
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[200px] text-gray-400 text-center">
                        <p>Submit your answer to see feedback</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="chat" className="border-none p-0">
              <div className="bg-white rounded-xl shadow-md border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Ask Rune the Riddle Master</h2>
                  <p className="text-sm text-gray-500">
                    Get help with homework, explanations, or learning tips
                  </p>
                </div>
                <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                      <p>No messages yet. Ask your first question!</p>
                      <div className="mt-2 space-y-2">
                        <p className="text-sm">Try questions like:</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setUserMessage(`Can you explain how to ${getCurrentSubject() === 'Math' ? 'solve equations' : 
                              getCurrentSubject() === 'Science' ? 'understand photosynthesis' : 
                              'write a good essay'} in a fun way?`);
                          }}
                        >
                          How do I {getCurrentSubject() === 'Math' ? 'solve equations' : 
                            getCurrentSubject() === 'Science' ? 'understand photosynthesis' : 
                            'write a good essay'}?
                        </Button>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl p-3 ${msg.role === 'user' ? 'bg-edu-purple text-white' : 'bg-gray-100'}`}>
                          {msg.content}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl p-3">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask Rune anything..."
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading || !userMessage.trim()}
                      className="bg-edu-teal hover:bg-edu-teal/90"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LearnPage;
