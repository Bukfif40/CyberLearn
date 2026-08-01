"use strict";

const DEFAULT_SWATCHES = [
	"#6c5ce7", "#f59e0b", "#10b981", "#9298a8", "#ef4444",
	"#dea587", "#0b0d12", "#e6e8ef", "#1d2430", "#d6b23e",
	"#3a3f4b", "#8b93ff", "#22c55e", "#38bdf8", "#f472b6", "#ffffff",
];

const state = {
	gridSize: 32,
	zoom: 16,
	pixels: null,        // Uint8ClampedArray, RGBA per cell
	tool: "pencil",
	color: [108, 92, 231, 255],
	mirrorX: false,
	showGrid: true,
	drawing: false,
	lineStart: null,
	undoStack: [],
	redoStack: [],
	swatches: [...DEFAULT_SWATCHES],
};

const els = {};

function qs(id) { return document.getElementById(id); }

function init() {
	els.checker = qs("checkerCanvas");
	els.pixel = qs("pixelCanvas");
	els.grid = qs("gridCanvas");
	els.wrap = qs("canvasWrap");
	els.zoomLabel = qs("zoomLabel");
	els.swatchesEl = qs("swatches");
	els.fileStatus = qs("fileStatus");
	els.aiStatus = qs("aiStatus");

	newCanvas(state.gridSize);
	renderSwatches();
	bindUI();
}

function newCanvas(size) {
	state.gridSize = size;
	state.pixels = new Uint8ClampedArray(size * size * 4);
	state.undoStack = [];
	state.redoStack = [];
	resizeCanvases();
	drawChecker();
	drawGrid();
	renderPixels();
}

function resizeCanvases() {
	const total = state.gridSize * state.zoom;
	for (const c of [els.checker, els.pixel, els.grid]) {
		c.width = total;
		c.height = total;
		c.style.width = total + "px";
		c.style.height = total + "px";
	}
	els.wrap.style.width = total + "px";
	els.wrap.style.height = total + "px";
	els.zoomLabel.textContent = state.zoom + "px";
}

function drawChecker() {
	const ctx = els.checker.getContext("2d");
	const z = state.zoom;
	ctx.clearRect(0, 0, els.checker.width, els.checker.height);
	for (let y = 0; y < state.gridSize; y++) {
		for (let x = 0; x < state.gridSize; x++) {
			ctx.fillStyle = (x + y) % 2 === 0 ? "#1a1d24" : "#14161c";
			ctx.fillRect(x * z, y * z, z, z);
		}
	}
}

function drawGrid() {
	const ctx = els.grid.getContext("2d");
	ctx.clearRect(0, 0, els.grid.width, els.grid.height);
	if (!state.showGrid) return;
	const z = state.zoom;
	const size = state.gridSize;
	ctx.strokeStyle = "rgba(255,255,255,0.08)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let i = 0; i <= size; i++) {
		ctx.moveTo(i * z + 0.5, 0);
		ctx.lineTo(i * z + 0.5, size * z);
		ctx.moveTo(0, i * z + 0.5);
		ctx.lineTo(size * z, i * z + 0.5);
	}
	ctx.stroke();
}

function renderPixels(overlay) {
	const ctx = els.pixel.getContext("2d");
	const z = state.zoom;
	const size = state.gridSize;
	ctx.clearRect(0, 0, els.pixel.width, els.pixel.height);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const i = (y * size + x) * 4;
			const a = state.pixels[i + 3];
			if (a === 0) continue;
			ctx.fillStyle = `rgba(${state.pixels[i]},${state.pixels[i + 1]},${state.pixels[i + 2]},${a / 255})`;
			ctx.fillRect(x * z, y * z, z, z);
		}
	}
	if (overlay) {
		for (const [x, y, rgba] of overlay) {
			ctx.fillStyle = `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${rgba[3] / 255})`;
			ctx.fillRect(x * z, y * z, z, z);
		}
	}
}

function cellIndex(x, y) { return (y * state.gridSize + x) * 4; }

function inBounds(x, y) { return x >= 0 && y >= 0 && x < state.gridSize && y < state.gridSize; }

function setCell(pixels, x, y, rgba) {
	if (!inBounds(x, y)) return;
	const i = (y * state.gridSize + x) * 4;
	pixels[i] = rgba[0];
	pixels[i + 1] = rgba[1];
	pixels[i + 2] = rgba[2];
	pixels[i + 3] = rgba[3];
}

function getCell(x, y) {
	const i = cellIndex(x, y);
	return [state.pixels[i], state.pixels[i + 1], state.pixels[i + 2], state.pixels[i + 3]];
}

function pushUndo() {
	state.undoStack.push(state.pixels.slice());
	if (state.undoStack.length > 60) state.undoStack.shift();
	state.redoStack = [];
}

function undo() {
	if (state.undoStack.length === 0) return;
	state.redoStack.push(state.pixels.slice());
	state.pixels = state.undoStack.pop();
	renderPixels();
}

