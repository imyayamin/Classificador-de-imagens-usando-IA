const URL2 = "./my_model/"; // coloque aqui o caminho da pasta com seu modelo

let model, labelContainer, maxPredictions;

window.onload = async () => {
    const modelURL = URL2 + "model.json";
    const metadataURL = URL2 + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");

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
    const prediction = await model.predict(image);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}
