'use client';

interface NavIconProps {
    d: string;
    size?: number;
    color?: string;
    title?: string;
}

export default function NavIcon({
    d,
    size = 16,
    color = 'currentColor',
    title
}: NavIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            aria-hidden={!title}
            role={title ? 'img' : undefined}
            style={{ display: 'block', flexShrink: 0 }}
        >
            {title && <title>{title}</title>}
            <path d={d} />
        </svg>
    );
}