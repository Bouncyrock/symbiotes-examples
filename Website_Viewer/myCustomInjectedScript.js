window.addEventListener("load", function() {
    let container = document.createElement("div");
    container.id = "cool-custom-id-for-custom-injected-element";
    container.textContent = "This is an extra element added from injected JavaScript. To remove it, remove the .js and .css files from the \"extras\" list in the manifest.json.";
    document.body.appendChild(container);
});
