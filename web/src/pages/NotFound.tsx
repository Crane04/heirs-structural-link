export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-6 text-center">
      <p className="text-teal text-6xl font-bold mb-4">404</p>
      <p className="text-white text-xl font-bold mb-2">Claim not found</p>
      <p className="text-white/40 text-sm">
        This link may have expired or is invalid. Please contact Heirs Insurance for assistance.
      </p>
    </div>
  );
}
