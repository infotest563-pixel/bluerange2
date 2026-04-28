'use client';

import { useState } from 'react';
import Link from 'next/link';

interface MenuItem {
    title: string;
    url: string;
    children?: MenuItem[];
}

interface DeskSidebarProps {
    menuItems: MenuItem[];
}

export default function DeskSidebar({ menuItems }: DeskSidebarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});

    const toggleSubmenu = (index: number) => {
        setOpenSubmenus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const close = () => setIsOpen(false);

    return (
        <>
            {/* Hamburger button — inline SVG, always visible */}
            <button
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
                type="button"
                style={{
                    background: '#50c1ed',
                    border: '1px solid #50c1ed',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    marginLeft: '8px',
                    padding: '8px 8px',
                    lineHeight: 0,
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                }}
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 20 18" fill="none">
  <rect x="0" y="0" width="20" height="2" rx="1" fill="#fff"/>
  <rect x="0" y="8" width="20" height="2" rx="1" fill="#fff"/>
  <rect x="0" y="16" width="20" height="2" rx="1" fill="#fff"/>
</svg>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    onClick={close}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1040,
                    }}
                />
            )}

            {/* Sidebar panel — slides from RIGHT */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '280px',
                    height: '100vh',
                    backgroundColor: '#fff',
                    boxShadow: '-2px 0 12px rgba(0,0,0,0.18)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 1050,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Close button */}
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #eee', flexShrink: 0 }}>
                    <button
                        onClick={close}
                        aria-label="Close menu"
                        style={{
                            background: '#3bb8d8',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, fontFamily: '"Consid Sans", sans-serif' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {menuItems.map((item, index) => {
                            const hasChildren = !!(item.children && item.children.length > 0);
                            const submenuOpen = !!openSubmenus[index];

                            return (
                                <li key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <Link
                                            href={item.url}
                                            onClick={() => { if (!hasChildren) close(); }}
                                            style={{
                                                flex: 1,
                                                display: 'block',
                                                padding: '14px 20px',
                                                color: '#222',
                                                textDecoration: 'none',
                                                fontSize: '16px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {item.title}
                                        </Link>
                                        {hasChildren && (
                                            <button
                                                onClick={() => toggleSubmenu(index)}
                                                aria-label={submenuOpen ? 'Collapse' : 'Expand'}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '14px 18px',
                                                    fontSize: '11px',
                                                    color: '#555',
                                                    lineHeight: 1,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {submenuOpen ? '▲' : '▼'}
                                            </button>
                                        )}
                                    </div>

                                    {hasChildren && submenuOpen && (
                                        <ul style={{
                                            listStyle: 'none',
                                            margin: 0,
                                            padding: '4px 0 4px 0',
                                            backgroundColor: '#f7f7f7',
                                        }}>
                                            {item.children!.map((child, ci) => (
                                                <li key={ci}>
                                                    <Link
                                                        href={child.url}
                                                        onClick={close}
                                                        style={{
                                                            display: 'block',
                                                            padding: '10px 20px 10px 36px',
                                                            color: '#444',
                                                            textDecoration: 'none',
                                                            fontSize: '14px',
                                                            borderBottom: '1px solid #ececec',
                                                        }}
                                                    >
                                                        {child.title}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </>
    );
}
