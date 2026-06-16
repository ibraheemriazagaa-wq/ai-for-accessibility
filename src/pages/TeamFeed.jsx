import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { GitCommit, Plus, Trash2, ExternalLink, RefreshCw, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeamFeed() {
  const [commits, setCommits] = useState([]);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [owner, setOwner] = useState("");
  const [repoName, setRepoName] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchAll = async () => {
    try {
      const [reposRes, commitsRes] = await Promise.all([
        base44.entities.TrackedRepo.list(),
        base44.functions.invoke("fetchGithubCommits", {}),
      ]);
      setRepos(reposRes);
      setCommits(commitsRes.data.commits || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await base44.functions.invoke("fetchGithubCommits", {});
      setCommits(res.data.commits || []);
    } catch (_) {}
    setSyncing(false);
  };

  const handleAddRepo = async () => {
    if (!owner.trim() || !repoName.trim()) return;
    setAdding(true);
    try {
      await base44.entities.TrackedRepo.create({ owner: owner.trim(), repo: repoName.trim() });
      setOwner("");
      setRepoName("");
      setShowAdd(false);
      const [reposRes, commitsRes] = await Promise.all([
        base44.entities.TrackedRepo.list(),
        base44.functions.invoke("fetchGithubCommits", {}),
      ]);
      setRepos(reposRes);
      setCommits(commitsRes.data.commits || []);
    } catch (_) {}
    setAdding(false);
  };

  const handleRemoveRepo = async (id) => {
    await base44.entities.TrackedRepo.delete(id);
    setRepos((prev) => prev.filter((r) => r.id !== id));
    const res = await base44.functions.invoke("fetchGithubCommits", {});
    setCommits(res.data.commits || []);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <GitCommit className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold text-foreground">Team Feed</h2>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="rounded-xl gap-1.5 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tracked Repos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-sm text-foreground">Tracked Repositories</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)} className="rounded-xl gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>

          <AnimatePresence>
            {showAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-2">
                  <Input
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="owner (e.g. facebook)"
                    className="rounded-lg text-sm h-9 flex-1"
                  />
                  <span className="text-muted-foreground self-center text-sm hidden sm:block">/</span>
                  <Input
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    placeholder="repo (e.g. react)"
                    className="rounded-lg text-sm h-9 flex-1"
                  />
                  <Button onClick={handleAddRepo} disabled={adding || !owner.trim() || !repoName.trim()} size="sm" className="rounded-lg">
                    {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Track"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {repos.length === 0 && (
            <p className="text-xs text-muted-foreground">No repos tracked yet. Add one to start seeing commits.</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {repos.map((repo) => (
              <span key={repo.id} className="inline-flex items-center gap-1.5 bg-muted text-foreground rounded-full px-3 py-1 text-xs">
                <Globe className="w-3 h-3 text-muted-foreground" />
                {repo.owner}/{repo.repo}
                <button onClick={() => handleRemoveRepo(repo.id)} className="text-muted-foreground hover:text-destructive ml-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Commit Feed */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : commits.length === 0 ? (
          <div className="text-center py-16">
            <GitCommit className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No commits yet. Add a repo above and hit Sync.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {commits.map((commit, i) => (
              <motion.a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
              >
                {commit.authorAvatar ? (
                  <img src={commit.authorAvatar} alt="" className="w-7 h-7 rounded-full mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <GitCommit className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium truncate group-hover:text-primary transition-colors">
                    {commit.message}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{commit.author}</span>
                    <span>·</span>
                    <span className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">{commit.repo}</span>
                    <span>·</span>
                    <span>{formatDate(commit.date)}</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1.5" />
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}