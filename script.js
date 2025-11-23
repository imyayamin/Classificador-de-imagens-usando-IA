const URL2 = "./my_model/"; // coloque aqui o caminho da pasta com seu modelo

let model, labelContainer, maxPredictions, resultEl;

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

    document.getElementById("imageUpload").addEventListener("change", handleImageUpload);
};

function handleImageUpload(event) {
    const file = event.target.files[0];
    const img = document.getElementById("uploadedImage");
    img.src = URL.createObjectURL(file);

    img.onload = () => {
        predict(img);
    };
}

async function predict(image) {
    if (!model) {
        console.error('Modelo não está carregado');
        if (resultEl) resultEl.innerText = 'Modelo não carregado.';
        return;
    }

    try {
        const prediction = await model.predict(image);
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
            // usa children para evitar text nodes
            if (labelContainer.children[i]) {
                labelContainer.children[i].innerHTML = classPrediction;
            }
        }
    } catch (err) {
        console.error('Erro ao prever:', err);
        if (resultEl) resultEl.innerText = 'Erro na predição.';
    }
}
