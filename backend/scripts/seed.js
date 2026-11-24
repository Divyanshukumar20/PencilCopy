import pool from '../db/db.js';
import {transaction} from '../lib/core.js';
const questions=[
 ['Modulus of a complex number','Mathematics','Complex Numbers','Easy','What is |3 + 4i|?',['3','4','5','7'],2,'The modulus is sqrt(3² + 4²) = 5.'],
 ['Powers of i','Mathematics','Complex Numbers','Easy','What is i raised to the power 2026?',['1','-1','i','-i'],1,'Powers repeat every 4. 2026 leaves remainder 2, so i² = -1.'],
 ['Complex conjugate product','Mathematics','Complex Numbers','Medium','If z = 2 - 3i, what is z multiplied by its conjugate?',['-5','5','13','-13'],2,'(2 - 3i)(2 + 3i) = 4 + 9 = 13.'],
 ['Projectile range','Physics','Kinematics','Easy','A projectile is launched at 10 m/s and 45° on level ground. Take g = 10 m/s². Find its range.',['5 m','10 m','20 m','25 m'],1,'R = u² sin(2θ)/g = 100/10 = 10 m.'],
 ['Rotational kinetic energy','Physics','Rotational Motion','Medium','A body has moment of inertia 2 kg m² and angular speed 3 rad/s. What is its rotational kinetic energy?',['3 J','6 J','9 J','18 J'],2,'K = ½ Iω² = ½ × 2 × 9 = 9 J.'],
 ['Moles of water','Chemistry','Mole Concept','Easy','How many moles are in 36 g of water? Use molar mass 18 g/mol.',['1','2','3','4'],1,'Number of moles = mass / molar mass = 36/18 = 2.'],
 ['Electron capacity','Chemistry','Atomic Structure','Medium','What is the maximum number of electrons in a shell with principal quantum number n = 3?',['8','9','18','32'],2,'Maximum capacity is 2n² = 2 × 9 = 18.'],
 ['Quadratic roots','Mathematics','Algebra','Easy','What is the sum of the roots of x² - 5x + 6 = 0?',['2','3','5','6'],2,'For ax² + bx + c, the sum of roots is -b/a = 5.']
];
try { await transaction(async c=>{
 for(const q of questions) await c.query('INSERT INTO problems(title,subject,topic,difficulty,prompt,options,answer,explanation) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(title) DO NOTHING',[...q.slice(0,5),JSON.stringify(q[5]),q[6],q[7]]);
 const {rows}=await c.query('SELECT * FROM problems WHERE title=ANY($1) ORDER BY id',[questions.map(q=>q[0])]);
 await c.query("INSERT INTO assessments(title,kind,duration_minutes,questions) SELECT 'PCM Starter Mock','mock',20,$1 WHERE NOT EXISTS(SELECT 1 FROM assessments WHERE title='PCM Starter Mock')",[JSON.stringify(rows)]);
 }); console.log('8 original practice questions and starter mock ready');
} finally {await pool.end();}
