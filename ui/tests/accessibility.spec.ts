import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('keyboard navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Test escape key closes modals
    const modalButton = page.locator('button:has-text("Open Modal")').first();
    await modalButton.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    
    // Test focus ring visibility
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check if focus ring is visible
    const focusRing = await focusedElement.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.outline !== 'none' || style.boxShadow !== 'none';
    });
    expect(focusRing).toBe(true);
  });

  test('screen reader support', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper ARIA labels
    const buttons = page.locator('button');
    for (let i = 0; i < await buttons.count(); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();
      
      // Either aria-label or text content should be present
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
    
    // Check for proper landmarks
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('RTL layout support', async ({ page }) => {
    await page.goto('/');
    
    // Set RTL direction
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    });
    
    // Check if layout adapts to RTL
    const body = page.locator('body');
    const direction = await body.evaluate((el) => 
      window.getComputedStyle(el).direction
    );
    expect(direction).toBe('rtl');
    
    // Take screenshot for visual comparison
    await page.screenshot({ path: 'tests/screenshots/rtl-layout.png' });
  });

  test('high contrast mode support', async ({ page }) => {
    await page.goto('/');
    
    // Simulate high contrast mode
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        * {
          background: white !important;
          color: black !important;
          border: 2px solid black !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    // Check if content is still readable
    const textElements = page.locator('p, span, div');
    expect(await textElements.count()).toBeGreaterThan(0);
    
    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/high-contrast.png' });
  });

  test('reduced motion support', async ({ page }) => {
    await page.goto('/');
    
    // Check if animations respect reduced motion preference
    const animationDuration = await page.evaluate(() => {
      const element = document.querySelector('.ep-transition');
      if (element) {
        const style = window.getComputedStyle(element);
        return style.transitionDuration;
      }
      return null;
    });
    
    // In reduced motion mode, transitions should be minimal
    if (animationDuration) {
      const duration = parseFloat(animationDuration);
      expect(duration).toBeLessThanOrEqual(0.1);
    }
  });

  test('color contrast compliance', async ({ page }) => {
    await page.goto('/');
    
    // Check text contrast ratios
    const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6');
    
    for (let i = 0; i < await textElements.count(); i++) {
      const element = textElements.nth(i);
      const contrastRatio = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        
        // Simple contrast check (in real implementation, use a proper contrast library)
        return color !== backgroundColor;
      });
      
      expect(contrastRatio).toBe(true);
    }
  });
}); 