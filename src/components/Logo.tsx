interface LogoProps {
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className = "h-8 w-auto", onClick }: LogoProps) {
  return (
    <img 
      src="/logo.jpeg" 
      alt="UTU Constructora" 
      className={`object-contain ${className} ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    />
  );
}
