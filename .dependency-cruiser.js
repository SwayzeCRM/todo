module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are not allowed',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-ui-to-database',
      severity: 'error',
      comment: 'UI components should not directly access database',
      from: {
        path: '^src/components'
      },
      to: {
        path: '^src/api/(supabase|.*API)'
      }
    },
    {
      name: 'no-api-to-ui',
      severity: 'error',
      comment: 'API layer should not depend on UI',
      from: {
        path: '^src/api'
      },
      to: {
        path: '^src/components'
      }
    },
    {
      name: 'no-service-to-ui',
      severity: 'error',
      comment: 'Services should not depend on UI',
      from: {
        path: '^src/services'
      },
      to: {
        path: '^src/components'
      }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: false,
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+'
      },
      text: {
        highlightFocused: true
      }
    }
  }
};