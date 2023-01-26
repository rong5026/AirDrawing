import MainPage from "./game/MainPage.jsx";
import HomePage from "./membership/HomePage.jsx";
import FirstPage from "./navigation/Home.jsx";
import LobbyPage from "./navigation/Lobby.jsx";
import LoginPage from "./membership/Login.jsx";
import SignupPage from "./membership/Signup.jsx";
import SelectionPage from "./navigation/Selection.jsx";
import WordTracingPage from './wordtracing/single-player/WordTracingPage.jsx';
import GamePage from './wordtracing/single-player/GamePage.jsx';
import DecorativeGamePage from "./game/DecorativeGameLobby.jsx";
import DecorationGamePage from "./game/DecorativeGame.jsx";
import HowToDecorativeGame from "./game/HowToDecorative.jsx";
import HowToDecorativeGame2 from "./game/HowToDecorative2.jsx";
import HowToDecorativeGame3 from "./game/HowToDecorative3.jsx";
import HowToDecorativeGame4 from "./game/HowToDecorative4.jsx";
import TwoDecorativeGame from "./game/TwoDecorativeGame.jsx";
import TwoGameLobby from "./game/TwoGameLobby.jsx";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<FirstPage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/login-or-signup" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/word-tracing" element={<WordTracingPage />} />
        <Route path="/word-tracing/play" element={<GamePage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/selection" element={<SelectionPage />} />
        <Route path="/decorative" element={<DecorativeGamePage />} />
        <Route path="/decorative/game" element={<DecorationGamePage />} />
        <Route path="/decorative/howto" element={<HowToDecorativeGame />} />
        <Route path="/decorative/howto/2" element={<HowToDecorativeGame2 />} />
        <Route path="/decorative/howto/3" element={<HowToDecorativeGame3 />} />
        <Route path="/decorative/howto/4" element={<HowToDecorativeGame4 />} />
        <Route path="/2p-lobby/decorative-play" element={<TwoDecorativeGame />} />
        <Route path="/2p-lobby" element={<TwoGameLobby />} />
        {/* <Route path="/detail/:id" element={<Detail />} />
      <Route path="/mypage/*" element={<MyPage />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
