const {OpenAI} = require('openai');  // This line imports the OpenAI class from the openai library. It allows us to interact with the OpenAI API.

// Class Definition
class OpenAIService {  // This is a service class. Its purpose is to simplify and organize how we interact with the API.
    // Constructor Definition
    constructor() {
        this.client = new OpenAI({  // Creates an instance of OpenAI client
            apiKey: process.env.GEMINI_API_KEY,  // apiKey is loaded from an environment variable. (Namely, from .env file (Top Secret :D))
            baseURL: "https://generativelanguage.googleapis.com/v1beta/openai"  // When we want to use gemini models with openai library, we should add this line to not get this error during an API request: 
            /*
                {
                    "success": false,
                    "message": "Gemini API Error: 401 Incorrect API key provided: AIzaSyBS***************************J6jI. You can find your API key at https://platform.openai.com/account/api-keys."
                }   
            */
        });
        // Setting Default Configuration
        this.defaultConfig = {  // Sets default values for model, token limit, and temperature (controls randomness)
            model: 'gemini-2.0-flash',  // For testing, it is free :D
            max_tokens: 1000,  // For now, this limit is suitable
            temperature: 0.7  // umm, okey :)
        };

        // Session storage for memory
        this.conversations = new Map();  // sessionId -> messages[]  // normal object de olurdu ama bu daha sağlıklı olur diye kullandık. mesela normal object seni string key'e zorlarken Map()'te öyle bir sıkıntı yoktur. Ayrıca has ve delete method'larıyla ve size property (bence property :D) ile daha avantajlı bir kullanım sunuyor.
    }


    // Main Method
    async generateResponseWithMemory(prompt, sessionId = 'default', options = {}) {  // This method generates a response based on the user's input (prompt). If we want to customize configuration, "options" object allows customization of model settings.  
        try {
            // Input Validation
            if (!prompt || typeof prompt !== 'string') {  // Checks if the prompt is valid. We should input our prompt as a non-empty string. 
                throw new Error('Prompt must be a non-empty string');  // Why it's useful: Prevents sending bad data to the API.
            }

            // Conversation history al veya oluştur
            if (!this.conversations.has(sessionId)) {
                this.conversations.set(sessionId, [
                    {
                        role: 'system',
                        content: 'Sen yardımcı bir asistansın. Önceki konuşmaları hatırlayabilirsin'
                    }
                ]);
            }

            const messages = this.conversations.get(sessionId);

            // Yeni user mesajını ekle
            messages.push({
                role: 'user',
                content: prompt
            });

            // API Call: API calls are asyncron processes. So, we should use "await" to do this process parallel.
            const response = await this.client.chat.completions.create({  // Sends a request to the Chat Completions API (completion: tamamlama, bitirme, ikmal, acaba nasıl çevriliyor?)
                model: options.model || this.defaultConfig.model,
                messages: messages,  // Tüm geçmişi gönder!
                max_tokens: options.maxTokens || this.defaultConfig.max_tokens,  // Uses either custom or default settings.
                temperature: options.temperature || this.defaultConfig.temperature
            });
            
            const assistantMessage = response.choices[0].message.content;

            // Assistant cevabını da conversation'a ekle
            messages.push({
                role: 'assistant',  // system'dan ve user'dan farklı olarak kendisini hatırlamasını sağlayacak. Acaba hazır mı yoksa değiştirebiliyor muyuz bu adı..?
                content: assistantMessage
            });

            // Memory limit (son 20 mesajı tut)
            if (messages.length > 21) {  // system + 20 mesaj
                messages.splice(1, 2);  // ilk user-assistant pair'ini sil. splice method'unu tam öğren.
            }

            // Returning the Response
            return {  // Returns the generated message and usage stats (like token count)
                content: assistantMessage,
                usage: response.usage
        
            };
        // Error handling
        } catch (err) {  // Catches any errors and throws a custom error message.
            throw new Error(`Gemini API Error: ${err.message}`);  // Why it's useful: Helps us understand where the error came from.
        }  // What If Error Handling Is Missing? App crashes, user sees nothing or a generic error. But with Error Handling, Errors are caught, logged, and explained clearly.
    }

    clearSession(sessionId = 'default') {
        this.conversation.delete(sessionId);
    }

    // Eski method'u koru (backward compatibility)
    async generateResponse(prompt, options = {}) {
        return this.generateResponseWithMemory(prompt, 'default', options);
    }
}

module.exports = OpenAIService;