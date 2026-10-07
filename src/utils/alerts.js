import Swal from 'sweetalert2';
import { translate } from '../i18n';

// Thin wrappers around SweetAlert2 so that every popup uses the selected language,
// including the default buttons (which SweetAlert2 would otherwise show as "OK" / "Cancel").

const base = () => ({
  confirmButtonText: translate('common.ok'),
  cancelButtonText: translate('common.cancel')
});

/** Small corner message that disappears by itself */
export function toast(icon, title, timer = 2000) {
  return Swal.fire({
    toast: true,
    position: 'center',
    icon,
    title,
    showConfirmButton: false,
    customClass: { popup: 'center-toast' },
    timer
  });
}

/** Popup with an OK button. type: 'error' | 'warning' | 'success' | 'info' */
export function alertBox(icon, title, text, extra = {}) {
  return Swal.fire({ ...base(), icon, title, text, ...extra });
}

/** "Are you sure?" popup. Resolves to true when the user confirms. */
export async function confirmDelete({ title, html }) {
  const result = await Swal.fire({
    ...base(),
    title,
    html,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#0f172a',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: translate('common.delete')
  });
  return result.isConfirmed;
}

/** Generic confirmation popup (edit / status change). Resolves to true when the user confirms. */
export async function confirmAction({ title, html, confirmText }) {
  const result = await Swal.fire({
    ...base(),
    title,
    html,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#0f172a',
    cancelButtonColor: '#94a3b8',
    confirmButtonText: confirmText || translate('common.yes')
  });
  return result.isConfirmed;
}
