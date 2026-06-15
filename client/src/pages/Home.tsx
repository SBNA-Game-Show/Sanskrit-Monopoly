import { useNav } from "../components/TransitionOverlay";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { useToast } from "../context/ToastContext";

// Import assets
import card_1 from "../assets/card_1.png";
import card_2 from "../assets/card_2.png";
import card_3 from "../assets/card_3.png";
import card_4 from "../assets/card_4.png";
import card_5 from "../assets/card_5.png";
import card_6 from "../assets/card_6.png";
import card_7 from "../assets/card_7.png";
import card_8 from "../assets/card_8.png";
import card_9 from "../assets/card_9.png";
import card_10 from "../assets/card_10.png";
import card_11 from "../assets/card_11.png";
import card_12 from "../assets/card_12.png";
import card_13 from "../assets/card_13.png";
import card_14 from "../assets/card_14.png";
import card_15 from "../assets/card_15.png";
import card_16 from "../assets/card_16.png";
import card_17 from "../assets/card_17.png";
import card_18 from "../assets/card_18.png";
import card_19 from "../assets/card_19.png";
import card_20 from "../assets/card_20.png";
import card_21 from "../assets/card_21.png";

// Shared design styles
const shared_styles = {
  btnHeight: "h-14",
  billSize: "w-36 h-20 lg:w-30 lg:h-20",
  cardSize: "w-24 h-32 lg:w-20 lg:h-25",
  controlWidth: "w-full sm:w-56",
  textFormat:
    "text-2xl tracking-widest font-normal font-jersey text-white text-center",
  activeGlow: "drop-shadow(0px 0px 12px #FDAF5D)",
  passiveGlow: "drop-shadow(0px 0px 6px rgba(255, 193, 126, 0.3))",
  decorativeGlow: "drop-shadow(0px 0px 5px rgba(255, 193, 126, 0.85))",
  hoverTransition:
    "transition-all duration-300 select-none outline-none border-none rounded-2xl flex items-center justify-center",
};

// Placement of images
const decorative_imgs = [
  {
    img: card_1,
    top: "30%",
    left: "17%",
    rotate: "rotate-250",
    size: shared_styles.billSize,
  }, // Question Card
  {
    img: card_2,
    bottom: "33%",
    left: "1%",
    rotate: "rotate-300",
    size: shared_styles.billSize,
  }, // Train Card
  {
    img: card_3,
    bottom: "20%",
    right: "40%",
    rotate: "rotate-250",
    size: shared_styles.billSize,
  }, // Tax Card
  {
    img: card_4,
    bottom: "20%",
    left: "12%",
    rotate: "rotate-250",
    size: shared_styles.billSize,
  }, // Treasure Card
  {
    img: card_5,
    top: "3%",
    left: "3%",
    rotate: "rotate-20",
    size: shared_styles.cardSize,
  }, // Ring Card
  {
    img: card_6,
    top: "2%",
    left: "15%",
    rotate: "rotate-50",
    size: shared_styles.cardSize,
  }, // Green Card
  {
    img: card_7,
    bottom: "27%",
    left: "25%",
    rotate: "rotate-35",
    size: shared_styles.cardSize,
  }, // Jail Card
  {
    img: card_8,
    top: "5%",
    right: "1%",
    rotate: "rotate-290",
    size: shared_styles.billSize,
  }, // Tap Card
  {
    img: card_9,
    top: "5%",
    right: "15%",
    rotate: "rotate-60",
    size: shared_styles.billSize,
  }, // Red Card
  {
    img: card_10,
    bottom: "15%",
    right: "5%",
    rotate: "rotate-170",
    size: shared_styles.cardSize,
  }, // Parking Card
  {
    img: card_11,
    top: "30%",
    left: "5%",
    rotate: "rotate-220",
    size: shared_styles.billSize,
  }, // 5 Money Card
  {
    img: card_12,
    top: "10%",
    left: "27%",
    rotate: "rotate-50",
    size: shared_styles.billSize,
  }, // 100 Money
  {
    img: card_13,
    bottom: "20%",
    right: "20%",
    rotate: "rotate-150",
    size: shared_styles.billSize,
  }, // 1000 Money
  {
    img: card_14,
    bottom: "43%",
    right: "1%",
    rotate: "rotate-330",
    size: shared_styles.billSize,
  }, // 20 Money
  {
    img: card_15,
    bottom: "40%",
    right: "18%",
    rotate: "rotate-130",
    size: shared_styles.cardSize,
  }, // House Card
  {
    img: card_16,
    top: "9%",
    right: "30%",
    rotate: "rotate-30",
    size: shared_styles.cardSize,
  }, // Forced Deal Card
  {
    img: card_17,
    top: "5%",
    left: "42%",
    rotate: "rotate-30",
    size: shared_styles.cardSize,
  }, // Rent Card
  {
    img: card_18,
    bottom: "35%",
    right: "30%",
    rotate: "rotate-30",
    size: shared_styles.cardSize,
  }, // Blue Rent Card
  {
    img: card_19,
    top: "1%",
    right: "40%",
    rotate: "rotate-310",
    size: shared_styles.cardSize,
  }, // Red Rent Card
  {
    img: card_20,
    top: "26%",
    right: "9%",
    rotate: "rotate-310",
    size: shared_styles.cardSize,
  }, // Pink Rent Card
  {
    img: card_21,
    bottom: "20%",
    left: "37%",
    rotate: "rotate-300",
    size: shared_styles.cardSize,
  }, // Say No Card
];

