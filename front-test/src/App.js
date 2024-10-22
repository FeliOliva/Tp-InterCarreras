import './App.css';
import DataComponent from './components/DataComponent';
import AumentarFelicidad from './components/AumentarFelicidad';
import AumentarVida from './components/AumentarVida';
import Revivir from './components/Revivir';

function App() {
  return (
    <div>
      <DataComponent />
      < AumentarVida />
      <AumentarFelicidad />
      <Revivir />
    </div>
  );
}

export default App;
