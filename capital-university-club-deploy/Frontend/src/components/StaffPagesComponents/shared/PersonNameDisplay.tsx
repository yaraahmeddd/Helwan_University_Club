import { cn } from '@/lib/utils';
import { buildPersonName, type DisplayLanguage, type PersonNameFields } from '@/lib/localizedDisplay';
import { ProfileAvatar } from './ProfileAvatar';

type PersonNameDisplayProps = {
  id: string | number;
  names: PersonNameFields;
  language: DisplayLanguage;
  photoUrl?: string | null;
  showAvatar?: boolean;
  avatarSize?: 'xs' | 'sm' | 'md';
  primaryClassName?: string;
  secondaryClassName?: string;
  className?: string;
  trailing?: React.ReactNode;
  fallback?: string;
};

export function PersonNameDisplay({
  id: _id,
  names,
  language,
  photoUrl,
  showAvatar = true,
  avatarSize = 'sm',
  primaryClassName,
  secondaryClassName,
  className,
  trailing,
  fallback = '—',
}: PersonNameDisplayProps) {
  const { primary, secondary } = buildPersonName(names, language);
  const avatarSizeMap = { xs: 'xs' as const, sm: 'sm' as const, md: 'md' as const };

  return (
    <div className={cn('flex items-center gap-2.5 min-w-0', className)}>
      {showAvatar && (
        <ProfileAvatar
          photoUrl={photoUrl}
          size={avatarSizeMap[avatarSize]}
        />
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className={cn(
              'font-semibold leading-tight truncate max-w-[180px] text-sm',
              primaryClassName,
            )}
          >
            {primary || fallback}
          </p>
          {trailing}
        </div>
        {secondary && (
          <p
            className={cn(
              'text-xs text-muted-foreground truncate max-w-[180px]',
              secondaryClassName,
            )}
            dir="ltr"
          >
            {secondary}
          </p>
        )}
      </div>
    </div>
  );
}
