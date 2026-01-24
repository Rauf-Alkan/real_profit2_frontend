'use client';

import React, { useState, useEffect } from 'react';
import { CalloutCard } from '@shopify/polaris';

interface ReviewNudgeProps {
  appHandle: string;
}

export const ReviewNudge: React.FC<ReviewNudgeProps> = ({ appHandle }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Kurulum tarihini kontrol et (Yeni anahtar: realprofit_...)
    let installDate = localStorage.getItem('realprofit_install_date');
    if (!installDate) {
      installDate = Date.now().toString();
      localStorage.setItem('realprofit_install_date', installDate);
    }

    // 2. Kapatılma durumunu kontrol et
    const dismissStatus = localStorage.getItem('realprofit_review_status');
    const snoozeUntil = localStorage.getItem('realprofit_review_snooze_until');

    const now = Date.now();
    const daysSinceInstall = (now - parseInt(installDate)) / (1000 * 60 * 60 * 24);

    // MANTIK:
    // A. Kalıcı kapatılmışsa gösterme.
    if (dismissStatus === 'permanent') return;

    // B. Erteleme süresi henüz dolmadıysa gösterme.
    if (dismissStatus === 'snoozed' && snoozeUntil && now < parseInt(snoozeUntil)) return;

    // C. Uygulama yükleneli 3 günden az olduysa gösterme (Finansal veriler biriksin).
    if (daysSinceInstall < 3) return;

    setIsVisible(true);
  }, []);

  const handlePermanentDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('realprofit_review_status', 'permanent');
  };

  const handleSnooze = () => {
    setIsVisible(false);
    const sevenDaysLater = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('realprofit_review_status', 'snoozed');
    localStorage.setItem('realprofit_review_snooze_until', sevenDaysLater.toString());
  };

  const handlePrimaryAction = () => {
    const reviewUrl = `https://apps.shopify.com/${appHandle}?#modal-show=ReviewListingModal`;
    window.open(reviewUrl, '_blank');
    handlePermanentDismiss();
  };

  if (!isVisible) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <CalloutCard
        title="Is RealProfit providing clear insights? 📈"
        illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
        primaryAction={{
          content: 'Leave a Review',
          onAction: handlePrimaryAction,
        }}
        secondaryAction={{
          content: 'Maybe later',
          onAction: handleSnooze,
        }}
        onDismiss={handlePermanentDismiss}
      >
        <p>
          We are committed to helping you scale profitably. If RealProfit has helped you understand your numbers better, we'd truly appreciate a review!
        </p>
      </CalloutCard>
    </div>
  );
};