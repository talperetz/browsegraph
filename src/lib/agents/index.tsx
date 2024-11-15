import {createGoogleGenerativeAI} from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});

export const geminiFlash = google('models/gemini-1.5-flash', {
});

