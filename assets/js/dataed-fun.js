/*
	DataEd easter egg: click the little database in the footer (or type "SELECT * FROM fun")
	to make it rain databases. Click again quickly to DROP TABLE.
*/
(function() {

	var colours = [
		['#632A50', '#8a4a75'],
		['#B96D40', '#d99468'],
		['#E9B44C', '#f3d08a']
	];
	var symbols = ['σ', 'π', '⋈', '∪', '∩', '÷', 'ρ', '×'];
	var keywords = ['SELECT', 'JOIN', 'GROUP BY', 'WHERE', 'COMMIT', 'INDEX', 'NULL', 'UNION'];

	var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var lastRun = 0;
	var layer, toast;

	function cylinder(c) {
		return '<svg width="40" height="48" viewBox="0 0 40 48" aria-hidden="true">' +
			'<path d="M4 8v32c0 3.3 7.2 6 16 6s16-2.7 16-6V8" fill="' + c[0] + '"/>' +
			'<ellipse cx="20" cy="8" rx="16" ry="6" fill="' + c[1] + '"/>' +
			'<path d="M4 19c0 3.3 7.2 6 16 6s16-2.7 16-6M4 30c0 3.3 7.2 6 16 6s16-2.7 16-6" fill="none" stroke="' + c[1] + '" stroke-width="1.5"/>' +
			'</svg>';
	}

	function pick(list) {
		return list[Math.floor(Math.random() * list.length)];
	}

	function getLayer() {
		if (!layer || !layer.isConnected) {
			layer = document.createElement('div');
			layer.className = 'db-rain';
			document.body.appendChild(layer);
		}
		return layer;
	}

	function drop() {
		var el = document.createElement('div');
		var c = pick(colours);
		var roll = Math.random();

		if (roll < 0.55) {
			el.className = 'db';
			el.innerHTML = cylinder(c);
			var scale = 0.6 + Math.random() * 0.9;
			el.style.width = (40 * scale) + 'px';
			el.firstChild.setAttribute('width', 40 * scale);
			el.firstChild.setAttribute('height', 48 * scale);
		}
		else if (roll < 0.8) {
			el.className = 'sym';
			el.textContent = pick(symbols);
			el.style.color = c[0];
		}
		else {
			el.className = 'kw';
			el.textContent = pick(keywords);
			el.style.background = c[0];
		}

		var x = Math.random() * window.innerWidth;
		var drift = (Math.random() - 0.5) * 200;
		var spin = (Math.random() - 0.5) * 720;
		el.style.left = x + 'px';
		getLayer().appendChild(el);

		var anim = el.animate([
			{ transform: 'translate(0, -80px) rotate(0deg)' },
			{ transform: 'translate(' + drift + 'px, ' + (window.innerHeight + 80) + 'px) rotate(' + spin + 'deg)' }
		], { duration: 2500 + Math.random() * 2000, easing: 'cubic-bezier(0.35, 0, 0.75, 1)' });
		anim.onfinish = function() { el.remove(); };
	}

	function rain() {
		for (var i = 0; i < 70; i++)
			setTimeout(drop, Math.random() * 1500);
	}

	// DROP TABLE: every database currently falling shatters into rows.
	function shatter() {
		var dbs = getLayer().querySelectorAll('.db');
		dbs.forEach(function(db) {
			var r = db.getBoundingClientRect();
			db.remove();
			if (r.top > window.innerHeight || r.bottom < 0) return;
			for (var i = 0; i < 7; i++) {
				var row = document.createElement('div');
				row.className = 'row';
				row.style.background = pick(colours)[i % 2];
				row.style.left = (r.left + r.width / 2) + 'px';
				getLayer().appendChild(row);
				var vx = (Math.random() - 0.5) * 300;
				var up = -60 - Math.random() * 120;
				var anim = row.animate([
					{ transform: 'translate(0, ' + (r.top + r.height / 2) + 'px) rotate(0deg)', opacity: 1 },
					{ transform: 'translate(' + (vx * 0.5) + 'px, ' + (r.top + up) + 'px) rotate(' + (vx) + 'deg)', opacity: 1, offset: 0.3 },
					{ transform: 'translate(' + vx + 'px, ' + (window.innerHeight + 40) + 'px) rotate(' + (vx * 3) + 'deg)', opacity: 0.6 }
				], { duration: 1400 + Math.random() * 600, easing: 'ease-in' });
				anim.onfinish = function() { this.effect.target.remove(); };
			}
		});
	}

	function say(lines) {
		if (toast) toast.remove();
		toast = document.createElement('div');
		toast.className = 'db-toast';
		toast.setAttribute('role', 'status');
		document.body.appendChild(toast);
		var mine = toast;

		var out = '';
		var li = 0, ci = 0;
		(function type() {
			if (mine !== toast) return;
			if (li >= lines.length) {
				mine.innerHTML = out;
				setTimeout(function() {
					mine.classList.add('hide');
					setTimeout(function() { mine.remove(); }, 400);
				}, 2500);
				return;
			}
			var line = lines[li];
			if (line.instant) {
				out += '<div class="' + line.cls + '">' + line.text + '</div>';
				li++;
				mine.innerHTML = out;
				setTimeout(type, 350);
				return;
			}
			ci++;
			var shown = '<div><span class="prompt">dataed&gt;</span> ' + line.text.slice(0, ci) + '<span class="cursor"></span></div>';
			mine.innerHTML = out + shown;
			if (ci >= line.text.length) {
				out += '<div><span class="prompt">dataed&gt;</span> ' + line.text + '</div>';
				li++; ci = 0;
				setTimeout(type, 300);
			}
			else
				setTimeout(type, 45);
		})();
	}

	function run() {
		var now = Date.now();
		if (now - lastRun < 5000) {
			lastRun = 0;
			say([
				{ text: 'DROP TABLE dataed;' },
				{ instant: true, cls: 'err', text: '💥 Table dropped.' },
				{ text: 'ROLLBACK;' },
				{ instant: true, cls: 'ok', text: '✓ Phew. Everything is fine.' }
			]);
			if (!reduceMotion) shatter();
			return;
		}
		lastRun = now;
		say([
			{ text: 'SELECT fun FROM dataed;' },
			{ instant: true, cls: 'ok', text: '✓ 1 row affected' }
		]);
		if (!reduceMotion) rain();
	}

	function install() {
		var menu = document.querySelector('#copyright .menu');
		if (menu) {
			var li = document.createElement('li');
			var btn = document.createElement('button');
			btn.className = 'db-egg';
			btn.type = 'button';
			btn.title = 'Run query';
			btn.setAttribute('aria-label', 'Run a database query');
			btn.textContent = '⛁';
			btn.addEventListener('click', run);
			li.appendChild(btn);
			menu.appendChild(li);
		}

		// Typing "SELECT * FROM fun" anywhere (outside form fields) also runs it.
		var typed = '';
		document.addEventListener('keydown', function(e) {
			var tag = (e.target.tagName || '').toLowerCase();
			if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
			if (e.key.length !== 1) return;
			typed = (typed + e.key.toLowerCase()).slice(-30);
			if (typed.replace(/\s+/g, ' ').slice(-17) === 'select * from fun') {
				typed = '';
				run();
			}
		});
	}

	if (document.readyState === 'loading')
		document.addEventListener('DOMContentLoaded', install);
	else
		install();

})();
