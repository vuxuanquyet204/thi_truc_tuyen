// Course API barrel
export * from './courseApi';
// Re-export default explicitly - must be AFTER export *
import courseApi from './courseApi';
export default courseApi;