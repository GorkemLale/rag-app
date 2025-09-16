function kullaniciGetir( userId, callback ) {
    setTimeout(() => {
        kullanici = { id: userId, isim: "Ahmet", yas: 25 };  // fetch veya axios kullanılıp, id: userId olarak gönderip onu response olarak almışız (const kullanici = response.data) gibi simüle ettik (mock).
        callback(null, kullanici);
    }, 1000);
}

kullaniciGetir(1, (hata, kullanici) => {
    if (hata) {
        console.error("Hata:", hata);
    } else {
        console.log("Kullanici: ",kullanici);
    }
});