'use client';

import { Bot } from 'lucide-react';
import { useI18nStore } from '@/store/useI18nStore';

export function Footer() {
  const { t } = useI18nStore();
  
  return (
    <footer className="bg-background border-t py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-primary rounded-lg shadow-md shadow-primary/20">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CareBot-MH</span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} CareBot Mental Health Systems. {t('landing.footer.rights', 'All rights reserved.')}
          </p>

          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.links.privacy', 'Privacy Policy')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.links.terms', 'Terms of Service')}</a>
            <a href="#" className="hover:text-primary transition-colors">{t('landing.footer.links.contact', 'Contact Support')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
