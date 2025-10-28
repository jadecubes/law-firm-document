import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroContent}>
        <Heading as="h1" className={styles.heroTitle}>
          Law Firm Documentation Portal
        </Heading>
        <p className={styles.heroSubtitle}>
          Comprehensive technical specifications, API documentation, and architecture diagrams
          for modern legal practice management systems.
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--primary button--lg', styles.buttonHeroPrimary)}
            to="/docs/intro">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

function StatsSection() {
  return (
    <section className={styles.statsSection}>
      <div className="container">
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>6+</div>
            <div className={styles.statLabel}>Specifications</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>API Endpoints</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>15+</div>
            <div className={styles.statLabel}>C4 Diagrams</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>RBAC</div>
            <div className={styles.statLabel}>Security Model</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className={styles.featuresSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Everything You Need
        </Heading>
        <p className={styles.sectionSubtitle}>
          Complete documentation for building and maintaining enterprise-grade legal practice management systems
        </p>
        <HomepageFeatures />
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description="Law Firm Documentation Portal - Technical specifications, API docs, and architecture for legal practice management systems">
      <HomepageHeader />
      <main>
        <StatsSection />
        <FeaturesSection />
      </main>
    </Layout>
  );
}
