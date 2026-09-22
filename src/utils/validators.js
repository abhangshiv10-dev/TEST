import Swal from 'sweetalert2';

export const validateRequired = (value, fieldName = 'This field') => {
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'Amount') => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

export const validateMobile = (mobile) => {
  if (!mobile) return null; // optional
  const clean = mobile.replace(/[\s-]/g, '');
  if (!/^[6-9]\d{9}$/.test(clean) && !/^\+91[6-9]\d{9}$/.test(clean)) {
    return 'Please enter a valid 10-digit mobile number';
  }
  return null;
};

export const showSuccessToast = (message) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon: 'success',
    title: message
  });
};

export const showErrorAlert = (message, title = 'Error') => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: message,
    confirmButtonColor: '#0c8fe6'
  });
};

export const showConfirmDialog = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone.',
  confirmButtonText = 'Yes, delete it',
  cancelButtonText = 'Cancel',
  icon = 'warning'
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText,
    cancelButtonText,
    reverseButtons: true,
    customClass: {
      popup: 'rounded-2xl',
      confirmButton: 'rounded-xl px-5 py-2.5 font-medium',
      cancelButton: 'rounded-xl px-5 py-2.5 font-medium'
    }
  });

  return result.isConfirmed;
};
