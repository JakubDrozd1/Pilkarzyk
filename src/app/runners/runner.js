const {
  NotificationService,
} = require("./src/app/service/notification/notification.service.ts")

const notificationService = new NotificationService()

addEventListener("push-notification", (event) => {
  const { data } = event
  console.log("Received push notification in runner:", data)

  // Wyślij zdarzenie do Angulara (Capacitor)
  Capacitor.Plugins.Notifications.addListener("remoteNotification", (info) => {
    // Przekazuj odpowiednie informacje do NotificationService
    try {
      console.log("received silent push notification in runner")

      // Wywołaj funkcję w Angularze do obsługi zdalnych powiadomień
      notificationService.handleRemoteNotification()
    } catch (err) {
      console.error("Error handling remote notification in runner:", err)
    }
  })

  // Przekaż informacje o powiadomieniu do Angulara
  Capacitor.Plugins.Notifications.schedule([
    {
      id: 100,
      title: "Enterprise Background Runner",
      body: "Received silent push notification in runner",
    },
  ])
})
