import React from 'react';
import { render } from '@testing-library/react';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard } from '../Skeleton';

describe('Skeleton', () => {
  it('renders with default props', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse', 'bg-gray-200', 'rounded');
  });

  it('renders with custom variant', () => {
    const { container } = render(<Skeleton variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('renders with custom size', () => {
    const { container } = render(<Skeleton size="lg" />);
    const skeleton = container.firstChild as HTMLElement;
    
    expect(skeleton).toHaveClass('h-6');
  });

  it('renders multiple lines when specified', () => {
    const { container } = render(<Skeleton lines={3} />);
    const lines = container.querySelectorAll('.animate-pulse');
    
    expect(lines).toHaveLength(3);
  });
});

describe('SkeletonText', () => {
  it('renders with default lines', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('.animate-pulse');
    
    expect(lines).toHaveLength(3);
  });

  it('renders with custom lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('.animate-pulse');
    
    expect(lines).toHaveLength(5);
  });
});

describe('SkeletonAvatar', () => {
  it('renders with default size', () => {
    const { container } = render(<SkeletonAvatar />);
    const avatar = container.firstChild as HTMLElement;
    
    expect(avatar).toHaveClass('w-12', 'h-12');
  });

  it('renders with custom size', () => {
    const { container } = render(<SkeletonAvatar size="lg" />);
    const avatar = container.firstChild as HTMLElement;
    
    expect(avatar).toHaveClass('w-16', 'h-16');
  });
});

describe('SkeletonCard', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('p-4', 'border', 'border-gray-200', 'rounded-lg', 'bg-white');
  });
}); 