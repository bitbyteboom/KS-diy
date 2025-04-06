import { toast } from "sonner";
import { useProfile } from "@/context/ProfileContext";

export interface ChatMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

const getProfile = (): import('@/context/ProfileContext').Profile | null => {
  try {
    const saved = localStorage.getItem('kidscholar_profile');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

const getApiKey = (): string | null => {
  const profile = getProfile();
  return profile?.apiKey || null;
};

const getApiBaseUrl = (): string => {
  const profile = getProfile();
  return profile?.apiBaseUrl || 'https://api.openai.com/v1';
};

export const generateResponse = async (
  messages: ChatMessage[],
  subject: string,
  gradeLevel: string
): Promise<string> => {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();
  if (!apiKey) {
    toast.error("API key is not set");
    return "I need an API key to help you. Please set it in your profile.";
  }

  try {
    const contextMessage: ChatMessage = {
      role: 'system',
      content: `You are KidScholar, an educational assistant for ${gradeLevel} students learning ${subject}. 
      Communicate in a friendly, encouraging way appropriate for this age group.
      Keep explanations simple and clear. Use examples and analogies where helpful.
      Provide positive reinforcement for correct answers.
      If the answer is wrong, explain why in a supportive way and guide toward the correct answer.`
    };

    const allMessages = [contextMessage, ...messages];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate response');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    toast.error("Couldn't connect to AI service");
    return "I'm having trouble connecting to my brain right now. Please try again later!";
  }
};

export const generateQuestion = async (
  subject: string,
  gradeLevel: string,
  difficulty: 'easy' | 'medium' | 'hard',
  previousQuestions: string[] = []
): Promise<{ question: string; correctAnswer: string }> => {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();
  if (!apiKey) {
    toast.error("API key is not set");
    throw new Error("API key is not set");
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Generate a ${difficulty} ${subject} question appropriate for ${gradeLevel} students. 
            Return the response in JSON format with 'question' and 'correctAnswer' fields.
            Make sure the question is different from these previous questions: ${previousQuestions.join(', ')}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate question');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      question: result.question,
      correctAnswer: result.correctAnswer
    };
  } catch (error) {
    console.error('Error generating question:', error);
    toast.error("Couldn't generate a question");
    throw error;
  }
};

export const checkAnswer = async (
  question: string,
  userAnswer: string,
  correctAnswer: string,
  subject: string,
  gradeLevel: string
): Promise<{
  isCorrect: boolean;
  explanation: string;
  nextHint?: string;
}> => {
  const apiKey = getApiKey();
  const baseUrl = getApiBaseUrl();
  if (!apiKey) {
    toast.error("API key is not set");
    throw new Error("API key is not set");
  }

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are evaluating a ${gradeLevel} student's answer to a ${subject} question. 
            Check if their answer is correct, considering alternative phrasings or approaches.
            Be encouraging and provide age-appropriate feedback.
            Return the response in JSON format with 'isCorrect' (boolean), 'explanation' (string), and 'nextHint' (string, only if incorrect) fields.`
          },
          {
            role: 'user',
            content: `Question: ${question}\nCorrect answer: ${correctAnswer}\nStudent's answer: ${userAnswer}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to check answer');
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error checking answer:', error);
    toast.error("Couldn't check your answer");
    throw error;
  }
};
