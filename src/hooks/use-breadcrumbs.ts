import { useMatches } from '@tanstack/react-router';
import React from 'react';

// A mock breadcrumb function - in a real app, you'd have a more robust way
// to get the breadcrumb text for a given path.
const getBreadcrumbName = (pathname: string): string => {
  if (pathname === '/') return 'Home';
  const name = pathname.split('/').filter(Boolean).pop() ?? 'Home';
  return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
};

export function useBreadcrumbs() {
  const matches = useMatches();

  const breadcrumbs = React.useMemo(() => {
    return matches
      // first match is the root layout, we don't need it
      .slice(1)
      .map((match) => {
        const { pathname } = match;
        return {
          label: getBreadcrumbName(pathname),
          path: pathname,
        };
      });
  }, [matches]);

  return breadcrumbs;
} 