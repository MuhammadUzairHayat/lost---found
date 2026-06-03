self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Lost & Found",
    body: "You have a new notification.",
    url: "/posts",
    tag: `lost-found-${Date.now()}`,
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      /* use defaults */
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      tag: data.tag,
      renotify: true,
      data: { url: data.url },
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/posts";
  const absolute = new URL(url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client && client.url.startsWith(self.location.origin)) {
          client.navigate(absolute);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(absolute);
      }
    })
  );
});
