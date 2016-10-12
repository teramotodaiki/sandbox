// URL String of popup window
const popupURL = URL.createObjectURL(
  new Blob(['<iframe id="result" sandbox="allow-scripts allow-modals"></iframe>'], { type: 'text/html' })
);

const popup = (function () {
  var _popup; // Reference to the popup window
  return function () {
    if (_popup && !_popup.closed) {
      _popup.close();
    }

    _popup = window.open(popupURL, '_blank', 'width=320,height=200');
    _popup.onload = function () {
      const frame = _popup.document.getElementById('result'); // <iframe>
      const html = document.getElementById('html').value;

      sendHandshake(frame, html)
      .then(addPort)
      .then(run => run());
    };

    window.addEventListener('beforeunload', function () {
      _popup.close();
    });
  };
})();

function refresh() {
  const frame = document.createElement('iframe');
  const html = document.getElementById('html').value;
  const prevent = document.getElementById('result');

  frame.id = 'result';
  frame.sandbox = prevent.sandbox;
  prevent.parentNode.insertBefore(frame, prevent);
  prevent.parentNode.removeChild(prevent);

  sendHandshake(frame, html)
  .then(addPort)
  .then(run => run());
}

function addPort(port) {
  const button = document.getElementById('run');
  const sendCode = function () {
    const code = document.getElementById('code').value;
    port.postMessage(code);
    return port;
  };
  button.addEventListener('click', sendCode);
  return sendCode;
}

/**
 * @param frame HTMLIFrameElement
 * @param srcdoc String HTML
 * @return Promise gives port
 */
function sendHandshake(frame, srcdoc) {
  return new Promise(function(resolve, reject) {
    const handshake = function () {
      const channel = new MessageChannel();
      frame.contentWindow.postMessage('', '*', [channel.port2]);
      resolve(channel.port1);
    };

    frame.addEventListener('load', handshake);
    frame.srcdoc = srcdoc;
  });
}
