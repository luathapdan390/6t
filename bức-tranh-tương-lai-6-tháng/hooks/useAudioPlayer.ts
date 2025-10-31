
import { useState, useRef, useCallback } from 'react';

// Helper functions for decoding, defined within the hook's module scope
const decodeBase64 = (base64: string): Uint8Array => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const play = useCallback(async () => {
    if (!audioData || isPlaying) return;

    try {
      if (sourceRef.current) {
          stop();
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      // Ensure context is running
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBytes = decodeBase64(audioData);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => {
        setIsPlaying(false);
        sourceRef.current = null;
      };
      source.start();
      sourceRef.current = source;
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  }, [audioData, isPlaying, stop]);

  return { play, stop, isPlaying, audioData, setAudioData };
};
