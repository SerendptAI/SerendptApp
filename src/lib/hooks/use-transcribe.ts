import OpenAI from 'openai';

const API_KEYS = [
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_1,
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_2,
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_3,
  process.env.EXPO_PUBLIC_OPENAI_API_KEY_4,
].filter((key): key is string => !!key);

let currentKeyIndex = 0;

function getNextKeyIndex(): number {
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return currentKeyIndex;
}

function getCurrentClient(): OpenAI {
  if (API_KEYS.length === 0) {
    throw new Error('No OpenAI API keys configured');
  }
  return new OpenAI({
    apiKey: API_KEYS[currentKeyIndex],
  });
}

export const transcribe = async (formData: FormData) => {
  try {
    const file = formData.get('file') as File;
    const language = (formData.get('language') as string) || 'en';

    if (!file) {
      return;
    }

    // Try with each API key
    let lastError: Error | null = null;
    const maxAttempts = API_KEYS.length;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const client = getCurrentClient();

        console.log(
          `[Transcribe API] Attempting transcription with API key ${currentKeyIndex + 1}`
        );

        const transcription = await client.audio.transcriptions.create({
          file: file,
          model: 'whisper-1',
          language: language,
          response_format: 'verbose_json',
          timestamp_granularities: ['word'],
        });

        console.log('[Transcribe API] Transcription successful');

        return {
          text: transcription.text,
          words: transcription.words || [],
          success: true,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(
          `[Transcribe API] API key ${currentKeyIndex + 1} failed:`,
          lastError.message
        );

        if (attempt < maxAttempts - 1) {
          getNextKeyIndex();
          console.log(
            `[Transcribe API] Switching to API key ${currentKeyIndex + 1}`
          );
        }
      }
    }

    throw new Error(`All API keys failed. Last error: ${lastError?.message}`);
  } catch (error) {
    console.error('[Transcribe API] Error:', error);
  }
};
