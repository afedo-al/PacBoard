import { useState, useEffect } from "react";
import "./styles.css";

/* --------------------- MAPEO DE JUGADORES --------------------- */
function playerName(symbol) {
  if (symbol === "x") return "FANTASMITA";
  if (symbol === "o") return "PACMAN :V";
  return symbol;
}

/* --------------------- SQUARE --------------------- */
function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className="square"
      onClick={onSquareClick}
      style={{
        backgroundColor: highlight ? "#0aff9d33" : "black",
      }}
    >
      {value && (
        <img
          src={`${import.meta.env.BASE_URL}img/${value}.png`}
          alt={value}
          className="piece"
        />
      )}
    </button>
  );
}

/* --------------------- BOARD --------------------- */
function Board({ xIsNext, squares, onPlay, boardSize }) {
  function handleClick(i) {
    if (calculateWinner(squares, boardSize) || squares[i]) return;

    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "x" : "o";
    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares, boardSize);

  const status = winnerInfo
    ? `Winner: ${playerName(winnerInfo.player)}`
    : `Next player: ${xIsNext ? "FANTASMITA" : "PACMAN :V"}`;

  return (
    <>
      <div className="status">{status}</div>

      {Array(boardSize)
        .fill(null)
        .map((_, row) => (
          <div className="board-row" key={row}>
            {Array(boardSize)
              .fill(null)
              .map((_, col) => {
                const index = row * boardSize + col;
                const highlight =
                  winnerInfo && winnerInfo.line.includes(index);

                return (
                  <Square
                    key={index}
                    value={squares[index]}
                    onSquareClick={() => handleClick(index)}
                    highlight={highlight}
                  />
                );
              })}
          </div>
        ))}
    </>
  );
}

/* --------------------- GAME --------------------- */
export default function Game() {
  const [boardSize, setBoardSize] = useState(3);
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const winnerInfo = calculateWinner(currentSquares, boardSize);

  /* ------- Guardar ------- */
  useEffect(() => {
    localStorage.setItem(
      "gameData",
      JSON.stringify({ history, currentMove, boardSize })
    );
  }, [history, currentMove, boardSize]);

  /* ------- Cargar ------- */
  useEffect(() => {
    const saved = localStorage.getItem("gameData");
    if (!saved) return;
    const data = JSON.parse(saved);
    setHistory(data.history);
    setCurrentMove(data.currentMove);
    setBoardSize(data.boardSize);
  }, []);

  /* ------- Reiniciar al cambiar tablero ------- */
  useEffect(() => {
    const total = boardSize * boardSize;
    setHistory([Array(total).fill(null)]);
    setCurrentMove(0);
  }, [boardSize]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  function resetGame() {
    const total = boardSize * boardSize;
    setHistory([Array(total).fill(null)]);
    setCurrentMove(0);
  }

  /* ------- EASTER EGG BOTÓN ------- */
  function showEasterEgg() {
    alert(`
      PAC-BOARD  
      Alumno: Alfredo J Cruz Miss  
      Matrícula: 66340  
    `);
  }

  const moves = history.map((_, move) => (
    <li key={move}>
      <button onClick={() => jumpTo(move)}>
        {move === 0 ? "Go to game start" : "Go to move #" + move}
      </button>
    </li>
  ));

  return (
    <div className="game-container">
      <div className="game">
        <h1>PAC-BOARD</h1>

        <button onClick={resetGame} className="reset-btn">Reset Game</button>
        <button onClick={showEasterEgg} className="info-btn">Info.</button>

        <br />

        <label>Board size:</label>
        <select
          value={boardSize}
          onChange={(e) => setBoardSize(parseInt(e.target.value))}
        >
          <option value={3}>3 × 3</option>
          <option value={4}>4 × 4</option>
          <option value={5}>5 × 5</option>
          <option value={6}>6 × 6</option>
        </select>

        <div className="game-board">
          <Board
            xIsNext={xIsNext}
            squares={currentSquares}
            onPlay={handlePlay}
            boardSize={boardSize}
          />
        </div>

        {winnerInfo && (
          <div className="winner-message">
            ¡FELICIDADES!: <strong>{playerName(winnerInfo.player)}</strong>
          </div>
        )}

        {!winnerInfo && isDraw(currentSquares) && (
          <div className="draw-message">¡EMPATE!</div>
        )}

        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    </div>
  );
}

/* --------------------- CALCULAR GANADOR --------------------- */
function calculateWinner(squares, size) {
  const lines = [];

  for (let r = 0; r < size; r++) {
    lines.push([...Array(size)].map((_, c) => r * size + c));
  }

  for (let c = 0; c < size; c++) {
    lines.push([...Array(size)].map((_, r) => r * size + c));
  }

  lines.push([...Array(size)].map((_, i) => i * size + i));
  lines.push([...Array(size)].map((_, i) => i * size + (size - 1 - i)));

  for (const line of lines) {
    const first = squares[line[0]];
    if (first && line.every((i) => squares[i] === first)) {
      return { player: first, line };
    }
  }

  return null;
}

function isDraw(squares) {
  return squares.every((sq) => sq !== null);
}
