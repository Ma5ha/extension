import { useEffect, useRef, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import styles from '../App.module.css';

export function Dialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current!;
    dialog.showModal();
    return () => { dialog.close(); if (previous instanceof HTMLElement) previous.focus(); };
  }, []);
  return <dialog ref={ref} className={styles.dialog} onCancel={event => { event.preventDefault(); close(); }} aria-labelledby="dialog-title">
    <header className={styles.panelHeader}><h2 id="dialog-title">{title}</h2><button onClick={close} aria-label="Zatvori"><X size={20} /></button></header>
    {children}
  </dialog>;
}
