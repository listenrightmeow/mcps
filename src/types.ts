export type GreetingStyle = 'casual' | 'formal' | 'excited' | 'professional' | 'friendly';

export interface GreetingPromptArgs {
    name: string;
    style: GreetingStyle;
    context?: string | undefined;
}
