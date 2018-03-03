namespace Swagger {
    // Here we expose swagger
    // so that it may be consumed easily like a node module.
    declare const module: { exports: {} };
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Swagger;
    }
}
