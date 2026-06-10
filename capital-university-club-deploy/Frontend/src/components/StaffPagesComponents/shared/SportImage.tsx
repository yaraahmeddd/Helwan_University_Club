import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { resolveSportImageForSport } from '../../../lib/sportImageUrl';
import { cn } from '../../../lib/utils';

type SportImageSize = 'table' | 'banner' | 'upload';

const sizeStyles: Record<SportImageSize, { container: string; image: string }> = {
  table: {
    container: 'h-16 w-24',
    image: 'max-h-14 max-w-[5.5rem]',
  },
  banner: {
    container: 'h-44 w-full',
    image: 'max-h-40 max-w-full',
  },
  upload: {
    container: 'min-h-[200px] w-full',
    image: 'max-h-[188px] max-w-full',
  },
};

export interface SportImageProps {
  src?: string | null;
  nameEn?: string | null;
  alt: string;
  size?: SportImageSize;
  className?: string;
  containerClassName?: string;
}

export function SportImage({
  src,
  nameEn,
  alt,
  size = 'table',
  className,
  containerClassName,
}: SportImageProps) {
  const [err, setErr] = useState(false);
  const resolved = resolveSportImageForSport(src, nameEn);
  const styles = sizeStyles[size];

  if (!resolved || err) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-border/50 bg-muted/40',
          styles.container,
          containerClassName,
        )}
      >
        <ImageOff className="h-5 w-5 text-muted-foreground opacity-50" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border border-border/50 bg-muted/30 p-2',
        styles.container,
        containerClassName,
      )}
    >
      <img
        src={resolved}
        alt={alt}
        onError={() => setErr(true)}
        className={cn('object-contain', styles.image, className)}
      />
    </div>
  );
}
