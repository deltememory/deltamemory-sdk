import { DocsThemeConfig } from 'nextra-theme-docs'
import { useTheme } from 'next-themes'
import Image from 'next/image'

const Logo = () => {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Image 
        src={isDark ? "/logo-white.webp" : "/logo-black.webp"}
        alt="DeltaMemory" 
        width={120} 
        height={30}
      />
      <span style={{ 
        fontSize: '12px', 
        fontWeight: 500, 
        opacity: 0.6,
        marginLeft: '4px'
      }}>
        (Alpha)
      </span>
    </div>
  )
}

const config: DocsThemeConfig = {
  logo: <Logo />,
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
