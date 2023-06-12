window.addEventListener("load", function() {
    let container = document.createElement("div");
    container.id = "cool-custom-id-for-custom-injected-element";
    container.textContent = "This is an extra element added from injected JavaScript";
    document.body.appendChild(container);
});
