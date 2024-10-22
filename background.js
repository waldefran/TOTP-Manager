// background.js
chrome.runtime.onInstalled.addListener(() => {
    console.log('TOTP Manager instalado com sucesso!');
});

// Listener para mensagens de sincronização
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "sync") {
        // Aqui implementaremos a sincronização futuramente
        console.log("Solicitação de sincronização recebida");
        sendResponse({status: "success"});
    }
});