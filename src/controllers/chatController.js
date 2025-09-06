const OpenAIService = require('../services/OpenAIService');  // This line imports the OpenAIService class from OpenAIService.js file. It's

class ChatController {
    constructor() {
        this.openaiService = new OpenAIService();
    }
    // Normal function'da this context kaybı, dün çalıştım ama tekrar bak, bu yüzden hata veriyor. Bundan dolayı arrow function'a çeviriyoruz. Hatırladığım kadarıyla function declaration içindeki this kendi this'i oluyor ama arrow function'da üst scope'un dizinini kullanıyor.
    chat = async (req, res) => {
        try {
            const { question } = req.body;

            if (!question) {
                return res.status(400).json({  // return neden? çıksın diye mi? anlamadım, anlamına bak!
                    success:false,
                    message: 'Question is required'
                });
            }
            
            const result = await this.openaiService.generateResponse(question);

            console.log("Message is sent successfuly");
            res.status(200).json({
                success: true,
                data: {
                    question: question,
                    answer: result.content  // anladığım kadarıyla bu aşama UI'da gösterebilmek adına. yani react'tan axios ile fetch yaparsak yani api isteği atarsak bu verilere erişmek için res.status(200).json({soru ve cevap interaktifi}) olması lazım.
                }
            });
            console.log(result.content);
        } catch (err) {
            console.error('Chat Error:', err.message);

            res.status(500).json({
                success: false,
                message: err.message || 'Failed to generate response'
            });
        }
    }
}

module.exports = new ChatController();  // OpenAIService.js'den OpenAIService class'ını export ederken parantez ve new kullanmadık ama ChatController'ı routes/chatRoutes.js'de import edip kullanmak için burada export ederken new ve parantez kullandık. Neden?