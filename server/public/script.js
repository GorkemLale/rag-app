// Saf JavaScript ile UI yazmaktan nefret ediyorum!

document.getElementById('sendBtn').addEventListener("click", sendMessage);

async function sendMessage() {
    try {
        const question = document.getElementById("questionInput").value;
        const response = await fetch("http://localhost:5000/chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });
        
        // This is a working version as follows:
        const responseData = await response.json();
        console.log(responseData.data.answer);

        // If you did like that:
        // console.log(await response.json().data.answer)
        // Javascript reads it as:
        // console.log(await (response.json().data.answer))
        // But now, we don't know the property like that if it exists or not.
        // If we want to fix this, we can do like that:
        // console.log((await response.json()).data.answer);
        // Show Questions and Responses in UI

        displayQuestion(question);
        displayResponse(responseData.data.answer);


    } catch (err) {
        console.error("UI Error:", err);
    }
}

function displayQuestion(question) {
    const responseArea = document.getElementById("responseArea");
    responseArea.innerHTML += `<p><strong>Question:</strong> ${question}<br>`;

}

function displayResponse(data) {
    const responseArea = document.getElementById("responseArea");
    responseArea.innerHTML += `<p><strong>Response:</strong> ${data}</p>`;
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const btn = document.getElementById('uploadBtn');

    if (!fileInput.files[0]) {
        alert('Lütfen bir dosya seçin.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    btn.disabled = true;
    btn.textContent = 'Yükleniyor işte';

    try {
        const response = await fetch('/docs/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            alert('Dosya başarıyla yüklendi.');
            console.log("Upload result:", data.data);
        } else {
            alert('Upload hatası: ' + data.message);
        }
    } catch (err) {
        console.log('Upload error', err);
        alert('Upload hatası: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Yükle';
    }
}

const btn = document.getElementById('uploadBtn').addEventListener('click', uploadFile);
