import { useEffect } from 'react';

type PageMetaProps = {
  title: string;
  description?: string;
  robots?: string;
};

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function PageMeta({ title, description, robots = 'index,follow' }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
    if (description) upsertMeta('description', description);
    upsertMeta('robots', robots);
  }, [description, robots, title]);

  return null;
}
