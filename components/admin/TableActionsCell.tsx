'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';

export interface TableActionsCellProps<T = any> {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function TableActionsCell<T = any>({
  item,
  onView,
  onEdit,
  onDelete,
}: TableActionsCellProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  }>({ right: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const right = Math.max(8, window.innerWidth - rect.right);

      // If space below is less than 160px (e.g. last rows of table), open upwards
      if (spaceBelow < 160) {
        setMenuPosition({
          bottom: window.innerHeight - rect.top + 4,
          right,
        });
      } else {
        setMenuPosition({
          top: rect.bottom + 4,
          right,
        });
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
        title="More actions"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          style={{
            position: 'fixed',
            ...(menuPosition.top !== undefined && { top: `${menuPosition.top}px` }),
            ...(menuPosition.bottom !== undefined && { bottom: `${menuPosition.bottom}px` }),
            right: `${menuPosition.right}px`,
          }}
          className="w-32 rounded-xl bg-white border border-neutral-300 shadow-2xl py-1 z-[9999] animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onView?.(item);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-neutral-100 transition-colors text-left cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-neutral-700" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onEdit?.(item);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-900 hover:bg-amber-50 hover:text-amber-900 transition-colors text-left cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-700" />
            <span>Edit</span>
          </button>

          <div className="my-1 border-t border-neutral-200" />

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onDelete?.(item);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default TableActionsCell;
