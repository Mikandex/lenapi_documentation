"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { guideGroups, guides } from "./docs-data";
import styles from "./page.module.css";

function Glyph({ name }: { name: string }) {
  const paths: Record<string, string> = {
    search: "M21 21l-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm0 0V21",
    arrow: "M7 17 17 7M7 7h10v10",
    chevron: "m9 18 6-6-6-6",
    menu: "M4 7h16M4 12h16M4 17h16",
    check: "m5 12 4 4L19 6",
    copy: "M8 8V4h12v12h-4M4 8h12v12H4z",
  };
  return (
    <svg aria-hidden="true" className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] ?? paths.book} />
    </svg>
  );
}

export default function DocsShell({ initialGuideId = "introduction" }: { initialGuideId?: string }) {
  const [activeId, setActiveId] = useState(initialGuideId);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const active = guides.find((guide) => guide.id === activeId) ?? guides[0];
  const filteredGroups = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return guideGroups;
    return guideGroups
      .map((group) => ({
        ...group,
        guides: group.guides.filter((guide) =>
          [guide.title, guide.summary, ...guide.tags].join(" ").toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.guides.length > 0);
  }, [search]);
  const activeIndex = guides.findIndex((guide) => guide.id === activeId);

  function selectGuide(id: string) {
    setActiveId(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyCode(code: string, key: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className={styles.siteShell}>
      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ""}`}>
        <Link className={styles.brand} href="/" onClick={() => selectGuide("introduction")}>
          <span className={styles.brandMark}>L</span>
          <span className={styles.brandText}>LenAPI<span>DEVELOPER DOCS</span></span>
        </Link>

        <div className={styles.searchWrap}>
          <Glyph name="search" />
          <input
            aria-label="Search documentation"
            placeholder="Search the docs"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <kbd>/</kbd>
        </div>

        <nav className={styles.navigation} aria-label="Documentation navigation">
          {filteredGroups.map((group) => (
            <section className={styles.navGroup} key={group.title}>
              <p className={styles.navHeading}>{group.title}</p>
              {group.guides.map((guide) => (
                <Link
                  href={guide.id === "introduction" ? "/" : `/${guide.id}`}
                  className={`${styles.navItem} ${guide.id === activeId ? styles.navActive : ""}`}
                  key={guide.id}
                  onClick={() => selectGuide(guide.id)}
                  aria-current={guide.id === activeId ? "page" : undefined}
                >
                  <span>{guide.title}</span>
                  {guide.id === activeId && <span className={styles.navDot} />}
                </Link>
              ))}
            </section>
          ))}
          {filteredGroups.length === 0 && <p className={styles.emptySearch}>No guides match “{search}”.</p>}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.versionCard}>
            <span className={styles.pulse} />
            <div><b>LenAPI 0.1.2</b><small>Framework guide</small></div>
            <span className={styles.versionArrow}><Glyph name="arrow" /></span>
          </div>
          <p className={styles.sideNote}>Built for Python developers who want less setup and a clear path from first route to production.</p>
        </div>
      </aside>

      {menuOpen && <button className={styles.scrim} aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

      <div className={styles.mainColumn} id="top">
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Glyph name="menu" /></button>
          <div className={styles.breadcrumb}><span>Documentation</span><Glyph name="chevron" /><b>{active.title}</b></div>
          <div className={styles.topbarRight}>
            <span className={styles.status}><i /> API reference</span>
            <a href="https://github.com/Mikandex/lenapi" target="_blank" rel="noreferrer" className={styles.githubLink}>GitHub <Glyph name="arrow" /></a>
          </div>
        </header>

        <div className={styles.contentFrame}>
          <main className={styles.article}>
            <div className={styles.articleMeta}>
              <span className={styles.eyebrow}>{active.eyebrow}</span>
              <span className={styles.readTime}>{active.readTime} read</span>
            </div>
            <h1>{active.title}</h1>
            <p className={styles.lead}>{active.summary}</p>

            {active.id === "introduction" && (
              <section className={styles.welcomePanel}>
                <div className={styles.welcomeCopy}>
                  <span className={styles.panelKicker}>YOUR API, WITHOUT THE BUSYWORK</span>
                  <h2>Start with the shape of your idea.</h2>
                  <p>Follow a guide, copy a working example, and build up one part of your backend at a time.</p>
                  <Link href="/routing" onClick={() => selectGuide("routing")} className={styles.primaryButton}>Explore routing <Glyph name="arrow" /></Link>
                </div>
                <div className={styles.terminalCard}>
                  <div className={styles.terminalTop}><span /><span /><span /><b>main.py</b></div>
                  <pre><code><span className={styles.syntaxPurple}>from</span> lenapi <span className={styles.syntaxPurple}>import</span> LENAPI<br /><br />app = LENAPI()<br /><br /><span className={styles.syntaxBlue}>@app.get</span>(<span className={styles.syntaxGreen}>&quot;/hello&quot;</span>)<br /><span className={styles.syntaxPurple}>def</span> hello():<br />    <span className={styles.syntaxPurple}>return</span> {'{'}<span className={styles.syntaxGreen}>&quot;message&quot;</span>: <span className={styles.syntaxGreen}>&quot;Hello, world!&quot;</span>{'}'}</code></pre>
                  <div className={styles.terminalFooter}><span className={styles.liveDot} /> Ready to run <code>python lenora.py run</code></div>
                </div>
              </section>
            )}

            {active.id === "introduction" && (
              <section className={styles.quickStats} aria-label="Framework highlights">
                <div><b>19</b><span>step-by-step guides</span></div>
                <div><b>Sync + async</b><span>routes and database access</span></div>
                <div><b>One toolkit</b><span>API, data, security, realtime</span></div>
              </section>
            )}

            <div className={styles.guideIntro}>
              <span className={styles.sectionLabel}>{active.id === "introduction" ? "INTRODUCTION" : "IN THIS GUIDE"}</span>
              <p>{active.id === "introduction" ? "Understand what LenAPI includes, then follow the quickstart and focused guides to build your application step by step." : `Work through each step in order. The examples use the generated LenAPI project structure and are designed to be adapted to your app.`}</p>
            </div>

            <div className={styles.stepsList}>
              {active.steps.map((step, index) => {
                const codeKey = `${active.id}-${index}`;
                return (
                  <section className={styles.step} key={`${active.id}-${step.title}`} id={`step-${index + 1}`}>
                    <div className={styles.stepMarker}><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
                    <div className={styles.stepBody}>
                      <h2>{step.title}</h2>
                      <p>{step.body}</p>
                      {step.list && (
                        <ul className={styles.featureList}>
                          {step.list.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      )}
                      {step.code && (
                        <div className={styles.codeCard}>
                          <div className={styles.codeHead}><span><i /> Python</span><button onClick={() => copyCode(step.code!, codeKey)} aria-label="Copy code">
                            <Glyph name={copied === codeKey ? "check" : "copy"} />{copied === codeKey ? "Copied" : "Copy"}
                          </button></div>
                          <pre><code>{step.code}</code></pre>
                        </div>
                      )}
                      {step.note && <div className={styles.note}><span>TIP</span><p>{step.note}</p></div>}
                    </div>
                  </section>
                );
              })}
            </div>

            {active.id === "introduction" && (
              <section className={styles.allGuides}>
                <div className={styles.allGuidesHeader}><div><span className={styles.sectionLabel}>THE LEARNING PATH</span><h2>Explore every feature</h2></div><span>{guides.length} guides</span></div>
                <div className={styles.guideCards}>
                  {guides.filter((guide) => guide.id !== "introduction").map((guide, index) => (
                    <Link className={styles.guideCard} key={guide.id} href={guide.id === "introduction" ? "/" : `/${guide.id}`} onClick={() => selectGuide(guide.id)}>
                      <span className={styles.cardIndex}>{String(index + 1).padStart(2, "0")}</span>
                      <span className={styles.cardCopy}><b>{guide.title}</b><small>{guide.summary}</small></span>
                      <Glyph name="chevron" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <footer className={styles.articleFooter}>
              <div><span>Need a refresher?</span><b>Jump to the next guide.</b></div>
              <Link className={styles.nextButton} href={guides[(activeIndex + 1) % guides.length].id === "introduction" ? "/" : `/${guides[(activeIndex + 1) % guides.length].id}`} onClick={() => selectGuide(guides[(activeIndex + 1) % guides.length].id)}>
                {guides[(activeIndex + 1) % guides.length].title} <Glyph name="arrow" />
              </Link>
            </footer>
          </main>

          <aside className={styles.rightRail}>
            <span className={styles.railTitle}>ON THIS PAGE</span>
            <nav aria-label="On this page">
              {active.steps.map((step, index) => <a href={`#step-${index + 1}`} key={step.title}><i />{step.title}</a>)}
            </nav>
            <div className={styles.helpCard}><span className={styles.helpIcon}><Glyph name="book" /></span><b>New to LenAPI?</b><p>Start with the introduction, then follow the guides in order.</p><Link href="/" onClick={() => selectGuide("introduction")}>Start at the beginning <Glyph name="arrow" /></Link></div>
            <div className={styles.sourceCard}><span>DOCUMENTATION SOURCE</span><b>Framework README</b><p>Examples are based on the current LenAPI framework docs.</p><a href="https://github.com/Mikandex/lenapi/blob/main/README.md" target="_blank" rel="noreferrer">View on GitHub <Glyph name="arrow" /></a></div>
          </aside>
        </div>
      </div>
    </div>
  );
}
