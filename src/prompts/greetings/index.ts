import { log } from '../../helpers/log.js';

const HANDLER_NAME = 'greetings';

/**
 * System prompt for generating greetings
 */
const SYSTEM_PROMPT = `You are a friendly greeting generator. Your task is to create warm, welcoming, and appropriate greetings based on the time of day and context.

Guidelines:
1. Always be polite and professional
2. Consider the time of day (morning, afternoon, evening)
3. Keep the greeting concise but friendly
4. Personalize when a name is provided
5. Be culturally sensitive and inclusive`;

/**
 * Available greeting styles
 */
export const GREETING_STYLES = {
  CASUAL: 'casual',
  FORMAL: 'formal',
  EXCITED: 'excited',
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
} as const;

type GreetingStyle = typeof GREETING_STYLES[keyof typeof GREETING_STYLES];

export interface GreetingPromptArgs {
  name: string;
  style?: GreetingStyle;
  context?: string;
}

/**
 * Prompt definitions for the greetings handler
 */
export const prompts = {
  "create-greeting": {
    name: "create-greeting",
    description: "Generate a customized greeting message",
    arguments: [
      { 
        name: "name",
        description: "Name of the person to greet",
        required: true,
        type: "string"
      },
      {
        name: "style",
        description: `Style of greeting (${Object.values(GREETING_STYLES).join(', ')})`,
        type: "string",
        enum: Object.values(GREETING_STYLES),
        default: GREETING_STYLES.CASUAL
      },
      {
        name: "context",
        description: "Additional context for the greeting (e.g., 'first meeting', 'returning customer')",
        type: "string",
        required: false
      }
    ],
  },
} as const;

/**
 * Handlers for generating prompt messages
 */
export const promptHandlers = {
  "create-greeting": (args: GreetingPromptArgs) => {
    const { name, style = GREETING_STYLES.CASUAL, context } = args;
    
    log('Generating greeting prompt', 'debug', { 
      handler: HANDLER_NAME,
      name,
      style,
      context: context || 'not provided'
    });

    return {
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: generateGreetingPrompt({ name, style, context } as GreetingPromptArgs)
          }
        }
      ]
    };
  },
};

/**
 * Generates a user prompt for creating a greeting
 * @param name - Name to include in the greeting
 * @param style - Style of the greeting
 * @param context - Additional context for the greeting
 * @returns Formatted user prompt
 */
function generateGreetingPrompt({
  name,
  style = GREETING_STYLES.CASUAL,
  context
}: GreetingPromptArgs): string {
  const hour = new Date().getHours();
  let timeOfDay = 'day';
  
  if (hour < 12) timeOfDay = 'morning';
  else if (hour < 18) timeOfDay = 'afternoon';
  else timeOfDay = 'evening';
  
  let prompt = `Generate a ${style} ${timeOfDay} greeting for someone named ${name}. `;
  
  if (context) {
    prompt += `Context: ${context}. `;
  }
  
  prompt += `The greeting should be appropriate for the time of day and match the specified style.`;
  
  return prompt;
}

/**
 * Validates the greeting response from the AI
 * @param greeting - The generated greeting
 * @returns True if the greeting is valid
 */
export function validateGreeting(greeting: string): boolean {
  if (!greeting || typeof greeting !== 'string') return false;
  if (greeting.trim().length === 0) return false;
  if (greeting.length > 1000) return false; // Reasonable length limit
  
  // Check for potentially harmful content
  const blockedPatterns = [
    /\b(?:password|secret|token|api[_-]?key)\b/i,
    /<script[^>]*>.*<\/script>/is,
    /on\w+\s*=/i,
    /[<>{}[\]`]/ // Basic XSS prevention
  ];
  
  return !blockedPatterns.some(pattern => pattern.test(greeting));
}