import './App.css';
import ExcelDataUploader from './components/Home';
import WelcomeMessage from './components/CloudUpload';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
        <Route exact path="/" element={<ExcelDataUploader />} />
        <Route exact path="/cloud-upload" element={<WelcomeMessage />} />  
        </Routes>    
    </Router>
    </div>
  );
}

export default App;
