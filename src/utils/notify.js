/*
|--------------------------------------------------------------------------
| notify - in-app messages (replaces browser alert popups)
|--------------------------------------------------------------------------
|
| Pages call notify("...") exactly where they used to call
| alert("..."). ToastHost (mounted once in App) listens here and
| renders the messages inside the website instead of as browser
| dialogs.
|
*/

const listeners = new Set();

export const notify = (message) => {
  const text =
    message === null || message === undefined
      ? ""
      : String(message);

  if (!text) {
    return;
  }

  listeners.forEach((listener) => {
    try {
      listener(text);
    } catch (error) {
      console.error("notify listener error:", error);
    }
  });
};

export const subscribeToNotifications = (listener) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export default notify;
