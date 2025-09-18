// saves/save-injector.js
(async function () {
  const KEY_PATH = "/idbfs/5bc32e1a17c4bdfdd5da57ab99ff0a2c/Save/cloud";
  const DB_NAME = "/idbfs";
  const STORE_NAME = "FILE_DATA";

  // utilitário: base64 -> Uint8Array
  function b64ToU8(b64) {
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return arr;
  }

  async function fetchSaveJson() {
    const resp = await fetch('../saves/default.json', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  }

  async function writeToIndexedDB(dataObj) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = function (evt) {
        const db = evt.target.result;
        try {
          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);

          const contents = b64ToU8(dataObj.payload.contents_b64);

          const putObj = {
            timestamp: new Date(dataObj.payload.timestamp),
            mode: dataObj.payload.mode,
            contents: contents
          };

          const putReq = store.put(putObj, KEY_PATH);
          putReq.onsuccess = () => {
            console.log('Save aplicado com sucesso!');
            resolve(true);
          };
          putReq.onerror = e => reject(e);
        } catch (e) {
          reject(e);
        }
      };
      request.onerror = e => reject(e);
    });
  }

  try {
    const saveJson = await fetchSaveJson();
    await writeToIndexedDB(saveJson);
    // opcional: recarregar o jogo depois de aplicar
    // location.reload();
  } catch (err) {
    console.error('Erro ao aplicar save:', err);
  }
})();
