
import React, { useState, useCallback, useMemo } from 'react';
import { generateVisionText, generateSpeech } from './services/geminiService';
import { addSixMonths, formatDate } from './utils/dateUtils';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { Loader } from './components/Loader';

const App: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState<string>('');
  const [aspirations, setAspirations] = useState<string>('');

  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { play, stop, isPlaying, audioData, setAudioData } = useAudioPlayer();

  const futureDate = useMemo(() => {
    if (!date) return null;
    return addSixMonths(date);
  }, [date]);

  const handleGenerateText = useCallback(async () => {
    if (!futureDate || !name || !aspirations) {
      setError('Vui lòng điền đầy đủ tất cả các trường thông tin.');
      return;
    }
    setError(null);
    setIsLoadingText(true);
    setGeneratedText('');
    setAudioData(null);
    stop();

    try {
      const text = await generateVisionText(futureDate, name, aspirations);
      setGeneratedText(text);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo văn bản. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoadingText(false);
    }
  }, [futureDate, name, aspirations, setAudioData, stop]);

  const handleGenerateAudio = useCallback(async () => {
    if (!generatedText) return;
    setError(null);
    setIsLoadingAudio(true);
    setAudioData(null);
    stop();

    try {
      const audioBase64 = await generateSpeech(generatedText);
      setAudioData(audioBase64);
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo audio. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoadingAudio(false);
    }
  }, [generatedText, setAudioData, stop]);
  
  const isFormIncomplete = !date || !name || !aspirations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Bức Tranh Tương Lai 6 Tháng
          </h1>
          <p className="mt-2 text-lg text-purple-200">
            Kiến tạo tầm nhìn, lắng nghe định mệnh của bạn.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-purple-300">Thông Tin Của Bạn</h2>
            
            {error && <div className="bg-red-500/50 text-white p-3 rounded-lg mb-4">{error}</div>}

            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-purple-200 mb-2">Ngày bắt đầu</label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-700/50 border border-purple-400/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                />
                {futureDate && (
                  <p className="text-sm mt-2 text-purple-300">
                    Ngày trong tương lai: <span className="font-bold text-pink-400">{formatDate(futureDate)}</span>
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-purple-200 mb-2">Tên của bạn</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ví dụ: Lê Trường"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-700/50 border border-purple-400/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                />
              </div>
              <div>
                <label htmlFor="aspirations" className="block text-sm font-medium text-purple-200 mb-2">Ước mơ của bạn trong 6 tháng tới</label>
                <textarea
                  id="aspirations"
                  rows={4}
                  placeholder="Ví dụ: ngôi nhà đẹp nhất thế giới, ô tô đẹp nhất thế giới..."
                  value={aspirations}
                  onChange={(e) => setAspirations(e.target.value)}
                  className="w-full bg-gray-700/50 border border-purple-400/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
                />
              </div>
              <button
                onClick={handleGenerateText}
                disabled={isLoadingText || isFormIncomplete}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
              >
                {isLoadingText ? <Loader /> : <> <i className="fas fa-magic mr-2"></i> Kiến Tạo Bức Tranh </>}
              </button>
            </div>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg relative min-h-[300px] flex flex-col">
             <h2 className="text-2xl font-semibold mb-4 text-purple-300">Tầm Nhìn Của Bạn</h2>
            {isLoadingText && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-2xl">
                    <Loader />
                    <p className="mt-4 text-purple-200">Đang dệt nên tương lai của bạn...</p>
                 </div>
            )}
            {!isLoadingText && !generatedText && (
                <div className="flex-grow flex items-center justify-center text-center text-purple-300">
                    <p>Bức tranh tương lai của bạn sẽ xuất hiện ở đây.</p>
                </div>
            )}
            {generatedText && (
              <div className="flex-grow overflow-y-auto pr-2 max-h-[400px]">
                <p className="text-purple-100 whitespace-pre-wrap leading-relaxed font-serif">{generatedText}</p>
              </div>
            )}
            {generatedText && (
              <div className="mt-6 pt-4 border-t border-white/20">
                <button
                    onClick={audioData ? (isPlaying ? stop : play) : handleGenerateAudio}
                    disabled={isLoadingAudio}
                    className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:from-green-600 hover:to-teal-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                >
                    {isLoadingAudio ? <Loader /> : (
                        audioData ? (
                            isPlaying ? <><i className="fas fa-stop-circle mr-2"></i> Dừng Lại</> : <><i className="fas fa-play-circle mr-2"></i> Nghe Lại</>
                        ) : <><i className="fas fa-headphones mr-2"></i> Tạo Audio Thôi Miên</>
                    )}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
