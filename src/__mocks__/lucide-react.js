const React = require('react')

// Mock all lucide-react exports
const mockIcon = (name) => {
  const MockedIcon = React.forwardRef((props, ref) => {
    return React.createElement('svg', {
      ...props,
      ref,
      'data-testid': `${name}-icon`,
      'data-lucide': name,
    })
  })
  MockedIcon.displayName = name
  return MockedIcon
}

module.exports = new Proxy({}, {
  get: function(target, prop) {
    if (prop === '__esModule') return true
    if (prop === 'default') return {}
    return mockIcon(prop)
  }
})
