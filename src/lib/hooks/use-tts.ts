/* eslint-disable max-lines-per-function */
import { createGoogleSpeech } from './use-goggle-tts';
import { createSpeech } from './use-openia-tts';

export type useTTSProps = {
  text: string;
  voice: string;
  model: string;
  provider?: string;
};

const MAX_CHUNK_SIZE = 4000; // Leave some buffer below 4096 limit
const MAX_GOOGLE_CHUNK_SIZE = 4900; // Leave some buffer below 5000 limit

function splitTextIntoChunks(text: string, maxSize: number): string[] {
  if (text.length <= maxSize) {
    return [text];
  }

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxSize) {
      chunks.push(remaining);
      break;
    }

    // Find the best split point (sentence boundary)
    let splitIndex = maxSize;

    // Look for sentence endings (.!?) followed by space
    const sentenceEndRegex = /[.!?]\s/g;
    let lastMatch = null;
    let match;

    while ((match = sentenceEndRegex.exec(remaining)) !== null) {
      if (match.index + 2 <= maxSize) {
        lastMatch = match;
      } else {
        break;
      }
    }

    if (lastMatch) {
      splitIndex = lastMatch.index + 2; // Include the punctuation and space
    } else {
      // No sentence boundary found, try to split at word boundary
      const lastSpace = remaining.lastIndexOf(' ', maxSize);
      if (lastSpace > maxSize * 0.5) {
        splitIndex = lastSpace + 1;
      }
    }

    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks;
}

async function concatenateAudioBlobs(blobs: Blob[]): Promise<Blob> {
  // For React Native, we need to handle blobs differently
  // Convert each blob to array buffer, concatenate, then create a single blob
  const arrayBuffers = await Promise.all(
    blobs.map((blob) => blob.arrayBuffer())
  );

  const totalLength = arrayBuffers.reduce(
    (acc, buf) => acc + buf.byteLength,
    0
  );
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const buffer of arrayBuffers) {
    result.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return new Blob([result], { type: 'audio/mpeg' });
}

export const handleTTS = async ({
  text,
  voice,
  model,
  provider,
}: useTTSProps) => {
  if (!text || !voice || !model) {
    return undefined;
  }

  const isGoogle = provider === 'google';
  const maxChunkSize = isGoogle ? MAX_GOOGLE_CHUNK_SIZE : MAX_CHUNK_SIZE;

  const chunks = splitTextIntoChunks(text, maxChunkSize);
  console.log(
    `TTS: Processing ${chunks.length} chunk(s) IN PARALLEL, total length: ${text.length}`
  );

  const startTime = Date.now();

  if (isGoogle) {
    // Process all chunks IN PARALLEL for Google TTS
    const chunkPromises = chunks.map(async (chunk, i) => {
      console.log(
        `TTS Google: Starting chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`
      );

      const response = await createGoogleSpeech({
        voice: voice,
        input: chunk,
        speed: 1.0,
        response_format: 'mp3',
      });

      if (!response) {
        throw new Error(`Invalid response from Google TTS for chunk ${i + 1}`);
      }

      console.log(`TTS Google: Completed chunk ${i + 1}/${chunks.length}`);
      return { index: i, buffer: response };
    });

    // Wait for all chunks to complete
    const results = await Promise.all(chunkPromises);

    // Sort by index to maintain order
    results.sort((a, b) => a.index - b.index);
    const audioBuffers = results.map((r) => r.buffer);

    // Concatenate all audio buffers
    const totalLength = audioBuffers.reduce((acc, buf) => acc + buf.length, 0);
    const combinedBuffer = Buffer.concat(audioBuffers, totalLength);

    console.log(
      `TTS Google: All ${chunks.length} chunks completed in ${Date.now() - startTime}ms`
    );

    return combinedBuffer;
  } else {
    // OpenAI - process all chunks IN PARALLEL and return blob directly
    const chunkPromises = chunks.map(async (chunk, i) => {
      console.log(
        `TTS OpenAI: Starting chunk ${i + 1}/${chunks.length}, length: ${chunk.length}`
      );

      const response = await createSpeech({
        model: model,
        voice: voice,
        input: chunk,
        speed: 1.0,
        response_format: 'mp3',
      });

      if (!response) {
        throw new Error(`Invalid response from OpenAI for chunk ${i + 1}`);
      }

      // Get the blob directly from the response instead of converting to ArrayBuffer
      const blob = await response.blob();

      if (!blob || blob.size === 0) {
        throw new Error(
          `Received empty audio data from OpenAI for chunk ${i + 1}`
        );
      }

      console.log(`TTS OpenAI: Completed chunk ${i + 1}/${chunks.length}`);
      return { index: i, blob: blob };
    });

    // Wait for all chunks to complete
    const results = await Promise.all(chunkPromises);

    // Sort by index to maintain order
    results.sort((a, b) => a.index - b.index);
    const audioBlobs = results.map((r) => r.blob);

    // If single chunk, return it directly
    if (audioBlobs.length === 1) {
      console.log(
        `TTS OpenAI: Single chunk completed in ${Date.now() - startTime}ms`
      );
      return audioBlobs[0];
    }

    // Concatenate all audio blobs
    const combinedBlob = await concatenateAudioBlobs(audioBlobs);

    console.log(
      `TTS OpenAI: All ${chunks.length} chunks completed in ${Date.now() - startTime}ms`
    );

    return combinedBlob;
  }
};
