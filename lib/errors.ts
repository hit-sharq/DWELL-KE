export function showError(message: string) {
  console.error('Error:', message);
  // In a real app, this might show a toast notification or update state
  return false;
}

export function showSuccess(message: string) {
  console.log('Success:', message);
  // In a real app, this might show a toast notification or update state
  return true;
}