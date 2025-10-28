import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  link: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'API Documentation',
    icon: '🚀',
    description: (
      <>
        Comprehensive OpenAPI specifications for all admin provisioning, user management,
        and tenant configuration endpoints with interactive testing capabilities.
      </>
    ),
    link: '/docs/backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac',
  },
  {
    title: 'Technical Specifications',
    icon: '📋',
    description: (
      <>
        Detailed SpecKit-powered specifications covering complete admin provisioning,
        law firm tenant management, user provisioning, and access control workflows.
      </>
    ),
    link: '/docs/backstage/specifications/',
  },
  {
    title: 'Architecture Diagrams',
    icon: '🏗️',
    description: (
      <>
        C4 model diagrams illustrating system context, container views, component architecture,
        and deployment patterns for the legal practice management platform.
      </>
    ),
    link: '/docs/backstage/c4-models/system-context',
  },
  {
    title: 'Security & RBAC',
    icon: '🔒',
    description: (
      <>
        Logto-managed role-based access control specifications with detailed permission models,
        resource access management, and professional credential verification.
      </>
    ),
    link: '/docs/backstage/specifications/backstage-api-specification',
  },
  {
    title: 'Integration Guides',
    icon: '🔌',
    description: (
      <>
        Step-by-step guides for integrating authentication, managing multi-tenant configurations,
        and implementing support access patterns in your legal applications.
      </>
    ),
    link: '/docs/backstage/specifications/',
  },
  {
    title: 'Best Practices',
    icon: '⭐',
    description: (
      <>
        Industry best practices for building scalable, secure legal practice management systems
        with proper data isolation, audit trails, and compliance considerations.
      </>
    ),
    link: '/docs/intro',
  },
];

function Feature({title, icon, description, link}: FeatureItem) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon}>{icon}</div>
      <Heading as="h3" className={styles.featureTitle}>
        {title}
      </Heading>
      <p className={styles.featureDescription}>{description}</p>
      <Link to={link} className={styles.featureLink}>
        Learn more
      </Link>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <div className={styles.features}>
      {FeatureList.map((props, idx) => (
        <Feature key={idx} {...props} />
      ))}
    </div>
  );
}
