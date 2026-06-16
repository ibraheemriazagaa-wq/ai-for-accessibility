import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    // Allow scheduled/system execution without user auth
    if (!user) {
      // Service-role only path for scheduled automations
      const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");
      const repos = await base44.entities.TrackedRepo.list();
      const allCommits = [];
      for (const repo of repos) {
        try {
          const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?per_page=5`;
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'User-Agent': 'Base44-App' },
          });
          if (!response.ok) continue;
          const commits = await response.json();
          for (const commit of commits) {
            allCommits.push({
              sha: commit.sha,
              repo: `${repo.owner}/${repo.repo}`,
              message: commit.commit.message.split('\n')[0],
              author: commit.commit.author.name,
              authorAvatar: commit.author?.avatar_url || '',
              date: commit.commit.author.date,
              url: commit.html_url,
            });
          }
        } catch (_) {}
      }
      allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));
      return Response.json({ commits: allCommits.slice(0, 50) });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection("github");
    const repos = await base44.asServiceRole.entities.TrackedRepo.list();
    
    const allCommits = [];
    for (const repo of repos) {
      try {
        const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/commits?per_page=10`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
            'User-Agent': 'Base44-App',
          },
        });
        
        if (!response.ok) continue;
        
        const commits = await response.json();
        for (const commit of commits) {
          allCommits.push({
            sha: commit.sha,
            repo: `${repo.owner}/${repo.repo}`,
            message: commit.commit.message.split('\n')[0],
            author: commit.commit.author.name,
            authorAvatar: commit.author?.avatar_url || '',
            date: commit.commit.author.date,
            url: commit.html_url,
          });
        }
      } catch (_) {
        // skip repos that fail
      }
    }

    // Sort all commits by date descending
    allCommits.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Trim to most recent 50
    return Response.json({ commits: allCommits.slice(0, 50) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});