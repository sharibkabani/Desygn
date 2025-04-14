import Image from "next/image";

interface LoadingProps {
  /**
   * Optional message to display below the spinner
   */
  message?: string;
  /**
   * Size of the loading spinner (default: "default")
   */
  size?: "small" | "default" | "large";
}

export function Loading({ message, size = "default" }: LoadingProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const textSizeClasses = {
    small: "text-sm",
    default: "text-base",
    large: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
      <div className="relative">
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/icon.png"
            alt="Desygn Logo"
            width={size === "small" ? 16 : size === "large" ? 32 : 24}
            height={size === "small" ? 16 : size === "large" ? 32 : 24}
          />
        </div>

        {/* Spinner */}
        <div
          className={`${sizeClasses[size]} rounded-full border-2 border-white/10 border-t-purple-500 border-r-blue-500 animate-spin`}
        ></div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl"></div>
      </div>

      {message && (
        <p className={`mt-4 text-white/70 ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
}

export function FullPageLoading({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[#1a1c20] flex flex-col items-center justify-center z-50">
      <div className="relative">
        <Loading size="large" message={message} />
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
