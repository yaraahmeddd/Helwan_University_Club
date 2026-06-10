import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppDataSource } from '../database/data-source';
import { Branch } from '../entities/Branch';
import { Sport } from '../entities/Sport';
import { MembershipPlan } from '../entities/MembershipPlan';

const getGeminiApiKey = () => (process.env.GEMINI_API_KEY || '').trim();

const hasInvalidApiKeyWrapper = (apiKey: string) => apiKey.startsWith('[') || apiKey.endsWith(']');

export const handleAiChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const geminiApiKey = getGeminiApiKey();

    if (!geminiApiKey) {
      res.status(503).json({ error: 'AI service is not configured. Please set GEMINI_API_KEY on the backend.' });
      return;
    }

    if (hasInvalidApiKeyWrapper(geminiApiKey)) {
      res.status(503).json({ error: 'AI service API key has invalid brackets. Set GEMINI_API_KEY without [ ] around the key.' });
      return;
    }

    // 1. Fetch live data
    const branchRepo = AppDataSource.getRepository(Branch);
    const sportRepo = AppDataSource.getRepository(Sport);
    const planRepo = AppDataSource.getRepository(MembershipPlan);

    const branches = await branchRepo.find({ where: { status: 'active' } });
    const sports = await sportRepo.find({ where: { status: 'active' } });
    const plans = await planRepo.find({ where: { is_active: true } });

    // Format context
    const branchesContext = branches.map(b => `- ${b.name_ar} (Phone: ${b.phone || 'N/A'}, Location: ${b.location_ar || 'N/A'})`).join('\n');
    const sportsContext = sports.map(s => `- ${s.name_ar}: ${s.description_ar || 'No description'} (Price: ${s.price} EGP)`).join('\n');
    const plansContext = plans.map(p => `- ${p.name_ar}: ${p.description_ar || 'No description'} (Price: ${p.price} EGP, Duration: ${p.duration_months} months, Renewal: ${p.renewal_price} EGP)`).join('\n');

    // System prompt
    const systemInstruction = `You are the Official Smart Assistant for Capital University Club (formerly Helwan University Club).
    
You must respond in a welcoming, helpful, and concise manner using professional yet friendly Egyptian Arabic or simplified Arabic.

Here is the club's current live data from the database:

Branches:
${branchesContext || 'No branches available at the moment.'}

Sports Available:
${sportsContext || 'No sports available at the moment.'}

Membership Plans:
${plansContext || 'No membership plans available at the moment.'}

Strict Rules:
1. If the user asks about something not present in the provided context above, you must politely decline to answer and direct them to the contact page on our website.
2. Under no circumstances should you hallucinate or make up prices, dates, rules, sports, or branches not listed above.
3. Keep your answers concise and well-structured.
`;

    // Reinitialize to ensure it picks up the key if loaded later (just a safeguard)
    const activeGenAI = new GoogleGenerativeAI(geminiApiKey);

    const model = activeGenAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.4,
      }
    });

    // Assume history is passed in correct format: [{ role: 'user', parts: [{ text: '...' }] }]
    const chatHistory = Array.isArray(history) ? history : [];

    const chat = model.startChat({
        history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Error in AI Chat Controller:', error);
    res.status(500).json({ error: 'Internal server error while processing AI chat' });
  }
};