function redo() {
	if (state.redoStack.length === 0) return;
	state.undoStack.push(state.pixels.slice());
	state.pixels = state.redoStack.pop();
	renderPixels();
}

function applyAt(x, y) {
	if (state.tool === "pencil") {
		setCell(state.pixels, x, y, state.color);
		if (state.mirrorX) setCell(state.pixels, state.gridSize - 1 - x, y, state.color);
	} else if (state.tool === "eraser") {
		setCell(state.pixels, x, y, [0, 0, 0, 0]);
		if (state.mirrorX) setCell(state.pixels, state.gridSize - 1 - x, y, [0, 0, 0, 0]);
	}
}

function floodFill(x, y) {
	const target = getCell(x, y).join(",");
	const replacement = state.color.join(",");
	if (target === replacement) return;
	const stack = [[x, y]];
	const size = state.gridSize;
	const visited = new Uint8Array(size * size);
	while (stack.length) {
		const [cx, cy] = stack.pop();
		if (!inBounds(cx, cy)) continue;
		const vi = cy * size + cx;
		if (visited[vi]) continue;
		if (getCell(cx, cy).join(",") !== target) continue;
		visited[vi] = 1;
		setCell(state.pixels, cx, cy, state.color);
		stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
	}
}

function bresenhamLine(x0, y0, x1, y1) {
	const points = [];
	let dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
	let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
	let err = dx + dy;
	let x = x0, y = y0;
	while (true) {
		points.push([x, y]);
		if (x === x1 && y === y1) break;
		const e2 = 2 * err;
		if (e2 >= dy) { err += dy; x += sx; }
		if (e2 <= dx) { err += dx; y += sy; }
	}
	return points;
}

function eventToCell(e) {
	const rect = els.pixel.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / state.zoom);
	const y = Math.floor((e.clientY - rect.top) / state.zoom);
	return [x, y];
}

function bindCanvasEvents() {
	els.pixel.addEventListener("mousedown", (e) => {
		const [x, y] = eventToCell(e);
		if (!inBounds(x, y)) return;

		if (state.tool === "eyedropper") {
			const c = getCell(x, y);
			if (c[3] > 0) {
				state.color = c;
				qs("colorPicker").value = rgbToHex(c);
			}
			return;
		}

		pushUndo();

		if (state.tool === "fill") {
			floodFill(x, y);
			renderPixels();
			return;
		}

		if (state.tool === "line") {
			state.lineStart = [x, y];
			state.drawing = true;
			return;
		}

		state.drawing = true;
		applyAt(x, y);
		renderPixels();
	});

	window.addEventListener("mousemove", (e) => {
		if (!state.drawing) return;
		const [x, y] = eventToCell(e);

		if (state.tool === "line" && state.lineStart) {
			const pts = bresenhamLine(state.lineStart[0], state.lineStart[1], x, y);
			const overlay = pts.filter(([px, py]) => inBounds(px, py)).map(([px, py]) => [px, py, state.color]);
			renderPixels(overlay);
			return;
		}

		if (!inBounds(x, y)) return;
		if (state.tool === "pencil" || state.tool === "eraser") {
			applyAt(x, y);
			renderPixels();
		}
	});

	window.addEventListener("mouseup", (e) => {
		if (!state.drawing) return;
		if (state.tool === "line" && state.lineStart) {
			const [x, y] = eventToCell(e);
			const pts = bresenhamLine(state.lineStart[0], state.lineStart[1], x, y);
			for (const [px, py] of pts) {
				setCell(state.pixels, px, py, state.color);
				if (state.mirrorX) setCell(state.pixels, state.gridSize - 1 - px, py, state.color);
			}
			state.lineStart = null;
			renderPixels();
		}
		state.drawing = false;
		addSwatch(rgbToHex(state.color));
	});

	els.pixel.addEventListener("contextmenu", (e) => e.preventDefault());
}

