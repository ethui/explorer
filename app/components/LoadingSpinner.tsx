export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="!border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
    </div>
  );
}
