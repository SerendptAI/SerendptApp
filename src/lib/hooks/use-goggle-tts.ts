/* eslint-disable max-lines-per-function */
const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_TTS_API_KEY;

export const createGoogleSpeech = async ({
  voice,
  input,
  speed = 1.0,
  response_format = 'mp3',
}: {
  voice: string;
  input: string;
  speed?: number;
  response_format?: 'mp3' | 'wav' | 'ogg';
}) => {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google TTS API key not configured');
  }

  if (input.length > 5000) {
    throw new Error('Text too long (max 5000 characters for Google TTS)');
  }

  const requestBody = {
    input: {
      text: input,
    },
    voice: {
      languageCode: 'en-US',
      name: voice,
    },
    audioConfig: {
      audioEncoding:
        response_format.toUpperCase() === 'MP3' ? 'MP3' : 'LINEAR16',
      speakingRate: speed,
      pitch: 0.0,
    },
  };

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  console.log('Google TTS API response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Google TTS API error response:', errorText);
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(
        `Google TTS API error: ${errorData.error?.message || response.statusText}`
      );
    } catch (parseError) {
      throw new Error(
        `Google TTS API error: ${response.status} ${response.statusText}`
      );
    }
  }

  const data = await response.json();

  if (!data.audioContent) {
    throw new Error('No audio content received from Google TTS');
  }

  // Decode base64 audio content
  const audioBuffer = Buffer.from(data.audioContent, 'base64');

  return audioBuffer;
};
