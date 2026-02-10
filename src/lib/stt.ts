// src/lib/stt.ts
import * as LegacyFileSystem from 'expo-file-system/legacy'; // ← legacy import

const API_KEY = 'sk_41fdc951a983bc489abd82290ec270dcb10b7874bbe08c30';
const API_URL = 'https://api.elevenlabs.io/v1/speech-to-text';

export const handleSpeechToText = async (uri: string): Promise<string> => {
  try {

    // Verify file exists (legacy style)
    const fileInfo = await LegacyFileSystem.getInfoAsync(uri);
    if (!fileInfo.exists || fileInfo.size === 0) {
      throw new Error('Recording file not found or empty');
    }

    const uploadResult = await LegacyFileSystem.uploadAsync(API_URL, uri, {
      httpMethod: 'POST',
      uploadType: LegacyFileSystem.FileSystemUploadType.MULTIPART, // ← now from legacy
      fieldName: 'file',
      mimeType: 'audio/m4a',
      headers: {
        'xi-api-key': API_KEY,
      },
      parameters: {
        model_id: 'scribe_v2',
        tag_audio_events: 'true',
        // language_code: 'eng',
        diarize: 'true',
        // timestamps_granularity: 'word',
      },
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(
        `ElevenLabs failed: ${uploadResult.status} - ${uploadResult.body}`
      );
    }

    const data = JSON.parse(uploadResult.body);

    const transcript = data.text?.trim() || 'No transcription returned';

    // Optional cleanup
    await LegacyFileSystem.deleteAsync(uri, { idempotent: true });

    return transcript;
  } catch (error: any) {
    if (error.stack) console.error('Stack:', error.stack);
    throw error;
  }
};