function rgbToHex([r, g, b]) {
	return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex) {
	const n = parseInt(hex.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function addSwatch(hex) {
	if (state.swatches.includes(hex)) return;
	state.swatches.unshift(hex);
	state.swatches = state.swatches.slice(0, 32);
	renderSwatches();
}

function renderSwatches() {
	els.swatchesEl.innerHTML = "";
	for (const hex of state.swatches) {
		const div = document.createElement("div");
		div.className = "swatch";
		div.style.background = hex;
		div.title = hex;
		div.addEventListener("click", () => {
			state.color = hexToRgb(hex);
			qs("colorPicker").value = hex;
		});
		els.swatchesEl.appendChild(div);
	}
}

function setTool(tool) {
	state.tool = tool;
	document.querySelectorAll(".tool-btn").forEach((b) => {
		b.classList.toggle("active", b.dataset.tool === tool);
	});
}

// --- import / export ---------------------------------------------------

function gridToCanvas(scale) {
	const size = state.gridSize;
	const base = document.createElement("canvas");
	base.width = size;
	base.height = size;
	const bctx = base.getContext("2d");
	const imgData = bctx.createImageData(size, size);
	imgData.data.set(state.pixels);
	bctx.putImageData(imgData, 0, 0);

	if (scale === 1) return base;

	const out = document.createElement("canvas");
	out.width = size * scale;
	out.height = size * scale;
	const octx = out.getContext("2d");
	octx.imageSmoothingEnabled = false;
	octx.drawImage(base, 0, 0, out.width, out.height);
	return out;
}

function loadImageIntoGrid(img) {
	pushUndo();
	const size = state.gridSize;
	const off = document.createElement("canvas");
	off.width = size;
	off.height = size;
	const ctx = off.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	ctx.clearRect(0, 0, size, size);
	ctx.drawImage(img, 0, 0, size, size);
	const data = ctx.getImageData(0, 0, size, size).data;
	state.pixels = new Uint8ClampedArray(data);
	renderPixels();
}

function downloadCanvas(canvas, filename) {
	canvas.toBlob((blob) => {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	});
}

async function saveToProject() {
	const category = qs("categorySelect").value;
	const filename = qs("filenameInput").value.trim();
	const scale = parseInt(qs("exportScaleSelect").value, 10);
	if (!filename.endsWith(".png")) {
		els.fileStatus.textContent = "Filename must end with .png";
		return;
	}
	const canvas = gridToCanvas(scale);
	const dataUrl = canvas.toDataURL("image/png");
	els.fileStatus.textContent = "Saving...";
	try {
		const res = await fetch("/api/save", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ category, filename, dataUrl }),
		});
		const body = await res.json();
		if (!res.ok) throw new Error(body.error || "save failed");
		els.fileStatus.textContent = `Saved to ${body.path}`;
	} catch (err) {
		els.fileStatus.textContent = "Error: " + err.message;
	}
}

async function generateAiSeed() {
	const prompt = qs("aiPrompt").value.trim();
	if (!prompt) {
		els.aiStatus.textContent = "Enter a prompt first.";
		return;
	}
	els.aiStatus.textContent = "Generating...";
	try {
		const res = await fetch("/api/generate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ prompt, size: state.gridSize }),
		});
		const body = await res.json();
		if (!res.ok) throw new Error(body.error || "generation failed");
		const img = new Image();
		img.onload = () => {
			loadImageIntoGrid(img);
			els.aiStatus.textContent = "Seed loaded — refine it pixel by pixel.";
		};
		img.src = "data:image/png;base64," + body.image_base64;
	} catch (err) {
		els.aiStatus.textContent = "Error: " + err.message;
	}
}

function bindUI() {
	bindCanvasEvents();

	document.querySelectorAll(".tool-btn").forEach((b) => {
		b.addEventListener("click", () => setTool(b.dataset.tool));
	});

	qs("colorPicker").addEventListener("input", (e) => {
		state.color = hexToRgb(e.target.value);
	});

	qs("mirrorX").addEventListener("change", (e) => { state.mirrorX = e.target.checked; });
	qs("showGrid").addEventListener("change", (e) => { state.showGrid = e.target.checked; drawGrid(); });

	qs("undoBtn").addEventListener("click", undo);
	qs("redoBtn").addEventListener("click", redo);

	qs("zoomInBtn").addEventListener("click", () => {
		state.zoom = Math.min(48, state.zoom * 2);
		resizeCanvases(); drawChecker(); drawGrid(); renderPixels();
	});
	qs("zoomOutBtn").addEventListener("click", () => {
		state.zoom = Math.max(4, state.zoom / 2);
		resizeCanvases(); drawChecker(); drawGrid(); renderPixels();
	});

	qs("newCanvasBtn").addEventListener("click", () => {
		const size = parseInt(qs("gridSizeSelect").value, 10);
		if (confirm("Start a new blank canvas? Unsaved work will be lost.")) newCanvas(size);
	});

	qs("importBtn").addEventListener("click", () => qs("importFile").click());
	qs("importFile").addEventListener("change", (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => loadImageIntoGrid(img);
			img.src = reader.result;
		};
		reader.readAsDataURL(file);
	});

	qs("downloadBtn").addEventListener("click", () => {
		const scale = parseInt(qs("exportScaleSelect").value, 10);
		const filename = qs("filenameInput").value.trim() || "sprite.png";
		downloadCanvas(gridToCanvas(scale), filename);
	});

	qs("saveToProjectBtn").addEventListener("click", saveToProject);
	qs("aiGenerateBtn").addEventListener("click", generateAiSeed);

	qs("clearAlphaBtn").addEventListener("click", () => setTool("eraser"));

	window.addEventListener("keydown", (e) => {
		if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
		const map = { p: "pencil", e: "eraser", f: "fill", i: "eyedropper", l: "line" };
		if (map[e.key]) { setTool(map[e.key]); return; }
		if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
		if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); }
	});
}

init();
