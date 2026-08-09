import { useState } from "react";

const API_BASE = "http://127.0.0.1:8643";

async function postJson(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "request failed");
  return data;
}

function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <button className={mode === "walkcycle" ? "active" : ""} onClick={() => setMode("walkcycle")}>
        Walk-Cycle Sheet
      </button>
      <button className={mode === "tileset" ? "active" : ""} onClick={() => setMode("tileset")}>
        Tileset Batch
      </button>
    </div>
  );
}

function WalkCycleMode() {
  const [characterName, setCharacterName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [columns, setColumns] = useState(4);
  const [rows, setRows] = useState(4);
  const [frameWidth, setFrameWidth] = useState(48);
  const [frameHeight, setFrameHeight] = useState(48);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { image_base64, metadata }
  const [status, setStatus] = useState("");

  const generate = async () => {
    setBusy(true);
    setError(null);
    setStatus("");
    try {
      const data = await postJson("/api/walkcycle/generate", {
        character_name: characterName,
        prompt,
        columns: Number(columns),
        rows: Number(rows),
        frame_width: Number(frameWidth),
        frame_height: Number(frameHeight),
      });
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!result) return;
    setStatus("Saving...");
    try {
      const data = await postJson("/api/save", {
        category: "generated",
        filename: `${characterName}.png`,
        image_base64: result.image_base64,
        metadata: result.metadata,
      });
      setStatus(`Saved to ${data.path}`);
    } catch (e) {
      setStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div className="panel">
      <label>
        Character name (used as filename)
        <input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="dockworker_npc" />
      </label>
      <label>
        Description prompt
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="a chibi dockworker, orange hi-vis vest, hardhat, top-down RPG style"
          rows={3}
        />
      </label>
      <div className="grid-inputs">
        <label>
          Columns (walk frames)
          <input type="number" value={columns} onChange={(e) => setColumns(e.target.value)} min={1} max={8} />
        </label>
        <label>
          Rows (directions)
          <input type="number" value={rows} onChange={(e) => setRows(e.target.value)} min={1} max={8} />
        </label>
        <label>
          Frame width (px)
          <input type="number" value={frameWidth} onChange={(e) => setFrameWidth(e.target.value)} min={8} max={256} />
        </label>
        <label>
          Frame height (px)
          <input type="number" value={frameHeight} onChange={(e) => setFrameHeight(e.target.value)} min={8} max={256} />
        </label>
      </div>
      <button disabled={busy || !characterName || !prompt} onClick={generate}>
        {busy ? "Generating…" : "Generate sheet"}
      </button>
      {error && <p className="error">Error: {error}</p>}

      {result && (
        <div className="result">
          <img
            className="pixelated"
            src={`data:image/png;base64,${result.image_base64}`}
            alt="generated sheet"
            width={result.metadata.spritesheet_width * 2}
            height={result.metadata.spritesheet_height * 2}
          />
          <p>
            {result.metadata.columns} columns × {result.metadata.rows} rows, {result.metadata.frame_width}×
            {result.metadata.frame_height}px frames ({result.metadata.directions.join(", ")})
          </p>
          <button onClick={save}>Save to godot/assets/generated/</button>
          {status && <p className="status">{status}</p>}
        </div>
      )}
    </div>
  );
}

function TilesetMode() {
  const [stylePrompt, setStylePrompt] = useState("");
  const [variants, setVariants] = useState(["grass", "water", "dirt path"]);
  const [tileSize, setTileSize] = useState(32);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [tiles, setTiles] = useState(null); // [{variant, image_base64, error}]
  const [status, setStatus] = useState("");

  const updateVariant = (i, value) => {
    const next = [...variants];
    next[i] = value;
    setVariants(next);
  };
  const addVariant = () => setVariants([...variants, ""]);
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));

  const generate = async () => {
    setBusy(true);
    setError(null);
    setStatus("");
    try {
      const data = await postJson("/api/tileset/generate", {
        style_prompt: stylePrompt,
        variants: variants.filter((v) => v.trim()),
        tile_size: Number(tileSize),
      });
      setTiles(data.tiles);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const saveTile = async (tile) => {
    setStatus(`Saving ${tile.variant}...`);
    try {
      const safeName = tile.variant.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
      const data = await postJson("/api/save", {
        category: "tiles",
        filename: `${safeName}.png`,
        image_base64: tile.image_base64,
      });
      setStatus(`Saved ${tile.variant} to ${data.path}`);
    } catch (e) {
      setStatus(`Error saving ${tile.variant}: ${e.message}`);
    }
  };

  return (
    <div className="panel">
      <label>
        Style prompt (shared across every variant)
        <textarea
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          placeholder="industrial dockyard ground tile, top-down, flat colors"
          rows={2}
        />
      </label>
      <label>
        Tile size (px)
        <input type="number" value={tileSize} onChange={(e) => setTileSize(e.target.value)} min={8} max={128} />
      </label>
      <div className="variant-list">
        <p>Variants</p>
        {variants.map((v, i) => (
          <div key={i} className="variant-row">
            <input value={v} onChange={(e) => updateVariant(i, e.target.value)} placeholder="e.g. rusty metal grate" />
            <button onClick={() => removeVariant(i)}>×</button>
          </div>
        ))}
        <button onClick={addVariant}>+ Add variant</button>
      </div>
      <button disabled={busy || !stylePrompt || variants.every((v) => !v.trim())} onClick={generate}>
        {busy ? "Generating…" : `Generate ${variants.filter((v) => v.trim()).length} tiles`}
      </button>
      {error && <p className="error">Error: {error}</p>}

      {tiles && (
        <div className="tile-results">
          {tiles.map((tile, i) => (
            <div key={i} className="tile-card">
              <strong>{tile.variant}</strong>
              {tile.image_base64 ? (
                <>
                  <img
                    className="pixelated"
                    src={`data:image/png;base64,${tile.image_base64}`}
                    alt={tile.variant}
                    width={96}
                    height={96}
                  />
                  <button onClick={() => saveTile(tile)}>Save to godot/assets/tiles/</button>
                </>
              ) : (
                <p className="error">Failed: {tile.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("walkcycle");

  return (
    <div className="app">
      <h1>Sheet Forge</h1>
      <p className="subtitle">
        One prompt → a whole sheet, in one generation call. For single-image seeds and manual pixel editing, use
        Pixel Forge instead.
      </p>
      <ModeToggle mode={mode} setMode={setMode} />
      {mode === "walkcycle" ? <WalkCycleMode /> : <TilesetMode />}
    </div>
  );
}