function Home() {
  const [lobbyCode, setLobbyCode] = useState("");
  const navigate = useNav();
  const { uid, username } = useAuth();
  const { showToast } = useToast();

  const isCodeEntered = lobbyCode.trim().length > 0;

  const createRoom = async () => {
    try {
      const SERVER_URL = import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://sanskrit-monopoly.onrender.com";
      const response = await fetch(`${SERVER_URL}/api/lobby-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostUid: uid, hostUsername: username }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      const data = await response.json();
      showToast({
        variant: "success",
        title: "Room created",
        message: "Room has been created successfully.",
      });
      navigate(`/lobby/${data.lobby.lobbyCode}`);
    } catch {
      showToast({
        variant: "error",
        title: "Could not create room",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <main className="h-[calc(100vh-64px)] overflow-hidden bg-white flex flex-col justify-between select-none relative font-jersey">
      <style>
        {`
          @keyframes soft-float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          .animate-float {
            animation: soft-float 4s ease-in-out infinite;
          }
        `}
      </style>
      {/* Middle Container */}
      <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">
        {decorative_imgs.map((item, index) => (
          <div
            key={index}
            className={`absolute bg-white/40 border-2 border-orange-100/30 rounded-2xl p-1.5 flex items-center justify-center blur-[1px] opacity-30 transition-all duration-500 animate-float ${item.size} ${item.rotate}`}
            style={{
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              filter: shared_styles.decorativeGlow,
            }}
          >
            <img
              src={item.img}
              alt="monopoly card"
              className="w-full h-full object-contain mix-blend-multiply opacity-80"
            />
          </div>
        ))}
      </div>
      {/* Middle Container */}
      {/* Buttons */}
      <div className="z-10 flex flex-col items-center justify-center space-y-6 max-w-xl w-full px-4 flex-grow mx-auto">
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          {/* Create Room Btn */}
          <button
            type="button"
            onClick={createRoom}
            style={{ filter: shared_styles.activeGlow }}
            className={`bg-[#FDAF5D] hover:scale-105 active-scale-98 shadow-sm cursor-pointer ${shared_styles.controlWidth} ${shared_styles.btnHeight} ${shared_styles.textFormat} ${shared_styles.hoverTransition}`}
          >
            CREATE LOBBY
          </button>

          {/* Enter Code */}
          <div
            style={{ filter: shared_styles.activeGlow }}
            className={`bg-white border-4 border-[#FDAF5D] rounded-2xl relative shadow-sm ${shared_styles.controlWidth} ${shared_styles.btnHeight} flex items-center justify-center`}
          >
            <input
              type="text"
              maxLength={6}
              placeholder="ENTER CODE"
              value={lobbyCode.toLocaleUpperCase()}
              onChange={(e) => setLobbyCode(e.target.value.toLocaleUpperCase())}
              className="w-full h-full bg-transparent text-center text-2xl text-orange-900 tracking-widest font-jersey font-normal outline-none placeholder-orange-300 border-none px-2 uppercase flex items-center justify-center"
            />
          </div>
        </div>
        {/* Top Row */}
        {/* Enter Lobby Btn*/}
        <div className="w-full flex justify-center">
          <button
            type="button"
            disabled={!isCodeEntered}
            onClick={() => navigate(`/lobby/${lobbyCode}`)}
            style={{
              filter: isCodeEntered
                ? shared_styles.activeGlow
                : shared_styles.passiveGlow,
            }}
            className={`w-64 shadow-none ${shared_styles.btnHeight} ${shared_styles.textFormat} ${shared_styles.hoverTransition}
            ${isCodeEntered ? "bg-[#FDAF5D] hover-scale-105 active:scale-95 cursor-pointer opacity-100" : "bg-[#FFC17E]/70 opacity-70 cursor-not-allowed"}`}
          >
            ENTER LOBBY
          </button>
        </div>
        {/* Enter Lobby Btn */}
      </div>
      {/* Buttons*/}
      {/* Footer */}
      <div className="w-full bg-[#FFC17E] h-20 shrink-0 shadow-[0px_-4px_10px_rgba(0,0,0,0.05)]"></div>
    </main>
  );
}

export default Home;
