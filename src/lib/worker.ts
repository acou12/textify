self.addEventListener('message', (e: MessageEvent<{ max: number }>) => {
	const max = e.data.max;
	const primes = [2];
	outer: for (let n = 3; n < max; n += 2) {
		for (const prime of primes) {
			if (n % prime === 0) {
				continue outer;
			}
		}
		primes.push(n);
	}
	postMessage(primes);
});

export {};
