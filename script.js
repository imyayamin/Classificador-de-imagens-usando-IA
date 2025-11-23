const URL2 = "./my_model/"; // coloque aqui o caminho da pasta com seu modelo

// tamanho webcam 
const WEBCAM_WIDTH = 640;
const WEBCAM_HEIGHT = 480;

let model, labelContainer, maxPredictions, resultEl;
let webcam = null;
let isWebcamRunning = false;

window.onload = async () => {
    const modelURL = URL2 + "model.json";
    const metadataURL = URL2 + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    resultEl = document.getElementById("result");

    // cria os elementos para mostrar resultados
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    document.getElementById("startWebcam").addEventListener("click", startWebcam);
    document.getElementById("stopWebcam").addEventListener("click", stopWebcam);
};


async function predict(imageOrCanvas) {
    if (!model) {
        console.error('Modelo não está carregado');
        if (resultEl) resultEl.innerText = 'Modelo não carregado.';
        return;
    }

    // determina a fonte: canvas da webcam ou elemento de imagem
    const source = imageOrCanvas || document.getElementById('uploadedImage');

    try {
        const prediction = await model.predict(source);
        console.log('Predictions:', prediction);

        // Ordena previsões por probabilidade (decrescente)
        const sorted = prediction.slice().sort((a, b) => b.probability - a.probability);

        // Mostra a melhor previsão em destaque
        if (resultEl) {
            const top = sorted[0];
            resultEl.innerText = `Classe: ${top.className} (${(top.probability * 100).toFixed(1)}%)`;
        }

        // Mostra todas as probabilidades no label container (como porcentagens)
        for (let i = 0; i < maxPredictions; i++) {
            const p = prediction[i];
            const percent = (p.probability * 100).toFixed(1) + "%";
            const classPrediction = `${p.className}: ${percent}`;
            if (labelContainer.children[i]) {
                labelContainer.children[i].innerHTML = classPrediction;
            }
        }
    } catch (err) {
        console.error('Erro ao prever:', err);
        if (resultEl) resultEl.innerText = 'Erro na predição.';
    }
}

async function startWebcam() {
    if (!model) {
        if (resultEl) resultEl.innerText = 'Aguarde o carregamento do modelo.';
        return;
    }

    if (isWebcamRunning) return;

    try {
        const flip = true; // espelha a webcam
        webcam = new tmImage.Webcam(WEBCAM_WIDTH, WEBCAM_HEIGHT, flip);
        await webcam.setup(); // pede permissão
        await webcam.play();
        isWebcamRunning = true;

        document.getElementById('webcam-container').appendChild(webcam.canvas);
        document.getElementById('startWebcam').disabled = true;
        document.getElementById('stopWebcam').disabled = false;

        // não há imagem estática agora — apenas webcam

        loopWebcam();
    } catch (err) {
        console.error('Não foi possível iniciar a webcam:', err);
        if (resultEl) resultEl.innerText = 'Erro ao acessar a webcam.';
    }
}

function stopWebcam() {
    if (!isWebcamRunning) return;
    if (webcam) {
        webcam.stop();
        if (webcam.canvas && webcam.canvas.parentNode) webcam.canvas.parentNode.removeChild(webcam.canvas);
        webcam = null;
    }
    isWebcamRunning = false;
    document.getElementById('startWebcam').disabled = false;
    document.getElementById('stopWebcam').disabled = true;
}

async function loopWebcam() {
    if (!isWebcamRunning || !webcam) return;
    await webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(loopWebcam);
}
