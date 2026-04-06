function injectPixel(html, pixelUrl) {
    const pixelTag = `<img src="${pixelUrl}" width="1" height="1" style="display:none;opacity:0;border:0;white-space:nowrap;" alt="" />`;
    let trackedHtml = html;

    if (trackedHtml.toLowerCase().includes('</body>')) {
        return trackedHtml.replace(/<\/body>/i, `${pixelTag}</body>`);
    } else if (trackedHtml.toLowerCase().includes('</html>')) {
        return trackedHtml.replace(/<\/html>/i, `${pixelTag}</html>`);
    } else {
        return trackedHtml + pixelTag;
    }
}

const pixelUrl = "https://linkwise.slpro.in/p/2pb0ac";

const fullHtml = `<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1><p>Test</p></body></html>`;
const snippetHtml = `<div><h1>Hello</h1><p>Test</p></div>`;
const closingHtml = `<html><body>test</body></html>`;

console.log("Full HTML Test Outcome:");
console.log(injectPixel(fullHtml, pixelUrl));
console.log("\nSnippet HTML Test Outcome:");
console.log(injectPixel(snippetHtml, pixelUrl));
console.log("\nClosing HTML Test Outcome:");
console.log(injectPixel(closingHtml, pixelUrl));
