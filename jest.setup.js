import '@testing-library/jest-dom'

// Mock bippy
jest.mock('bippy', () => ({
  __esModule: true,
  default: {},
}))

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock File constructor for file upload tests
global.File = class File {
  constructor(parts, name, options) {
    this.name = name
    this.size = parts.reduce((acc, part) => acc + part.length, 0)
    this.type = options?.type || ''
    this.lastModified = Date.now()
  }
}

// Mock FileList
global.FileList = class FileList {
  constructor(files) {
    this.length = files.length
    for (let i = 0; i < files.length; i++) {
      this[i] = files[i]
    }
  }
}
