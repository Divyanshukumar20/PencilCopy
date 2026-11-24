import 'dotenv/config';
import {createRequire} from 'node:module';
import {randomUUID} from 'node:crypto';
import {readFile,mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import pg from 'pg';
const requireFrontend=createRequire(new URL('../../frontend/package.json',import.meta.url));
const {chromium,expect}=requireFrontend('@playwright/test');
const schema=`pc_ui_${randomUUID().replaceAll('-','')}`;
const control=new pg.Client({user:process.env.DB_USER,host:process.env.DB_HOST,database:process.env.DB_NAME,password:process.env.DB_PASSWORD,port:process.env.DB_PORT});
await control.connect();await control.query(`CREATE SCHEMA ${schema}`);
process.env.DB_OPTIONS=`-c search_path=${schema}`;process.env.FRONTEND_ORIGIN='http://localhost:5174';
process.env.ACCESS_TOKEN_SECRET='ui-test-access-secret';process.env.REFRESH_TOKEN_SECRET='ui-test-refresh-secret';
delete process.env.RAZORPAY_KEY_ID;delete process.env.RAZORPAY_KEY_SECRET;
const {default:pool}=await import('../db/db.js');
const {server,io,ticker}=await import('../server.js');
let vite,browser;
const frontend=fileURLToPath(new URL('../../frontend/',import.meta.url));
try {
 await pool.query(await readFile(new URL('../schema.sql',import.meta.url),'utf8'));await pool.query(await readFile(new URL('../migrations/mvp.sql',import.meta.url),'utf8'));
 const {rows:[q]}=await pool.query("INSERT INTO problems(title,subject,topic,difficulty,prompt,options,answer,explanation) VALUES('UI Modulus','Mathematics','Complex Numbers','Easy','What is |3+4i|?','[\"3\",\"4\",\"5\",\"7\"]',2,'The modulus is 5.') RETURNING *");
 await pool.query("INSERT INTO assessments(title,kind,duration_minutes,questions) VALUES('UI Mock','mock',10,$1)",[JSON.stringify([q])]);
 await new Promise(resolve=>server.listen(3001,resolve));
 vite=spawn(process.execPath,[fileURLToPath(new URL('../../frontend/node_modules/vite/bin/vite.js',import.meta.url)),'--host','localhost','--port','5174','--strictPort'],{cwd:frontend,env:{...process.env,VITE_API_URL:'http://localhost:3001'},stdio:'pipe',windowsHide:true});
 let viteErrors='';vite.stderr.on('data',b=>{viteErrors+=b;});vite.stdout.on('data',b=>{viteErrors+=b;});
 for(let i=0;i<40;i++){try{if((await fetch('http://localhost:5174')).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===39)throw new Error(`Vite unavailable: ${viteErrors}`);}
 browser=await chromium.launch({channel:process.env.TEST_BROWSER_CHANNEL||'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await mkdir(new URL('../../frontend/test-results/',import.meta.url),{recursive:true});
 for(const [route,heading] of [['login','Welcome back'],['signup','Create your account'],['about','Make the concept'],['chapters/r','Rotational Motion'],['chapters/as','Atomic Structure']]){
  await page.goto('http://localhost:5174/'+route);await expect(page.getByRole('heading',{name:new RegExp(heading)})).toBeVisible();await page.screenshot({path:frontend+'/test-results/'+route.replaceAll('/','-')+'-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,route+' mobile overflow');await page.screenshot({path:frontend+'/test-results/'+route.replaceAll('/','-')+'-mobile.png',fullPage:true});await page.setViewportSize({width:1440,height:1000});
 }
 console.log('PASS new page desktop/mobile layouts');
 await page.goto('http://localhost:5174/signup');
 await page.getByRole('textbox',{name:'Username',exact:true}).fill('ui_student');await page.getByLabel('Password',{exact:true}).fill('TestPass123!');
 await expect(page.getByRole('button',{name:'Create account',exact:true})).toBeEnabled();await page.getByRole('button',{name:'Create account',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('Your account is ready');
 await page.goto('http://localhost:5174/login');await page.getByRole('textbox',{name:'Username',exact:true}).fill('ui_student');await page.getByLabel('Password',{exact:true}).fill('TestPass123!');await page.getByRole('button',{name:'Log in',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Welcome, ui_student'})).toBeVisible();console.log('PASS signup and login dashboard');
 await page.getByRole('link',{name:'Chapters',exact:true}).click();await page.getByRole('link',{name:'Unlock',exact:true}).click();await page.getByRole('button',{name:'Unlock Chapter',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Explore the Argand Plane'})).toBeVisible();await expect(page.getByText('Your balance: 50 coins')).toHaveCount(0);
 await page.getByRole('slider',{name:/Real part/}).fill('5');await expect(page.getByText('Coordinates (5, 2)')).toBeVisible();console.log('PASS protected chapter unlock and interactive slider');
 await page.goto('http://localhost:5174/arena');await page.getByRole('link',{name:'UI Modulus'}).click();await page.getByRole('radio',{name:'C. 5',exact:true}).check();await page.getByRole('button',{name:'Submit answer'}).click();await expect(page.getByText('Correct!',{exact:true})).toBeVisible();console.log('PASS Arena answer and explanation');
 await page.getByRole('link',{name:'Mock Tests',exact:true}).click();await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('radio',{name:'5',exact:true}).click();await expect(page.getByRole('radio',{name:'5',exact:true})).toBeChecked();await expect(page.getByText(/All selected answers saved/)).toBeVisible();await page.reload();await expect(page.getByRole('radio',{name:'5',exact:true})).toBeChecked();await page.getByRole('button',{name:'Finish test'}).click();await page.getByRole('button',{name:'Confirm submission'}).click();await expect(page.getByRole('heading',{name:'Test submitted'})).toBeVisible();await expect(page.getByText('4 / 4',{exact:true})).toBeVisible();console.log('PASS mock autosave, reload, submission and result');
 await page.getByRole('link',{name:'Coin Store',exact:true}).click();await expect(page.getByText('Coin purchases are not available yet.',{exact:false})).toBeVisible();await expect(page.getByRole('button',{name:'Buy coins'}).first()).toBeDisabled();
 await page.getByRole('button',{name:'Logout',exact:true}).first().click();await page.goto('http://localhost:5174/arena');await expect(page.getByRole('textbox',{name:'Username',exact:true})).toBeVisible();console.log('PASS disabled checkout and logout route protection');
 await pool.query("UPDATE users SET role='admin' WHERE username='ui_student'");
 await page.getByRole('textbox',{name:'Username',exact:true}).fill('ui_student');await page.getByLabel('Password',{exact:true}).fill('TestPass123!');await page.getByRole('button',{name:'Log in',exact:true}).click();await page.getByRole('link',{name:'Admin',exact:true}).click();
 await page.getByLabel('Title',{exact:true}).first().fill('UI Draft');await page.getByLabel('Topic',{exact:true}).fill('Algebra');await page.getByLabel('Prompt',{exact:true}).fill('What is 2 + 2?');await page.getByLabel('Explanation',{exact:true}).fill('2 + 2 = 4.');for(const [i,v] of ['1','2','3','4'].entries())await page.getByLabel(`Option ${String.fromCharCode(65+i)}`,{exact:true}).fill(v);await page.getByLabel('Correct answer',{exact:false}).selectOption('3');await page.getByLabel('Publish in Arena',{exact:false}).uncheck();await page.getByRole('button',{name:'Save question',exact:true}).click();await expect(page.getByText('Question saved.',{exact:true})).toBeVisible();
 await page.getByLabel('Type',{exact:false}).selectOption('contest');await page.getByLabel('Title',{exact:true}).last().fill('UI Contest');
 const localDate=d=>{const x=new Date(d);return new Date(+x-x.getTimezoneOffset()*60000).toISOString().slice(0,16);};
 await page.getByLabel('Start (your local time)',{exact:true}).fill(localDate(Date.now()+120000));await page.getByLabel('End (your local time)',{exact:true}).fill(localDate(Date.now()+600000));await page.getByRole('checkbox',{name:'UI Draft (draft)'}).check();await page.getByRole('button',{name:'Publish test',exact:true}).click();await expect(page.getByText('Test published.',{exact:true})).toBeVisible();console.log('PASS admin question creation and contest scheduling');
 await page.getByRole('link',{name:'Live Contests',exact:true}).click();await page.getByRole('link',{name:'Live leaderboard',exact:true}).click();await expect(page.getByText('Live updates connected',{exact:true})).toBeVisible();console.log('PASS browser Socket.IO connection');
 await mkdir(new URL('../../frontend/test-results/',import.meta.url),{recursive:true});
 await page.goto('http://localhost:5174/dashboard');await expect(page.getByRole('heading',{name:'Welcome, ui_student'})).toBeVisible();await page.screenshot({path:frontend+'/test-results/dashboard.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:5174/chapters/cn');await expect(page.getByRole('heading',{name:'Explore the Argand Plane'})).toBeVisible();await page.getByRole('heading',{name:'Explore the Argand Plane'}).scrollIntoViewIfNeeded();await expect(page.getByRole('slider',{name:/Real part/})).toBeVisible();await expect(page.locator('.pc-header')).toHaveCSS('opacity','1');await expect(page.locator('.pc-section').first()).toHaveCSS('opacity','1');await page.screenshot({path:frontend+'/test-results/chapter-mobile.png'});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Mobile chapter must not overflow');assert.deepEqual(errors,[]);console.log('PASS mobile chapter layout and no uncaught browser errors');
}finally{
 await browser?.close();vite?.kill();clearInterval(ticker);await new Promise(r=>io.close(r));await pool.end();await control.query(`DROP SCHEMA ${schema} CASCADE`);await control.end();
}
