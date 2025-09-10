# RAG Tabanlı Soru-Cevap Uygulaması

Node.js ile geliştirilmiş, OpenAI entegrasyonlu basit RAG (Retrieval Augmented Generation) uygulaması.

## 📋 İçindekiler
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [API Endpoints](#api-endpoints)
- [Docker Kullanımı](#docker-kullanımı)
- [Proje Yapısı](#proje-yapısı)
- [Bu Hafta Öğrendiklerim](#bu-hafta-öğrendiklerim)

## 🛠 Kurulum

### Gereksinimler
- Node.js v22.19.0 (LTS)
- npm
- Docker (opsiyonel)

### Adımlar

1. **Projeyi klonlayın:**
```bash
git clone https://github.com/GorkemLale/rag-app.git
cd rag-app/server
```

2. **Dependencies'leri yükleyin:**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın:**
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your_openai_api_key_here
```

## 🚀 Çalıştırma

### Development Mode (Nodemon ile)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Uygulama `http://localhost:5000` adresinde çalışacaktır.

## 📡 API Endpoints

### Health Check
**GET** `/health`

Uygulamanın durumunu kontrol eder.

**Response:**
```json
{
  "status": "ok"
}
```

### Chat (LLM Entegrasyonu)
**POST** `/chat`

OpenAI API'si ile soru-cevap işlemi yapar.

**Request Body:**
```json
{
  "question": "Merhaba, nasılsın?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "Merhaba, nasılsın?",
    "answer": "Merhaba! Ben bir AI asistanıyım..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Question is required"
}
```

## 🐳 Docker Kullanımı

### Development Environment

1. **Development container'ı başlatın:**
```bash
docker compose -f docker-compose.dev.yml up -d
```

2. **Logları izleyin:**
```bash
docker logs -f rag-backend-dev-container
```

3. **Container'ı durdurun:**
```bash
docker compose -f docker-compose.dev.yml down
```

### Production Environment

1. **Production container'ı başlatın:**
```bash
docker compose up -d
```

2. **Container'ı durdurun:**
```bash
docker compose down
```

### Docker Faydaları
- **Hot Reload:** Development'ta kod değişiklikleri otomatik yansır
- **Consistent Environment:** Her yerde aynı şekilde çalışır
- **Easy Setup:** Tek komutla tüm ortam hazır

## 📁 Proje Yapısı

```
rag-app/
└── server/
    ├── src/
    │   ├── controllers/
    │   │   └── chatController.js      # Chat endpoint logic
    │   ├── routes/
    │   │   ├── chatRoutes.js          # Chat routes
    │   │   └── healthRoutes.js        # Health check routes
    │   └── services/
    │       └── OpenAIService.js       # OpenAI API entegrasyonu
    ├── public/
    │   ├── index.html                 # Basit UI
    │   └── script.js                  # Frontend JavaScript
    ├── app.js                         # Express app setup
    ├── server.js                      # Server başlatma
    ├── Dockerfile                     # Production Docker image
    ├── Dockerfile.dev                 # Development Docker image
    ├── docker-compose.yml             # Production compose
    ├── docker-compose.dev.yml         # Development compose
    ├── package.json
    ├── .env                           # Environment variables
    ├── .env.example                   # Environment template
    └── .gitignore
```

## 🎯 Kullanılan Teknolojiler

- **Backend:** Node.js v22.19.0, Express.js
- **AI Integration:** OpenAI API
- **Development:** Nodemon (hot reload)
- **Containerization:** Docker, Docker Compose
- **Environment:** dotenv
- **Security:** helmet, cors

## 🧠 Bu Hafta Öğrendiklerim

### Node.js & Express
- **LTS Version:** Node.js v22.19.0'a güncelleme yapıldı
- **Modular Structure:** src/ klasör yapısında controllers, routes, services ayrımı
- **Middleware:** express.json(), helmet, cors kullanımı
- **Arrow Functions vs Function Declarations:** `this` context farkları
- **Module Exports:** Class instance'ları export etme

### OpenAI API Entegrasyonu
- **API Key Security:** .env dosyasından güvenli okuma
- **Error Handling:** Try-catch blokları ile hata yönetimi
- **Response Formatting:** Consistent API response structure

### Docker & Containerization
- **Container vs VM:** Resource efficiency ve hız farkları
- **Dockerfile Best Practices:** Layer caching optimizasyonu
- **Multi-stage Builds:** Development vs Production separation
- **Docker Compose:** Multi-container orchestration
- **Volume Mounts:** Hot reload için kod synchronization
- **Health Checks:** Container durumu monitoring

### Git & GitHub
- **GitHub CLI:** `gh` komutu ile repo oluşturma
- **Git Workflow:** init, add, commit, push cycle
- **Branch Management:** main branch setup
- **Remote Repository:** Origin connection

### Key Learnings
1. **Cache Optimization:** Package.json'ı ayrı COPY ile dependency cache'i koruma
2. **Security:** Non-root user ile container güvenliği
3. **Development Workflow:** Hot reload ile hızlı geliştirme
4. **Environment Separation:** .env.example ile secret management

### Debugging Skills
- **Docker Logs:** Container loglarını izleme ve hata ayıklama
- **Development vs Production:** Farklı Dockerfile'lar ile environment separation
- **Volume Mount Issues:** node_modules conflict çözümü

## 🔮 Sonraki Adımlar (2. Hafta)
- [ ] PDF/TXT dosya yükleme endpoint'i
- [ ] Metin çıkarma ve chunking işlemleri  
- [ ] Vector database entegrasyonu (ChromaDB/pgvector)
- [ ] Embedding generation
- [ ] Document indexing system

---

**Geliştirici:** Görkem Lale  
**Başlangıç Tarihi:** Eylül 2025  
**Versiyon:** 1.0.0