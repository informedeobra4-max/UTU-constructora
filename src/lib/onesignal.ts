export const sendPushNotification = async (message: string) => {
  try {
    const response = await fetch('/api/sendPush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    const data = await response.json();
    console.log("Push sent via serverless:", data);
  } catch (err) {
    console.error("Push Notification Error:", err);
  }
};
