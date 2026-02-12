
const API_BASE_URL = "https://southamerica-east1-luz-da-palavra-app.cloudfunctions.net";

export async function requestNotificationPermission(userEmail: string) {
  if (!('Notification' in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    // Aqui seria a integração real com o Firebase Messaging SDK
    // Por ser um ambiente web estático, simulamos o registro do token no backend
    const mockToken = "fcm_token_" + Math.random().toString(36).substr(2, 9);
    
    try {
      await fetch(`${API_BASE_URL}/registrarToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.toLowerCase().trim(),
          token: mockToken
        })
      });
      return true;
    } catch (e) {
      console.error("Erro ao registrar token", e);
      return false;
    }
  }
  return false;
}

export function checkNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
