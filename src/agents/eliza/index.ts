import { createInterface } from 'readline';
import * as process from 'node:process';
import { Agent, AgentConfig, Memory, Response, Pattern } from './types';

interface Pattern {
    regex: RegExp;
    responses: string[];
    confidence: number;
}

export class Eliza implements Agent {
    private patterns: Pattern[];
    public config: AgentConfig;
    public memories: Memory[];

    constructor(config?: Partial<AgentConfig>) {
        this.config = {
            name: 'Eliza',
            description: 'A friendly therapeutic chatbot',
            personality: 'Empathetic and understanding',
            examples: [
                'User: I am feeling sad\nEliza: I\'m sorry to hear that. Would you like to talk about what\'s troubling you?',
                'User: Hello\nEliza: Hello! How are you feeling today?'
            ],
            ...config
        };

        this.memories = [];
        this.patterns = [
            {
                regex: /.*hello.*/i,
                responses: [
                    "Hello! How are you feeling today?",
                    "Hi there! What's on your mind?",
                    "Greetings! How can I help you today?"
                ],
                confidence: 0.8
            },
            {
                regex: /.*i am (.*)/i,
                responses: [
                    "Why do you say you are %1?",
                    "How long have you been %1?",
                    "Do you believe it is normal to be %1?"
                ],
                confidence: 0.9
            },
            {
                regex: /.*i feel (.*)/i,
                responses: [
                    "Tell me more about feeling %1.",
                    "Why do you think you feel %1?",
                    "How long have you felt %1?"
                ],
                confidence: 0.9
            },
            {
                regex: /.*(sad|depressed|unhappy|angry).*/i,
                responses: [
                    "I'm sorry to hear that. Would you like to talk about what's troubling you?",
                    "What do you think is causing these feelings?",
                    "How long have you been feeling this way?"
                ],
                confidence: 0.95
            },
            {
                regex: /.*why.*/i,
                responses: [
                    "Why do you think?",
                    "What do you think?",
                    "What comes to your mind when you ask that?"
                ],
                confidence: 0.7
            },
            {
                regex: /.*thank.*you.*/i,
                responses: [
                    "You're welcome!",
                    "It's my pleasure to help.",
                    "I'm glad I could assist you."
                ],
                confidence: 0.8
            },
            {
                regex: /.*/,
                responses: [
                    "Please tell me more.",
                    "Let's explore that further.",
                    "How does that make you feel?",
                    "What do you mean by that?",
                    "Can you elaborate on that?"
                ],
                confidence: 0.5
            }
        ];
    }

    public async respond(input: string): Promise<Response> {
        for (const pattern of this.patterns) {
            const match = input.match(pattern.regex);
            if (match) {
                let response = pattern.responses[Math.floor(Math.random() * pattern.responses.length)];
                // Replace %1, %2, etc. with captured groups
                for (let i = 1; i < match.length; i++) {
                    response = response.replace(`%${i}`, match[i] || '');
                }

                // Create a memory of this interaction
                const memory: Memory = {
                    type: 'short_term',
                    content: `User said: ${input}\nEliza responded: ${response}`,
                    timestamp: Date.now()
                };
                this.remember(memory);

                return {
                    text: response,
                    confidence: pattern.confidence,
                    memories: [memory]
                };
            }
        }

        const defaultResponse = "Please tell me more.";
        const memory: Memory = {
            type: 'short_term',
            content: `User said: ${input}\nEliza responded: ${defaultResponse}`,
            timestamp: Date.now()
        };
        this.remember(memory);

        return {
            text: defaultResponse,
            confidence: 0.5,
            memories: [memory]
        };
    }

    public remember(memory: Memory): void {
        this.memories.push(memory);
        // Keep only last 10 short-term memories
        const shortTermMemories = this.memories.filter(m => m.type === 'short_term');
        if (shortTermMemories.length > 10) {
            const oldestShortTermMemory = shortTermMemories[0];
            const index = this.memories.indexOf(oldestShortTermMemory);
            if (index > -1) {
                this.memories.splice(index, 1);
            }
        }
    }

    public forget(type: 'short_term' | 'long_term'): void {
        this.memories = this.memories.filter(m => m.type !== type);
    }

    public async startCLI(): Promise<void> {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log(`${this.config.name}: Hello! I'm ${this.config.name}, ${this.config.description}. How are you feeling today? (Type 'quit' to exit)`);

        while (true) {
            const input = await new Promise<string>(resolve => rl.question('You: ', resolve));

            if (input.toLowerCase() === 'quit') {
                console.log(`${this.config.name}: Goodbye! Take care!`);
                rl.close();
                break;
            }

            const response = await this.respond(input);
            console.log(`${this.config.name}: ${response.text}`);
        }
    }
}

// Create and start Eliza if this file is run directly
if (import.meta.url === new URL(import.meta.url).href) {
    const eliza = new Eliza();
    eliza.startCLI();
}
