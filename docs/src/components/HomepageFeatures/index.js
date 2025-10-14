import clsx from 'clsx';
import React from 'react';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Type-Safe & Modern',
    icon: 'fas fa-shield-alt',
    description: (
      <>
        Built with TypeScript from the ground up. Get full type safety,
        IntelliSense support, and catch errors at compile time, not runtime.
      </>
    ),
  },
  {
    title: 'Lightweight & Fast',
    icon: 'fas fa-bolt',
    description: (
      <>
        Less than 5KB gzipped with zero dependencies. Optimized for performance
        with minimal memory footprint and blazing-fast state transitions.
      </>
    ),
  },
  {
    title: 'Developer Experience',
    icon: 'fas fa-tools',
    description: (
      <>
        Intuitive builder pattern, comprehensive error handling, and extensive
        documentation. Get productive immediately with excellent tooling
        support.
      </>
    ),
  },
  {
    title: 'Flexible Architecture',
    icon: 'fas fa-cubes',
    description: (
      <>
        Support for guards, actions, middleware, and complex state hierarchies.
        Adapt to any use case from simple UI states to complex business
        workflows.
      </>
    ),
  },
  {
    title: 'Production Ready',
    icon: 'fas fa-rocket',
    description: (
      <>
        Battle-tested with comprehensive test coverage, error handling, and
        transaction support. Ready for mission-critical applications.
      </>
    ),
  },
  {
    title: 'Framework Agnostic',
    icon: 'fas fa-globe',
    description: (
      <>
        Works with React, Vue, Angular, Svelte, or vanilla JavaScript. No
        framework lock-in, use it anywhere JavaScript runs.
      </>
    ),
  },
];

function Feature({ icon, title, description }) {
  return (
    <div className={clsx(styles.useCase, styles.featureCard)}>
      <div className={styles.featureIcon}>
        <i className={icon}></i>
      </div>
      <div className={styles.featureContent}>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>
            Why Choose Our State Machine?
          </h2>
          <p className={styles.featuresSubtitle}>
            Everything you need to build robust, predictable applications with
            confidence
          </p>
        </div>
        <div className={styles.useCaseGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>

        <div className={styles.useCases}>
          <h2 className={styles.useCasesTitle}>Perfect For</h2>
          <div className={styles.useCaseGrid}>
            <div className={styles.useCase}>
              <h4>UI State Management</h4>
              <p>
                Loading states, form validation, modal flows, and complex user
                interactions
              </p>
            </div>
            <div className={styles.useCase}>
              <h4>Business Workflows</h4>
              <p>
                Order processing, approval chains, document lifecycles, and
                process automation
              </p>
            </div>
            <div className={styles.useCase}>
              <h4>API Integration</h4>
              <p>
                Request states, retry logic, authentication flows, and data
                synchronization
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
