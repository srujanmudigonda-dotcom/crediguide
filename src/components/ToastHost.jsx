import { useEffect, useState } from "react";
import { subscribeToNotifications } from "../utils/notify";

/*
|--------------------------------------------------------------------------
| ToastHost
|--------------------------------------------------------------------------
|
| Renders notify() messages as stacked toasts at the bottom of the
| screen. Mounted once, in App, so every page can use it.
|
*/

let nextId = 1;

function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((message) => {
      const id = nextId;
      nextId += 1;

      setToasts((current) => [
        ...current.slice(-2),
        { id, message },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== id)
        );
      }, 4500);
    });

    return unsubscribe;
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto w-full max-w-md rounded-xl bg-slate-900 px-5 py-3.5 text-center text-sm font-medium text-white shadow-2xl"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default ToastHost;
