import OpenAI from 'openai';

const API_KEYS = [
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_1,
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_2,
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_3,
].filter((key): key is string => !!key);

let currentKeyIndex = 0;

function getNextKeyIndex(): number {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return currentKeyIndex;
}

function getCurrentClient(): OpenAI {
  if (API_KEYS.length === 0) {
    return new OpenAI({
      apiKey: 'not-configured',
    });
  }
  return new OpenAI({
    apiKey: API_KEYS[currentKeyIndex],
  });
}

export const createSpeech = async (params: OpenAI.Audio.SpeechCreateParams) => {
  let lastError: Error | null = null;
  const maxAttempts = API_KEYS.length;

  console.log('maxAttempts', maxAttempts);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const client = getCurrentClient();
      const response = await client.audio.speech.create(params);

      //   if (response) {
      //     const audioblob = response.blob();

      // }
      return response; // Success - return the response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(
        `API key ${currentKeyIndex + 1} failed:`,
        lastError.message
      );

      if (attempt < maxAttempts - 1) {
        getNextKeyIndex();
        console.log(`Switching to API key ${currentKeyIndex + 1}`);
      }
    }
  }

  // All attempts failed - throw the error
  throw lastError || new Error('All API keys failed and no error was captured');
};
