import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZE_CLASSES = {
  xs: 'w-7 h-7',
  sm: 'w-9 h-9',
  md: 'w-11 h-11',
  lg: 'w-14 h-14',
  xl: 'w-20 h-24',
} as const;

const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
} as const;

type ProfileAvatarProps = {
  photoUrl?: string | null;
  alt?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  rounded?: 'full' | 'xl';
};

/** Profile image when available; otherwise a neutral user icon (no initials). */
export function ProfileAvatar({
  photoUrl,
  alt = '',
  size = 'sm',
  className,
  rounded = 'full',
}: ProfileAvatarProps) {
  const roundedCls = rounded === 'xl' ? 'rounded-xl' : 'rounded-full';

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={alt}
        className={cn(
          SIZE_CLASSES[size],
          roundedCls,
          'object-cover border border-border shrink-0 bg-background',
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        SIZE_CLASSES[size],
        roundedCls,
        'bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0 border border-border',
        className,
      )}
      aria-hidden={!alt}
    >
      <User size={ICON_SIZES[size]} strokeWidth={1.75} />
    </div>
  );
}
