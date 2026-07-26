/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PlagiarismChecker from './components/PlagiarismChecker';
import { ErrorBoundary } from './components/UIComponents/ErrorBoundary';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <ErrorBoundary>
        <PlagiarismChecker />
      </ErrorBoundary>
    </div>
  );
}
