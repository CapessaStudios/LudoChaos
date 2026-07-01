const CACHE_NAME = "ludochaos-v6";

// =========================
// LISTA SEGURA DE ARQUIVOS
// (SEM pastas, SEM riscos de cache quebrar)
// =========================
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",

  // Service Worker (auto update)
  "./service-worker.js",

  // =========================
  // ÍCONES
  // =========================
  "./assets/imagem/logo192.png",
  "./assets/imagem/logo512.png",
  "./assets/imagem/logo.png",

  // Screenshots
  "./assets/imagem/screen1.png",
  "./assets/imagem/screen2.png",
  "./assets/imagem/screen3.png",
  "./assets/imagem/screen4.png",
  "./assets/imagem/screen5.png",

  // =========================
  // FONT AWESOME
  // =========================
  "./assets/fontawesome/css/all.min.css",
  "./assets/fontawesome/webfonts/fa-solid-900.woff2",
  "./assets/fontawesome/webfonts/fa-regular-400.woff2",
  "./assets/fontawesome/webfonts/fa-brands-400.woff2",

  // =========================
  // FONTES (corrigido .ttf)
  // =========================
  "./assets/fontes/DMSerifDisplay-Regular.ttf",
  "./assets/fontes/Inter-Bold.ttf",
  "./assets/fontes/Inter-Medium.ttf",
  "./assets/fontes/Inter-Regular.ttf",
  "./assets/fontes/Inter-SemiBold.ttf",

  // =========================
  // SONS (ficheiros individuais)
  // =========================
  "./assets/musicas/fundo.mp3",
  "./assets/musicas/fundo1.mp3",
  "./assets/musicas/vitoria.mp3"
];

// =========================
// FUNÇÃO SEGURA DE CACHE
// =========================
async function cacheFiles(cache, files) {
  for (const file of files) {
    try {
      await cache.add(file);
    } catch (err) {
      console.warn("⚠️ Falha ao cachear:", file, err);
    }
  }
}

// =========================
// INSTALL
// =========================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cacheFiles(cache, FILES))
  );
});

// =========================
// ACTIVATE (limpa caches antigos)
// =========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// =========================
// FETCH (offline first seguro)
// =========================
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Navegação (HTML principal)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Cache-first com fallback seguro
  event.respondWith(
    caches.match(req).then((cached) => {
      return (
        cached ||
        fetch(req).catch(() => {
          return caches.match("./index.html");
        })
      );
    })
  );
});

// =========================
// BACKGROUND SYNC
// =========================
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-game-data") {
    event.waitUntil(syncGameData());
  }
});

async function syncGameData() {
  console.log("🔄 LudoChaos sync executado (v6)");
}

// =========================
// PUSH NOTIFICATIONS
// =========================
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.text() : "Atualização no LudoChaos";

  event.waitUntil(
    self.registration.showNotification("LudoChaos", {
      body: data,
      icon: "/assets/imagem/logo192.png"
    })
  );
});
