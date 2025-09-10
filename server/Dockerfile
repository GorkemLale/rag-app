# Node.js 22 Alpine(küçük ve hızlı, alpine linux tabanlı minimal docker image)
FROM node:22.19.0-alpine

# Çalışma dizini
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Dependencies yükle (npm install yerine, npm ci kullandık. Çünkü package-lock.json'a sadık kalır (tam aynı versiyonlar), node_modules'ü temizler ve sıfırdan kurar, production'da determisintik (her build'de aynı dependecy versiyonları yani her yerde aynı çalışır, sürpriz yok), docker cache'i daha iyi kullanır çünkü her seferinde paketlere version resolve yapılmaz ve bu satır tekrar çalışmak zorunda kalmaz. (docker cache: Aynı layer'ları tekrar build etmez, önceki sonucu kullanır yani çok hızlı build. Her dockerfile satırı = 1 layer, docker her layer'ı cache'ler.) peki ya cache nasıl çalışır?
# cache için senaryo: ilk build: dockerfile'daki tüm satırları gerçekleştirir yani cache'ler. Sonra sadece kodda bir değişiklik yaparsın yani COPY . . aşamasıyla kodu tekrardan kopyalaman gerekir. İşte o zaman yeni bir paket yüklemediğin veya node sürümü değiştirmediğin için sadece COPY ve sonrasındaki satıları tekrarlar. Cache bozulma: Bir layer değişirse, o layer + sonraki tüm layer'lar yeniden build edilir. Bu yüzden COPY package*.json ./ aşamasını önce, COPY . . aşamasını ise sonra yapıyoruz (üzerine düşün, ne kadar mantıklı anlarsın. düşündüm, anladım eqwweq. dockerfile'daki layer sırasını akıllıca yapıyoruz ki docker doğal olarak bir layer değişince sonraki tüm layer'ları yenileyeceği için en çok değişenler en sonda olsun diye.).
RUN npm ci --only=production
# --only=production sayesinde package.json'daki devDependencies'i atlar, indirmez. Production için nodemon gereksizdir mesela ama express zorunludur. 
# Yani özetle npm install ve npm ci development ve production için kullanılabilir, npm install daha esnektir, less safe, ama sürümlere sadık kalmak istiyorsak npm ci kullanmalıyız.

# Uygulama kodunu kopyala
COPY . .

# PORT 5000'i aç, bu container'ın 5000 port'u demek. container'ın dış dünyaya açılacağı port ise farklı ona sonra göreceğiz (bkz. docker-compose, 8080:5000).
EXPOSE 5000

# Non-root user (güvenlik). Güvenlik için root yerine "nodejs" kullanıcısı oluşturuz. -g grup idsi belirlemek için kullanılırken -u ise user idsi belirlemek için kullanılır. -S ise sistem grubu/kullanıcısı oluşturmak için kullanılır (normal kullanıcı değil). &&, komut başarılıysa sonrakini çalıştır. \, satır devamı yapıyoruz, bu sayede uzun komudu bölmüş oluyoruz ve enter kodu bozmuyor, bunu bir sürü ve uzunca parametresi tek kod için de yapabilirdik.
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
# Peki ya neden 1001 id'li grup ve 1001 id'li kullanıcı seçtik. 0-999 sistem için ayrılmış, 1000 genelse ilk normal kullanıcıdır. 1001 ise güvenlidir ve çakışmaz. ID tutarlılığı için sabit değer.

# Klasör sahipliği ayarlamak. /app klasörünün sahipliğini nodejs kullanıcısına veririz ve USER komutu ile de container artık nodejs kullanıcısı olarak çalışır (root değil)
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check, interval ile 30 saniyede bir /health endpoint'ini kontrol et, timeout ile 3 saniye cevap bekle ve yoksa fail ver, start-period ile ilk 5 sn grace period (başlatma süresi), retries ile 3 kez dene, hala başarısız ise unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"
# node -e ile /health endpoint'ine GET isteği atılır. 200 dönerse exit code 0 (healthy), farklı bir şey dönerse de exit code 1 (unhealthy)
# docker durumu, healthy, unhealthy ve starting olabilir, docker ps ile görürsün. Bu kod bloğunun faydası ise container çalışıyor olsa bile app'in çökmüş olabileceğinin kontrolünü sağlamasıdır.

# Uygulamayı başlat
CMD ["npm", "start"]
