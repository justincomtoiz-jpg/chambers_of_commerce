export function postMessageToUI(type: string, payload?: any) {
  window.postMessage({ type, payload }, '*');
}

export function sendToGame(action: string, payload: any) {
  const resource = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'coc_resource';
  return fetch(`https://${resource}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
}
