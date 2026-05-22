import { type ReactNode, useEffect, useState } from "react";

interface Props {
  show: boolean;
  children: ReactNode;
}

/**
 * Fades in its children when `show` becomes true. Unmounts after fade-out
 * so dependent values don't leak into the prompt while the field is hidden.
 */
export function ConditionalField({ show, children }: Props) {
  const [mounted, setMounted] = useState(show);
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 180);
    return () => clearTimeout(t);
  }, [show]);

  if (!mounted) return null;
  return (
    <div
      className={[
        "transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
