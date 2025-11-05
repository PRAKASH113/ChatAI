//components/GlobalWrapper.tsx this file is just to add some more funtionalities like notifications and it can be use to add navbar footer 

import { NotificationProvider } from "@/providers/NotificationProvider";

export default function GlobalWrapper({ children }: { children: React.ReactNode }) {

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}
