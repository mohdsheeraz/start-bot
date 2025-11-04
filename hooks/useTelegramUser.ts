import { useState, useEffect } from 'react';

export function useTelegramUser() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const WebApp = (await import('@twa-dev/sdk')).default;
      WebApp.ready();
      
      const tgUser = WebApp.initDataUnsafe?.user;
      if (tgUser) {
        setUser(tgUser);
        setUserId(tgUser.id.toString());
        localStorage.setItem('userId', tgUser.id.toString());
      }
    };
    init();
  }, []);

  return { user, userId };
}
