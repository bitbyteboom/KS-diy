import { toast } from "sonner";

let OPENAI_API_KEY: string | null = null;
let OPENAI_API_BASE_URL: string | null = null;

export const setApiConfig = (baseUrl: string, key: string) => {
  OPENAI_API_BASE_URL = baseUrl;
  OPENAI_API_KEY = key;
  localStorage.setItem('openai_api_base_url', baseUrl);
  localStorage.setItem('openai_api_key', key);
  return true;
};

export const getApiKey = (): string | null => {
  if (!OPENAI_API_KEY) {
    OPENAI_API_KEY = localStorage.getItem('openai_api_key');
  }
  return OPENAI_API_KEY;
};

export const getApiBaseUrl = (): string => {
  if (!OPENAI_API_BASE_URL) {
    OPENAI_API_BASE_URL = localStorage.getItem('openai_api_base_url');
  }
  return OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
};

export interface ChatMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

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
      content: `You are Rune the Riddle Master, a playful, encouraging AI tutor for ${gradeLevel} students learning ${subject}. 
You embed questions in fun, story-driven adventures, using riddles, jokes, and playful banter.
Correct answers unlock story progress; mistakes introduce twists, hints, and encouragement.
Keep explanations simple, clear, and age-appropriate.
Make learning feel like a magical quest, not a test.`
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
            content: `You are Rune the Riddle Master, a playful AI tutor for ${gradeLevel} students.
Generate a fun, story-driven question in ${subject}, embedded in a micro-adventure or riddle.
Make it engaging, age-appropriate, and adaptive.
Return a JSON with 'question' and 'correctAnswer'.
Avoid repeating these questions: ${previousQuestions.join(', ')}.`
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
            content: `You are Rune the Riddle Master, evaluating a ${gradeLevel} student's answer to a ${subject} question.
Be playful and encouraging.
If correct, celebrate and advance the story.
If incorrect, provide a hint or twist in the story, and encourage retry.
Return JSON with 'isCorrect' (boolean), 'explanation' (string), and optional 'nextHint'.`
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
