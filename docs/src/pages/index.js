import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Layout from '@theme/Layout';
import clsx from 'clsx';
import React from 'react';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>State Machine</h1>
            <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
            <p className={styles.heroDescription}>
              Build robust, predictable applications with a modern, type-safe
              state machine library. Perfect for complex workflows, UI state
              management, and business logic orchestration.
            </p>
            <div className={styles.heroButtons}>
              <Link
                className={clsx(
                  'button button--primary button--lg',
                  styles.heroButton
                )}
                to="/docs"
              >
                Get Started
              </Link>
              <Link
                className={clsx(
                  'button button--secondary button--lg',
                  styles.heroButton
                )}
                to="/docs/api"
              >
                API Reference
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{'< 5KB'}</span>
                <span className={styles.heroStatLabel}>Bundle Size</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>100%</span>
                <span className={styles.heroStatLabel}>TypeScript</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>Zero</span>
                <span className={styles.heroStatLabel}>Dependencies</span>
              </div>
            </div>
          </div>
          <div className={styles.heroCode}>
            <div className={styles.codeBlock}>
              <div className={styles.codeHeader}>
                <span className={styles.codeTitle}>Quick Example</span>
                <div className={styles.codeDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className={styles.codeContent}>
                <div className={styles.codeLine}>
                  <span className={styles.codeKeyword}>import</span> {'{'}
                  <span className={styles.codeClass}> StateMachine </span>
                  {'}'} <span className={styles.codeKeyword}>from</span>
                  <span className={styles.codeString}>
                    {' '}
                    &apos;@jewel998/state-machine&apos;
                  </span>
                  ;
                </div>
                <div className={styles.codeLine}></div>
                <div className={styles.codeLine}>
                  <span className={styles.codeKeyword}>const</span>
                  <span className={styles.codeVariable}> machine</span> =
                  <span className={styles.codeKeyword}> new</span>
                  <span className={styles.codeClass}> StateMachine</span>.
                  <span className={styles.codeMethod}>definitionBuilder</span>()
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>state</span>(
                  <span className={styles.codeString}>&apos;idle&apos;</span>)
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>state</span>(
                  <span className={styles.codeString}>&apos;loading&apos;</span>
                  )
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>state</span>(
                  <span className={styles.codeString}>&apos;success&apos;</span>
                  )
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>state</span>(
                  <span className={styles.codeString}>&apos;error&apos;</span>)
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>transition</span>(
                  <span className={styles.codeString}>&apos;idle&apos;</span>,{' '}
                  <span className={styles.codeString}>&apos;loading&apos;</span>
                  , <span className={styles.codeString}>&apos;FETCH&apos;</span>
                  )
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>transition</span>(
                  <span className={styles.codeString}>&apos;loading&apos;</span>
                  ,{' '}
                  <span className={styles.codeString}>&apos;success&apos;</span>
                  ,{' '}
                  <span className={styles.codeString}>&apos;SUCCESS&apos;</span>
                  )
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>transition</span>(
                  <span className={styles.codeString}>&apos;loading&apos;</span>
                  , <span className={styles.codeString}>&apos;error&apos;</span>
                  , <span className={styles.codeString}>&apos;ERROR&apos;</span>
                  )
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>initialState</span>(
                  <span className={styles.codeString}>&apos;idle&apos;</span>)
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeTab} />.
                  <span className={styles.codeMethod}>build</span>();
                </div>
                <div className={styles.codeLine}></div>
                <div className={styles.codeLine}>
                  <span className={styles.codeComment}>// Use it</span>
                </div>
                <div className={styles.codeLine}>
                  <span className={styles.codeVariable}>machine</span>.
                  <span className={styles.codeMethod}>processEvent</span>(
                  <span className={styles.codeString}>&apos;idle&apos;</span>,{' '}
                  <span className={styles.codeString}>&apos;FETCH&apos;</span>,{' '}
                  <span className={styles.codeString}>{'{}'}</span>);
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Modern State Machine Library`}
      description="A lightweight, type-safe state machine library for JavaScript/TypeScript applications"
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
