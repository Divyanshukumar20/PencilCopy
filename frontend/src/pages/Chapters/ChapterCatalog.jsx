import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../components/PageSurface.css';

export default function ChapterCatalog() {
	const [chapters, setChapters] = useState([]);
	const [coins, setCoins] = useState(null);
	const [error, setError] = useState('');
	const nav = useNavigate();

	useEffect(() => {
		const cfg = { withCredentials: true };

		Promise.all([
			axios.get('/api/chapters', cfg),
			axios.get('/api/chapters/wallet', cfg),
		])
			.then(([a, b]) => {
				setChapters(a.data);
				setCoins(b.data.coins);
			})
			.catch((e) => {
				if ([401, 403].includes(e.response?.status)) {
					nav('/login');
				} else {
					setError('Could not load chapters');
				}
			});
	}, [nav]);

	return (
		<main className="pc-surface">
			<div className="pc-surface-inner">
                <Link className="pc-back-link" to="/dashboard">← Your dashboard</Link>
                <div className="pc-library-heading"><div><span className="pc-eyebrow">ONE CONCEPT AT A TIME</span><h1>Chapter Library</h1><p className="pc-surface-muted">Find your next breakthrough. Explore a chapter at your own pace.</p></div><div className="pc-library-wallet"><small>YOUR BALANCE</small><strong>{coins ?? '…'} coins</strong><Link to="/store">Visit coin store →</Link></div></div>
				{error && <p role="alert" className="pc-library-error">{error}</p>}
                {!error && !chapters.length && <p role="status" className="pc-surface-muted">Loading your chapters…</p>}
				<div className="pc-library-grid">
					{chapters.map((c) => (
						<div
							key={c.id}
							className="pc-library-card"
						>
                            <div className="pc-library-symbol" aria-hidden="true">{c.slug==='cn'?'a+bi':c.slug==='r'?'ω':'e⁻'}</div>
							<small>{c.subject}</small>
							<h2>{c.title}</h2>
                            <p>{c.slug==='cn'?'Make imaginary numbers feel real with concepts, worked examples and an interactive Argand plane.':c.slug==='r'?'Build intuition for torque, angular momentum and the mechanics of rotating bodies.':'Explore atomic models, electron configurations and the structure behind matter.'}</p>
							<span className={`pc-library-status ${c.unlocked?'unlocked':''}`}>{c.slug!=='cn'?'In preparation':c.unlocked ? '✓ Unlocked' : `${c.coin_cost} coins · Permanent access`}</span>

							{c.slug === 'cn' ? (
								<Link
									className="pc-surface-button"
									to="/chapters/cn"
								>
									{c.unlocked ? 'Read chapter' : 'Unlock'}
								</Link>
							) : (
								<Link className="pc-surface-button secondary" to={`/chapters/${c.slug}`}>Chapter preview →</Link>
							)}
						</div>
					))}
				</div>
                <div className="pc-library-footer"><p>Learn the concept. Then make it stick with practice.</p><Link to="/arena">Open Problem Arena →</Link></div>
			</div>
		</main>
	);
}
