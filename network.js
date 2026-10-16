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
            if (response.type === 'opaque') throw Object.assign(Error('Cloud response is not readable.'), {planCode:'OPAQUE_RESPONSE'});
            if (!response.ok) throw Object.assign(Error(`Cloud read failed (${response.status}).`), {planCode:'HTTP_ERROR'});
            try { return await response.json(); } catch (error) { throw Object.assign(Error('Cloud response is not JSON.'), {planCode:'INVALID_JSON'}); }
          }
          return response;
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => {
          controller.abort(); reject(Object.assign(Error('Request timed out. Please try again.'), {planCode:'TIMEOUT'}));
        }, timeoutMs); })
      ]);
    } finally { clearTimeout(timer); }
  }
};
