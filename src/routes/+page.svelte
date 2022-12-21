<script lang="ts">
	import { onMount } from 'svelte';
	import '$lib/style.css';

	let fileInput: HTMLInputElement;
	let canvas: HTMLCanvasElement;
	let globalImage: HTMLImageElement;
	let globalData: Uint8ClampedArray;
	let globalWidth: number = 120;
	let globalSensitivity: number = 10;

	onMount(async () => {
		const worker = new (await import('$lib/worker?worker')).default();
		worker.onmessage = (e) => console.log(e);
		worker.postMessage({ max: 500_000 });
		fileInput.addEventListener('change', (e) => {
			out = '';
			const file = fileInput.files![0];
			const url = URL.createObjectURL(file);
			const image = new Image();
			globalImage = image;
			image.src = url;
			// document.body.appendChild(image);
			image.addEventListener('load', () => {
				canvas.width = image.width;
				canvas.height = image.height;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(image, 0, 0);
				const data = ctx.getImageData(0, 0, image.width, image.height).data;
				globalData = data;
				draw(data, image.width, image.height);
			});
		});
	});

	let out: string = '';

	const draw = (data: Uint8ClampedArray, width: number, height: number) => {
		const aspectRatio = (width / height) * 1.8;
		// for (let t = 10; t <= 70; t += 10) {
		for (let y = 0; y < height; y += Math.floor((height / globalWidth) * aspectRatio)) {
			for (let x = 0; x < width; x += Math.floor(width / globalWidth)) {
				let index = (y * width + x) * 4;
				let intensity = data[index];
				// out += intensity;
				out += [' ', '.', ':', '|', '=', '#'][
					Math.floor(Math.min(intensity / globalSensitivity, 5))
				];
			}
			out += '\n';
		}
		// }
	};

	const redraw = () => {
		out = '';
		draw(globalData, globalImage.width, globalImage.height);
	};
</script>

<h1>Textify</h1>
<form on:submit|preventDefault={redraw}>
	<div>
		<input type="file" name="in" id="in" bind:this={fileInput} />
	</div>
	<div>
		Width: <input
			type="range"
			name=""
			id=""
			bind:value={globalWidth}
			on:change={redraw}
			max="200"
		/>
	</div>
	<div>
		Sensitivity: <input
			type="range"
			name=""
			id=""
			bind:value={globalSensitivity}
			on:change={redraw}
		/>
	</div>
	<div>
		<!-- <input class="go" type="submit" value="redraw" /> -->
	</div>
</form>
<canvas bind:this={canvas} style="display: none" />
<code>
	<pre>
        {@html out}
    </pre>
</code>
