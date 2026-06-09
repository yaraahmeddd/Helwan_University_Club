import { cn } from '@/lib/utils';
import {
  getLocalizedText,
  getSecondaryText,
  type DisplayLanguage,
  type EntityNameFields,
} from '@/lib/localizedDisplay';

type BilingualTextProps = {
  ar?: string | null;
  en?: string | null;
  language: DisplayLanguage;
  primaryClassName?: string;
  secondaryClassName?: string;
  className?: string;
  fallback?: string;
};

/** Renders primary localized text only (no cross-language subtitle in admin UI). */
export function BilingualText({
  ar,
  en,
  language,
  primaryClassName,
  secondaryClassName,
  className,
  fallback = '—',
}: BilingualTextProps) {
  const primary = getLocalizedText(ar, en, language);
  const secondary = getSecondaryText(ar, en, language);

  return (
    <div className={cn('min-w-0', className)}>
      <p className={cn('leading-tight truncate', primaryClassName)}>
        {primary || fallback}
      </p>
      {secondary && (
        <p
          className={cn(
            'text-[10px] text-muted-foreground truncate',
            secondaryClassName,
          )}
          dir="ltr"
        >
          {secondary}
        </p>
      )}
    </div>
  );
}

type EntityNameTextProps = {
  entity: EntityNameFields | null | undefined;
  language: DisplayLanguage;
  primaryClassName?: string;
  secondaryClassName?: string;
  className?: string;
  fallback?: string;
};

export function EntityNameText({
  entity,
  language,
  ...rest
}: EntityNameTextProps) {
  return (
    <BilingualText
      ar={entity?.name_ar}
      en={entity?.name_en}
      language={language}
      {...rest}
    />
  );
}
