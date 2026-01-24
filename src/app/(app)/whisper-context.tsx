import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useState } from 'react';
//@ts-ignore
import { initWhisper } from 'whisper.rn';

interface WhisperContextType {
  whisperContext: any | null;
  isReady: boolean;
}

const WhisperContext = createContext<WhisperContextType>({
  whisperContext: null,
  isReady: false,
});

export const WhisperProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [whisperContext, setWhisperContext] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🔧 WhisperProvider mounted');

    const setup = async () => {
      try {
        console.log('🎤 Requesting audio permissions...');
        await Audio.requestPermissionsAsync();

        console.log('🤖 Initializing Whisper model...');
        const context = await initWhisper({
          filePath: require('../../../assets/models/whisper-tiny.bin'),
        });

        setWhisperContext(context);
        setIsReady(true);
        console.log('✅ Audio permissions granted and Whisper model loaded');
        console.log('✅ Context:', context);
        console.log('✅ isReady set to true');
      } catch (e) {
        console.error('❌ Whisper init failed:', e);
      }
    };

    setup();

    return () => {
      console.log('🔧 WhisperProvider unmounted');
    };
  }, []);

  // Log whenever state changes
  useEffect(() => {
    console.log(
      '📊 WhisperProvider state - isReady:',
      isReady,
      'context:',
      !!whisperContext
    );
  }, [isReady, whisperContext]);

  return (
    <WhisperContext.Provider value={{ whisperContext, isReady }}>
      {children}
    </WhisperContext.Provider>
  );
};

export const useWhisper = () => {
  const context = useContext(WhisperContext);
  console.log(
    '🎯 useWhisper called - isReady:',
    context.isReady,
    'context:',
    !!context.whisperContext
  );
  return context;
};
