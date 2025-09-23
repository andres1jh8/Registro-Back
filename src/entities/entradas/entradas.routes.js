import logo from './logo.png';
import './App.css';

import homeIcon from './assets/icons/home.svg';
import createIcon from './assets/icons/create.svg';
import reportIcon from './assets/icons/report.svg';

import CompShowRegister from './registro/ShowRegister';
import CompCreateBlog from './registro/CreateRegister';
import ReportContext from './ReportContext';

import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { useRef } from 'react';

function App() {
  const reportFnRef = useRef(() => {});

  return (
    <div className="App">
      <BrowserRouter>
        <ReportContext.Provider value={{ imprimirReporte: () => reportFnRef.current() }}>

          {/* Header */}
          <header className="App-header">
            <div className="header-left">
              <img src={logo} className="App-logo" alt="logo" />
            </div>
            <div className="header-center">
              <h1 className="App-title">Registro Visitas</h1>
            </div>
            <div className="header-right">
              {/* Espacio para perfil de usuario */}
            </div>
          </header>

          {/* Body con sidebar y contenido */}
          <div className="App-body">

            {/* Sidebar izquierdo: solo aparece al hover */}
            <aside className="sidebar">
              <div className="btn-container">
                <Link to="/" className="btn-nav">
                  <img src={homeIcon} alt="Inicio" className="btn-icon" />
                  <span>Inicio</span>
                </Link>
                <Link to="/create" className="btn-nav">
                  <img src={createIcon} alt="Crear" className="btn-icon" />
                  <span>Crear</span>
                </Link>
                <button className="btn-nav" onClick={() => reportFnRef.current()}>
                  <img src={reportIcon} alt="Reporte" className="btn-icon" />
                  <span>Reporte</span>
                </button>
              </div>
            </aside>

            {/* Contenido principal */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<CompShowRegister reportFnRef={reportFnRef} />} />
                <Route path="/create" element={<CompCreateBlog />} />
              </Routes>
            </main>

          </div>

        </ReportContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
