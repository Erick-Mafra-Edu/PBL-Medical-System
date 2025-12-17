import '@testing-library/jest-dom'
import { server } from './test/mocks/server'

// Start MSW before all tests and reset after each test for isolation.
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
