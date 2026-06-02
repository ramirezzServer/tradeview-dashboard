import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FallbackImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackClassName?: string;
}

export function FallbackImage({ alt, className, fallbackClassName, ...props }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !props.src) {
    return (
      <div
        className={cn('flex items-center justify-center bg-secondary/30 text-muted-foreground/35', className, fallbackClassName)}
        role="img"
        aria-label={alt}
      >
        <ImageOff className="h-4 w-4" aria-hidden="true" />
      </div>
    );
  }

  return <img {...props} alt={alt} className={className} onError={() => setFailed(true)} />;
}
