import { useState } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';

export default function App() {
  const [screen, setScreen] = useState('menu'); // menu | game
  const [modeKey, setModeKey] = useState('order');

  const startMode = (key) => {
    setModeKey(key);
    setScreen('game');
  };

  const backToMenu = () => setScreen('menu');

  return (
    <div className="app-root">
      {screen === 'menu' ? (
        <MainMenu onStart={startMode} />
      ) : (
        <GameScreen key={modeKey} modeKey={modeKey} onHome={backToMenu} />
      )}
    </div>
  );
}
