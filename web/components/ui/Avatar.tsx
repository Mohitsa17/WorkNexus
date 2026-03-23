import React, { memo } from 'react';

type AvatarProps = {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  color?: string;
};

export const Avatar = memo(function Avatar({ name, avatarUrl, size = 32, className = '', color = '#6366f1' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || '?';

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 bg-cover bg-center ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: avatarUrl ? 'transparent' : color,
        backgroundImage: avatarUrl ? `url(${avatarUrl})` : 'none',
      }}
      title={name}
    >
      {!avatarUrl && initials}
    </div>
  );
});
