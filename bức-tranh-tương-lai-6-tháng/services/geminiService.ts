
import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateVisionText = async (
    futureDate: Date, 
    name: string, 
    aspirations: string
): Promise<string> => {
    const formattedDate = new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(futureDate);

    const prompt = `
Bạn là một bậc thầy về hình dung và truyền động lực, viết theo phong cách của một kịch bản thiền định thôi miên. Nhiệm vụ của bạn là viết một câu chuyện tường thuật sống động, ở ngôi thứ nhất cho người dùng về cuộc sống của họ sáu tháng trong tương lai.

**Hướng dẫn:**
1.  **Góc nhìn:** Viết ở ngôi thứ nhất ("tôi").
2.  **Thì:** Sử dụng thì hiện tại, như thể người dùng đang trải nghiệm khoảnh khắc này ngay bây giờ.
3.  **Ngày tháng:** Bắt đầu câu chuyện với "Hôm nay, ${formattedDate}, tôi, ${name}, ...".
4.  **Nội dung:** Lồng ghép những khát vọng của người dùng, đó là "${aspirations}", vào câu chuyện một cách tự nhiên và đầy cảm hứng.
5.  **Cấu trúc:** Câu chuyện PHẢI được cấu trúc để gợi lên cảm xúc liên quan đến 6 Nhu cầu Con người của Tony Robbins và các giác quan. Giải quyết từng điểm sau đây một cách rõ ràng:
    *   **Sự chắc chắn (Certainty):** Mô tả cảm giác an toàn, ổn định và tự tin.
    *   **Sự đa dạng (Variety):** Mô tả điều gì đó mới mẻ, thú vị hoặc đầy kích thích.
    *   **Sự quan trọng (Significance):** Mô tả cảm giác được coi trọng, tôn trọng và độc đáo.
    *   **Kết nối & Yêu thương (Connection & Love):** Mô tả một kết nối sâu sắc với ai đó hoặc điều gì đó.
    *   **Sự phát triển (Growth):** Mô tả việc học hỏi, trưởng thành hoặc mở rộng năng lực.
    *   **Sự cống hiến (Contribution):** Mô tả cảm giác cho đi và tạo ra sự khác biệt.
    *   **Thị giác (Sight):** Mô tả chi tiết những gì người dùng nhìn thấy.
    *   **Thính giác (Sound):** Mô tả những gì người dùng nghe thấy.
    *   **Khứu giác (Smell):** Mô tả những gì người dùng ngửi thấy.
    *   **Xúc giác (Touch):** Mô tả những gì người dùng cảm nhận được trên cơ thể.
6.  **Tông giọng:** Ngôn ngữ phải tích cực, đầy sức mạnh và chìm đắm sâu sắc, giống như một bài thiền định có hướng dẫn. Sử dụng ngôn ngữ phong phú, giàu cảm xúc.
7.  **Ngôn ngữ:** Viết bằng tiếng Việt.

Bây giờ, hãy viết câu chuyện.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating vision text:", error);
        throw new Error("Failed to generate text from Gemini API.");
    }
};

const generateSpeech = async (text: string): Promise<string> => {
    const prompt = `Hãy đọc với giọng nam trầm ấm, truyền cảm và có nhịp điệu chậm rãi, thôi miên: ${text}`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A good choice for a calm male voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech from Gemini API.");
    }
};


export { generateVisionText, generateSpeech };
