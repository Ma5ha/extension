import { useCallback, useEffect, useRef, useState } from 'react';
import { deleteLocal, listLocal, subscribeLocal, writeLocal } from '../local/store';
import { allowFeed, fetchFeed, savedPrefix, sourcePrefix } from './adapter';
import { feedUrl, parseArticle, parseStoredFeed, type Article, type Feed } from './model';
export function useNews() {
  const [feeds, setFeeds] = useState<Feed[]>([]), [saved, setSaved] = useState<Article[]>([]);
  const [ready, setReady] = useState(false), [error, setError] = useState('');
  const [loading, setLoading] = useState<string[]>([]), [failures, setFailures] = useState<Record<string, string>>({});
  const requests = useRef(new Map<string, AbortController>());
  const mounted = useRef(true);
  const reload = useCallback(async () => {
    try {
      const [sources, articles] = await Promise.all([listLocal(sourcePrefix), listLocal(savedPrefix)]);
      if (!mounted.current) return;
      setFeeds(sources.map(parseStoredFeed).filter((f): f is Feed => !!f));
      setSaved(articles.map(parseArticle).filter((a): a is Article => !!a)); setReady(true);
    } catch { if (mounted.current) setError('Could not read saved news. Try reopening News.'); }
  }, []);
  useEffect(() => {
    mounted.current = true; void reload(); const stop = subscribeLocal('tabora.news.', () => void reload());
    const pending = requests.current;
    return () => { mounted.current = false; stop(); for (const request of pending.values()) request.abort(); pending.clear(); };
  }, [reload]);
  async function refresh(feed: Feed, grant = false) {
    if (requests.current.has(feed.id)) return;
    const controller = new AbortController(); requests.current.set(feed.id, controller);
    setLoading(items => [...items, feed.id]); setFailures(items => ({ ...items, [feed.id]: '' }));
    try {
      if (grant) await allowFeed(feed.url);
      const data = await fetchFeed(feed.url, controller.signal);
      if (!controller.signal.aborted) await writeLocal(sourcePrefix + feed.id, { ...feed, ...data, updated: Date.now() });
    } catch (e) { if (!controller.signal.aborted && mounted.current) setFailures(items => ({ ...items, [feed.id]: e instanceof Error ? e.message : 'Could not update this feed. Try again.' })); }
    finally { requests.current.delete(feed.id); if (mounted.current) setLoading(items => items.filter(id => id !== feed.id)); }
  }
  async function add(raw: string) {
    setError('');
    try {
      const url = feedUrl(raw);
      if (feeds.some(f => f.url === url)) throw new Error('This source is already added.');
      if (feeds.length >= 20) throw new Error('You can add up to 20 sources. Remove one before adding another.');
      // Keep the permission request in the submit gesture, before storage/network work.
      await allowFeed(url);
      const feed: Feed = { id: crypto.randomUUID(), url, title: new URL(url).hostname, articles: [], updated: 0 };
      await writeLocal(sourcePrefix + feed.id, feed); await reload(); await refresh(feed); return true;
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not add this source. Try again.'); return false; }
  }
  async function remove(feed: Feed) {
    requests.current.get(feed.id)?.abort();
    try { await deleteLocal(sourcePrefix + feed.id); await reload(); } catch { setError('Could not remove this source. Try again.'); }
  }
  async function toggleSaved(article: Article) {
    const key = savedPrefix + encodeURIComponent(article.url);
    try {
      if (saved.some(a => a.url === article.url)) await deleteLocal(key);
      else { if (saved.length >= 200) throw new Error('You can save up to 200 articles. Remove a saved article first.'); await writeLocal(key, article); }
      await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not save this article. Try again.'); }
  }
  return { feeds, saved, ready, error, loading, failures, add, refresh, remove, toggleSaved };
}
