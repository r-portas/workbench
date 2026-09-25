import { SunIcon, SunDimIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useWakeLock, useWakeLockSupported } from "@/lib/wake-lock";

/**
 * Toggle that keeps the screen awake while cooking.
 *
 * @remarks
 * Renders nothing in browsers without the Screen Wake Lock API. Off by default and not
 * persisted, so the lock only lasts while this recipe page is open.
 */
function CookModeToggle() {
  const supported = useWakeLockSupported();
  const [enabled, setEnabled] = useState(false);
  useWakeLock(enabled);

  if (!supported) return undefined;

  const Icon = enabled ? SunIcon : SunDimIcon;

  return (
    <Button
      variant={enabled ? "secondary" : "ghost"}
      aria-pressed={enabled}
      onClick={() => setEnabled((prev) => !prev)}
    >
      Keep screen on
      <Icon data-icon="inline-end" />
    </Button>
  );
}

export { CookModeToggle };
