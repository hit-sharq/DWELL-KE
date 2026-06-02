export function showError(message?: string | unknown) {
  console.error('Error:', typeof message === 'string' ? message : message instanceof Error ? message.message : 'Unknown error');
  return false;
}

export function showSuccess(message?: string) {
  console.log('Success:', message);
  return true;
}