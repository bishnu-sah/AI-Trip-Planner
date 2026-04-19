import { IAIAdapter } from '../../domain/interfaces/adapters';
import { ChatMessage } from '../../domain/models';

export class MockAIAdapter implements IAIAdapter {
  async complete(prompt: string): Promise<string> {
    console.warn('[MockAIAdapter] ⚠️  MOCK adapter called - returning placeholder data');
    console.warn('[MockAIAdapter] To use real AI, set AI_ADAPTER=real and GEMINI_API_KEY in .env');

    // Return a mock JSON response that looks like real data but is clearly placeholder
    return JSON.stringify({
      title: "Mock Trip - Set AI_ADAPTER=real for real AI data",
      budgetEstimate: {
        total: "₹15,000",
        currency: "INR",
        breakdown: [
          { category: "Travel", amount: "₹5,000", description: "Estimated train/flight cost (Mock)" },
          { category: "Stay", amount: "₹6,000", description: "Estimated budget hotel cost (Mock)" },
          { category: "Food & Activities", amount: "₹4,000", description: "Estimated daily expenses (Mock)" }
        ]
      },
      days: Array.from({ length: 3 }).map((_, idx) => ({
        day: idx + 1,
        date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
        places: ["Placeholder Place 1", "Placeholder Place 2"],
        activities: ["Placeholder Activity 1", "Placeholder Activity 2"],
        notes: "This is MOCK data. To get real AI-generated itineraries, please set AI_ADAPTER=real and provide a valid GEMINI_API_KEY in your .env file."
      }))
    });
  }

  async chat(messages: ChatMessage[]): Promise<ChatMessage> {
    const last = messages[messages.length - 1];
    return { role: 'assistant', content: `Echo: ${last.content}` };
  }
}

