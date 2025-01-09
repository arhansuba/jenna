export interface AgentConfig {
    name: string;
    description: string;
    personality?: string;
    examples?: string[];
}

export interface Memory {
    type: 'short_term' | 'long_term';
    content: string;
    timestamp: number;
}

export interface Response {
    text: string;
    confidence: number;
    memories?: Memory[];
}

export interface Agent {
    config: AgentConfig;
    memories: Memory[];
    respond(input: string): Promise<Response>;
    remember(memory: Memory): void;
    forget(type: 'short_term' | 'long_term'): void;
}