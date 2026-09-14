/* Optional cloud services must never keep a request busy indefinitely. */
window.MochiNetwork = {
  async request(url, options = {}, readJSON = false, timeoutMs = 12000) {
    const controller = new AbortController();
    let timer;
    try {
      return await Promise.race([
        (async () => {
          const response = await fetch(url, {...options, signal:controller.signal});
          if (readJSON) {
            if (!response.ok) throw Error(`Cloud read failed (${response.status}).`);
            return await response.json();
          }
          return response;
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => {
          controller.abort(); reject(Error('Request timed out. Please try again.'));
        }, timeoutMs); })
      ]);
    } finally { clearTimeout(timer); }
  }
};
