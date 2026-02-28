import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    localePrefix: 'as-needed' // URL'de tr görünmez, sadece en görünür
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
