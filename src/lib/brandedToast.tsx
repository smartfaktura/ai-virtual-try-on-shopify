import { toast as sonnerToast, type ExternalToast } from 'sonner';
import { TEAM_MEMBERS } from '@/data/teamData';
import { getOptimizedUrl } from '@/lib/imageOptimization';

type ToastMessage = string | React.ReactNode;

function getAvatar(name: string) {
  const member = TEAM_MEMBERS.find(m => m.name === name);
  if (!member) return undefined;
  return (
    <img
      src={getOptimizedUrl(member.avatar, { quality: 60 })}
      alt={member.name}
      className="w-6 h-6 rounded-full object-cover flex-shrink-0 ring-1 ring-border/40"
    />
  );
}

// Context-appropriate team member per toast type
const TYPE_MEMBER: Record<string, string> = {
  success: 'Sophia',
  error: 'Luna',
  info: 'Kenji',
  warning: 'Sienna',
};

function withAvatar(type: string, data?: ExternalToast): ExternalToast {
  const memberName = TYPE_MEMBER[type] || 'Sophia';
  return { ...data, icon: data?.icon ?? getAvatar(memberName) };
}

/**
 * Drop-in replacement for sonner's `toast` that auto-injects VOVV.AI team avatars.
 * Same API: toast.success(), toast.error(), toast.info(), toast.warning(), toast()
 */
export const toast = Object.assign(
  // Default toast call: toast("message")
  (message: ToastMessage, data?: ExternalToast) =>
    sonnerToast(message, withAvatar('success', data)),
  {
    success: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.success(message, withAvatar('success', data)),
    error: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.error(message, withAvatar('error', data)),
    info: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.info(message, withAvatar('info', data)),
    warning: (message: ToastMessage, data?: ExternalToast) =>
      sonnerToast.warning(message, withAvatar('warning', data)),
    // Pass-through for less common sonner methods
    loading: sonnerToast.loading,
    promise: sonnerToast.promise,
    custom: sonnerToast.custom,
    message: sonnerToast.message,
    dismiss: sonnerToast.dismiss,
  }
);

// Named convenience helpers (backward compat)
export function brandedToast(
  memberName: string,
  message: string,
  type: 'success' | 'info' | 'error' = 'success',
) {
  const toastFn = type === 'error' ? sonnerToast.error : type === 'info' ? sonnerToast.info : sonnerToast.success;
  toastFn(message, { icon: getAvatar(memberName) });
}

export const toastSophia = (msg: string) => brandedToast('Sophia', msg, 'success');
export const toastLuna = (msg: string) => brandedToast('Luna', msg, 'success');
export const toastSienna = (msg: string) => brandedToast('Sienna', msg, 'success');
export const toastKenji = (msg: string) => brandedToast('Kenji', msg, 'success');
