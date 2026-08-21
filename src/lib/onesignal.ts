const ONESIGNAL_APP_ID = "9b92265d-0524-450b-98c4-679b5d57d0f6";
const ONESIGNAL_REST_API_KEY = "os_v2_app_" + "tojcmxifercyxggem6nv2v6q6zeulwmuli2u3b4cqzds6x4hk6srsr2ym4nrxcls7faiidrcmtqpdnimgura4pwr5rq6zqd7ezzuqvq";

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
