const ONESIGNAL_APP_ID = "9b92265d-0524-450b-98c4-679b5d57d0f6";
const ONESIGNAL_REST_API_KEY = import.meta.env.VITE_ONESIGNAL_REST_API_KEY || "";

export const sendPushNotification = async (message: string) => {
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["Subscribed Users"],
        headings: { "en": "Nuevo Aviso en UTU", "es": "Nuevo Aviso en UTU" },
        contents: { "en": message, "es": message }
      })
    });
    const data = await response.json();
    console.log("Push sent:", data);
  } catch (err) {
    console.error("Push Error:", err);
  }
};
