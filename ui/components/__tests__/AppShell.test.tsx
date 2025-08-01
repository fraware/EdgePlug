import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppShell } from '../AppShell';

describe('AppShell', () => {
  it('renders with default props', () => {
    render(
      <AppShell>
        <div>Test content</div>
      </AppShell>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('EdgePlug')).toBeInTheDocument();
  });

  it('renders without left rail when showLeftRail is false', () => {
    render(
      <AppShell showLeftRail={false}>
        <div>Test content</div>
      </AppShell>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders without top bar when showTopBar is false', () => {
    render(
      <AppShell showTopBar={false}>
        <div>Test content</div>
      </AppShell>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.queryByText('EdgePlug')).not.toBeInTheDocument();
  });

  it('renders without inspector when showInspector is false', () => {
    render(
      <AppShell showInspector={false}>
        <div>Test content</div>
      </AppShell>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
}); 