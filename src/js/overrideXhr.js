/**
 * @param { (url: string) => boolean } fileCheck
 * @param { (data: string) => string } patch
 */
function overrideXhr(fileCheck, patch) {
  let handler = setInterval(() => {
    try {
      const iframe = /** @type { HTMLIFrameElement } */ (
        document.querySelector("#gameIFrame")
      );

      const OriginalXMLHttpRequest = iframe.contentWindow?.XMLHttpRequest;
      iframe.contentWindow.XMLHttpRequest = function () {
        const xhr = new OriginalXMLHttpRequest();
        const originalOpen = xhr.open;

        xhr.open = function (method, url) {
          this._url = url;
          return originalOpen.apply(this, arguments);
        };

        const originalSend = xhr.send;
        xhr.send = function () {
          const originalOnReadyStateChange = this.onreadystatechange;

          this.onreadystatechange = function () {
            if (this.readyState === 4 && fileCheck(this._url)) {
              const data = this.responseText;
              const newData = patch(data);

              Object.defineProperty(this, "responseText", {
                writable: true,
                value: newData,
              });
            }

            if (originalOnReadyStateChange) {
              originalOnReadyStateChange.apply(this, arguments);
            }
          };
          return originalSend.apply(this, arguments);
        };
        return xhr;
      };

      clearInterval(handler);
    } catch (e) {}
  }, 1);
}

export { overrideXhr };
