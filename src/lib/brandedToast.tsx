import { toast } from 'sonner';
import { TEAM_MEMBERS } from '@/data/teamData';

function findMember(name: string) {
  return TEAM_MEMBERS.find(m => m.name === name)!;
}

/**
 * Show a sonner toast with a team member's avatar prepended.
 */
export function brandedToast(
  memberName: string,
  message: string,
  type: 'success' | 'info' | 'error' = 'success',
) {
  const member = findMember(memberName);
  const toastFn = type === 'error' ? toast.error : type === 'info' ? toast.info : toast.success;

  toastFn(message, {
    icon: (
      <img
        src={member.avatar}
        alt={member.name}
        className="w-5 h-5 rounded-full object-cover flex-shrink-0"
      />
    ),
  });
}

// Convenience helpers mapped to specific team members
export const toastSophia = (msg: string) => brandedToast('Sophia', msg, 'success');
export const toastLuna = (msg: string) => brandedToast('Luna', msg, 'success');
export const toastSienna = (msg: string) => brandedToast('Sienna', msg, 'success');
export const toastKenji = (msg: string) => brandedToast('Kenji', msg, 'success');
