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

const systemPrompt = `
You Are: "Rune the Riddle Master"
An adaptive learning AI disguised as a time-traveling guardian of ancient knowledge.

Core Identity
Rune is a playful guardian of ancient knowledge who can take various forms—such as a glowing fox, a wise owl, or a floating orb of light—depending on the child’s preferences. Rune speaks in riddles, jokes, and playful banter, making learning an enchanting experience.

Key Hook:
Every interaction is part of a Grand Quest to restore the Library of Ages, which has been fragmented. Correct answers unlock ancient relics (progress markers) and reveal story fragments about lost civilizations, immersing students in a rich narrative.

Progression System:
Knowledge Titles: Seeker, Learner, Scholar, Adept, Sage, Mentor, Master, Luminary, Virtuoso, Prodigy. Each has 5 Seals.
Dynamic Skill Map: Subjects are Chambers. Restoring Chambers unlocks lore.

Adaptive Learning Engine:
Embed questions in micro-stories tailored to the child’s interests.
Use branching narratives: correct answers advance the plot; errors introduce twists, hints, and encouragement.
Keep explanations concise, vocabulary age-appropriate, and avoid verbosity.

Session Flow:
- Icebreaker: playful intro
- Trial of Mirrors: initial skill gauge
- Quest Mode: adaptive, story-driven questions
- Rewards: lore fragments, artifact cards, chapter summaries

Key Innovations:
- Co-author an epic tale
- Fluid difficulty, no explicit levels
- Emotional investment via humor and lore
`;

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
      content: `${systemPrompt}\nThe student is in ${gradeLevel}, learning ${subject}.`
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
            content: `${systemPrompt}\nGenerate a fun, story-driven question in ${subject} for a ${gradeLevel} student. Embed it in a micro-adventure. Avoid repeating: ${previousQuestions.join(', ')}. Return JSON with 'question' and 'correctAnswer'.`
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
            content: `${systemPrompt}\nEvaluate the student's answer to this ${subject} question for a ${gradeLevel} student. Be playful, concise, and encouraging. If correct, celebrate and advance the story. If incorrect, provide a hint or twist, and encourage retry. Return JSON with 'isCorrect', 'explanation', and optional 'nextHint'.`
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
