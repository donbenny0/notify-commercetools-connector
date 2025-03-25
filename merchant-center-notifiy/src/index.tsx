/// <reference types="@commercetools-frontend/application-config/client" />

import ReactDOM from 'react-dom';
import EntryPoint from './components/entry-point';

console.log('🚀 - Starting the app');

// print all environmet variables
console.log('🚀 - process.env', process.env);


ReactDOM.render(<EntryPoint />, document.getElementById('app'));
