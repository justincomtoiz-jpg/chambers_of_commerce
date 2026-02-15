// src/utils/nui.ts
export async function sendToGame(action: string, payload: any) {
  // GetParentResourceName is available in FiveM NUI environment; in dev use a fallback
  const resource = (window as any).GetParentResourceName
    ? (window as any).GetParentResourceName()
    : 'coc_resource';
  await fetch(`https://${resource}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, payload }),
  });
}
