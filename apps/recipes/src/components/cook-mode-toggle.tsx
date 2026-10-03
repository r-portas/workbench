import { SunIcon, SunDimIcon } from "lucide-react";
import { useState } from "react";

import { Toggle } from "@/components/ui/toggle";
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
    <Toggle pressed={enabled} onPressedChange={setEnabled}>
      Keep screen on
      <Icon data-icon="inline-end" />
    </Toggle>
  );
}

export { CookModeToggle };
