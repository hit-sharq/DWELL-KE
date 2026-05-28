import { GlassmorphicCard } from '@/components/GlassmorphicCard';

type ErrorAlertProps = {
  message: string;
  className?: string;
};

export default function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <GlassmorphicCard className={`border-red-400/20 bg-red-500/5 mb-8 ${className}`}>
      <p className="text-red-400 text-sm">{message}</p>
    </GlassmorphicCard>
  );
}