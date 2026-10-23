import { createContext, useContext, useState, type ReactNode } from 'react';
export const workspaces = [{ id: 'work', name: 'Work' }, { id: 'personal', name: 'Personal' }, { id: 'study', name: 'Study' }] as const;
export type WorkspaceId = typeof workspaces[number]['id'];
export const validWorkspace = (value: unknown): WorkspaceId => workspaces.find(w => w.id === value)?.id ?? 'work';
export function workspaceKey(key: string, workspace: WorkspaceId) { return workspace === 'work' ? key : `tabora.workspace.${workspace}.${key}`; }
const Context = createContext<{ workspace: WorkspaceId; select: (id: WorkspaceId) => void }>({ workspace: 'work', select: () => {} });
export const useWorkspace = () => useContext(Context);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceId>(() => { try { return validWorkspace(sessionStorage.getItem('tabora.workspace')); } catch { return 'work'; } });
  function select(id: WorkspaceId) {
    if (id === workspace) return;
    if (document.querySelector('[data-unsaved="true"]') && !window.confirm('Switch workspace and discard unsaved edits?')) return;
    try { sessionStorage.setItem('tabora.workspace', id); } catch { /* The selection still works for this page. */ }
    setWorkspace(id);
  }
  return <Context.Provider value={{ workspace, select }}>{children}</Context.Provider>;
}
export function WorkspacePicker() {
  const { workspace, select } = useWorkspace();
  return <label style={{ display: 'grid', gap: 6, marginBottom: 16 }}>Workspace<select aria-label="Workspace" value={workspace} onChange={e => select(validWorkspace(e.target.value))} style={{ width: '100%', minWidth: 0, padding: '5px 8px', border: '1px solid var(--material-border)', borderRadius: 8 }}>{workspaces.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>;
}
