
// This is a MOCKED Gemini service. It does not make actual API calls.
// For actual Gemini API integration, you would use @google/genai.
// import { GoogleGenAI, GenerateContentResponse, Content } from "@google/genai";
import { CHATBOT_KNOWLEDGE_BASE, GEMINI_MODEL_TEXT } from '../constants';
import { ChatMessage } from '../types'; // Using local ChatMessage type

// const API_KEY = process.env.API_KEY; 
// if (!API_KEY) {
//   console.warn("Gemini API Key not found. Chatbot will use fallback responses.");
// }
// const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;


export const getChatbotResponse = async (
  userMessage: string,
  chatHistory: ChatMessage[],
  context?: { currentPage?: string; userRole?: string }
): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));

  const lowerMessage = userMessage.toLowerCase().trim();

  // Simple keyword matching from knowledge base
  for (const keyword in CHATBOT_KNOWLEDGE_BASE) {
    if (lowerMessage.includes(keyword)) {
      const responseEntry = CHATBOT_KNOWLEDGE_BASE[keyword];
      if (typeof responseEntry === 'string') {
        return responseEntry;
      } else {
        // Handle object with response and followUp
        let responseText = responseEntry.response;
        if (responseEntry.followUp && responseEntry.followUp.length > 0) {
            responseText += "\n\nYou might also want to: \n- " + responseEntry.followUp.join("\n- ");
        }
        return responseText;
      }
    }
  }
  
  // Contextual "prediction" based on current page (very simple)
  if (context?.currentPage) {
    if (context.currentPage.includes('attendance') && (lowerMessage.includes('help') || lowerMessage.includes('how'))) {
        return "It looks like you're on the attendance page. You can mark if you're working from home, in the office, or on leave. If in office, you can also specify your mode of transport.";
    }
    if (context.currentPage.includes('parking') && (lowerMessage.includes('available') || lowerMessage.includes('slots'))) {
        return "On the parking page, you can see real-time availability of parking slots. Green means available, red means occupied.";
    }
    if (context.currentPage.includes('booking') && (lowerMessage.includes('room') || lowerMessage.includes('meeting'))) {
        return "For room bookings, select a date, filter by your needs (like capacity or AV equipment), then choose a room to see its schedule and book an available slot.";
    }
  }

  // Fallback if using actual API (mocked here)
  // if (ai) {
  //   try {
  //     // Construct history for context
  //     const contents: Content[] = chatHistory.map(msg => ({
  //       role: msg.sender === 'user' ? 'user' : 'model',
  //       parts: [{ text: msg.text }],
  //     }));
  //     contents.push({ role: 'user', parts: [{ text: userMessage }] });

  //     const response: GenerateContentResponse = await ai.models.generateContent({
  //       model: GEMINI_MODEL_TEXT, // This is a placeholder model name
  //       contents: contents,
  //     });
  //     return response.text;
  //   } catch (error) {
  //     console.error("Error calling Gemini API (mocked path):", error);
  //     return "Sorry, I encountered an error trying to respond. Please try again.";
  //   }
  // }

  return CHATBOT_KNOWLEDGE_BASE["default"] as string || "I'm not sure how to respond to that. Can you try asking differently?";
};

// Simulate AI features mentioned in problem statement
export const getAIPrediction = async (feature: 'peak_days' | 'recommend_room' | 'resolve_conflict' | 'auto_release'): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    switch(feature) {
        case 'peak_days':
            return CHATBOT_KNOWLEDGE_BASE["peak office days"] ? (CHATBOT_KNOWLEDGE_BASE["peak office days"] as {response: string}).response : "Predicting peak office days: Tuesdays and Wednesdays seem popular.";
        case 'recommend_room':
            return CHATBOT_KNOWLEDGE_BASE["recommend room"] ? (CHATBOT_KNOWLEDGE_BASE["recommend room"] as {response: string}).response : "Room recommendation: For a small team, 'Synergy Space' is great!";
        case 'resolve_conflict':
            return "AI conflict resolution: If a double booking occurs, I can suggest alternatives. (This is a simulated feature)";
        case 'auto_release':
            return "AI auto-release: Unused rooms or no-shows can be automatically released to improve utilization. (This is a simulated feature)";
        default:
            return "AI feature simulation: I can help with various smart office tasks!";
    }
};
