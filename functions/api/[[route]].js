const json = (d, s = 200, h = {}) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", ...h } });
const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export async function onRequest({ request, env, params }) {
  const p = params.route || [];
  const m = request.method;
  const db = env.DB;
  const now = Date.now();

  try {
    // ---------- Admin (password required) ----------
    if (p[0] === "admin") {
      if (!env.ADMIN_PASSWORD || request.headers.get("x-admin-key") !== env.ADMIN_PASSWORD)
        return json({ error: "Wrong password" }, 401);

      if (p[1] === "stories" && m === "GET" && !p[2]) {
        const r = await db.prepare("SELECT id,title,status,created_at,published_at FROM stories ORDER BY created_at DESC").all();
        return json(r.results);
      }
      if (p[1] === "stories" && m === "GET" && p[2]) {
        const s = await db.prepare("SELECT * FROM stories WHERE id=?").bind(p[2]).first();
        return s ? json(s) : json({ error: "Not found" }, 404);
      }
      if (p[1] === "stories" && m === "POST") {
        const b = await request.json();
        const title = clip(b.title, 200) || "Untitled";
        const body = String(b.body ?? "").slice(0, 200000);
        const status = b.status === "published" ? "published" : "draft";
        if (b.id) {
          const old = await db.prepare("SELECT published_at FROM stories WHERE id=?").bind(b.id).first();
          const pub = status === "published" ? (old?.published_at || now) : null;
          await db.prepare("UPDATE stories SET title=?,body=?,status=?,published_at=? WHERE id=?")
            .bind(title, body, status, pub, b.id).run();
          return json({ id: b.id });
        }
        const r = await db.prepare("INSERT INTO stories (title,body,status,created_at,published_at) VALUES (?,?,?,?,?)")
          .bind(title, body, status, now, status === "published" ? now : null).run();
        return json({ id: r.meta.last_row_id });
      }
      if (p[1] === "stories" && m === "DELETE" && p[2]) {
        await db.batch([
          db.prepare("DELETE FROM comments WHERE story_id=?").bind(p[2]),
          db.prepare("DELETE FROM likes WHERE story_id=?").bind(p[2]),
          db.prepare("DELETE FROM stories WHERE id=?").bind(p[2]),
        ]);
        return json({ ok: true });
      }
      if (p[1] === "comments" && m === "DELETE" && p[2]) {
        await db.prepare("DELETE FROM comments WHERE id=?").bind(p[2]).run();
        return json({ ok: true });
      }
      return json({ error: "Not found" }, 404);
    }

    // ---------- Readers (published only) ----------
    if (p[0] === "stories" && m === "GET" && !p[1]) {
      const r = await db.prepare(
        `SELECT s.id,s.title,s.published_at,substr(s.body,1,220) AS excerpt,
          (SELECT COUNT(*) FROM likes l WHERE l.story_id=s.id) AS likes,
          (SELECT COUNT(*) FROM comments c WHERE c.story_id=s.id) AS comments
         FROM stories s WHERE s.status='published' ORDER BY s.published_at DESC`).all();
      return json(r.results, 200, { "cache-control": "public, max-age=30" });
    }
    if (p[0] === "stories" && m === "GET" && p[1] && !p[2]) {
      const s = await db.prepare("SELECT id,title,body,published_at FROM stories WHERE id=? AND status='published'").bind(p[1]).first();
      if (!s) return json({ error: "Not found" }, 404);
      const c = await db.prepare("SELECT id,name,text,created_at FROM comments WHERE story_id=? ORDER BY created_at ASC LIMIT 500").bind(p[1]).all();
      const l = await db.prepare("SELECT COUNT(*) AS n FROM likes WHERE story_id=?").bind(p[1]).first();
      return json({ ...s, comments: c.results, likes: l.n }, 200, { "cache-control": "public, max-age=15" });
    }
    if (p[0] === "stories" && p[2] === "comments" && m === "POST") {
      const ok = await db.prepare("SELECT 1 FROM stories WHERE id=? AND status='published'").bind(p[1]).first();
      if (!ok) return json({ error: "Not found" }, 404);
      const b = await request.json();
      const name = clip(b.name, 40) || "Anonymous";
      const text = clip(b.text, 1000);
      if (!text) return json({ error: "Write a comment first" }, 400);
      await db.prepare("INSERT INTO comments (story_id,name,text,created_at) VALUES (?,?,?,?)").bind(p[1], name, text, now).run();
      return json({ ok: true });
    }
    if (p[0] === "stories" && p[2] === "like" && m === "POST") {
      const b = await request.json();
      const voter = clip(b.voter, 64);
      if (!voter) return json({ error: "Bad request" }, 400);
      const ok = await db.prepare("SELECT 1 FROM stories WHERE id=? AND status='published'").bind(p[1]).first();
      if (!ok) return json({ error: "Not found" }, 404);
      const ex = await db.prepare("SELECT 1 FROM likes WHERE story_id=? AND voter=?").bind(p[1], voter).first();
      if (ex) await db.prepare("DELETE FROM likes WHERE story_id=? AND voter=?").bind(p[1], voter).run();
      else await db.prepare("INSERT INTO likes (story_id,voter) VALUES (?,?)").bind(p[1], voter).run();
      const l = await db.prepare("SELECT COUNT(*) AS n FROM likes WHERE story_id=?").bind(p[1]).first();
      return json({ liked: !ex, likes: l.n });
    }
    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: "Something went wrong. Try again." }, 500);
  }
}
