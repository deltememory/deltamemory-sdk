import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span style={{ fontWeight: 700 }}>DeltaMemory</span>,
  project: {
    link: 'https://github.com/deltamemory/deltamemory-sdk',
  },
  docsRepositoryBase: 'https://github.com/deltamemory/deltamemory-sdk/tree/main/docs',
  footer: {
    text: `© ${new Date().getFullYear()} DeltaMemory. All rights reserved.`,
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="DeltaMemory - Cognitive Memory Layer for AI Applications" />
      <meta name="og:title" content="DeltaMemory Documentation" />
    </>
  ),
  useNextSeoProps() {
    return {
      titleTemplate: '%s – DeltaMemory'
    }
  },
  primaryHue: 200,
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    text: 'Edit this page on GitHub',
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
    useLink: () => 'https://github.com/deltamemory/deltamemory-sdk/issues/new?labels=feedback',
  },
}

export default config
